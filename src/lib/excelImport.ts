import * as XLSX from "xlsx";
import { SHEET_TO_CATEGORY } from "../data/storeCategories";
import type { ProductInput } from "../types";

export type ExcelImportResult = {
  products: ProductInput[];
  categoriesUsed: string[];
  sheetStats: { sheet: string; category: string; count: number }[];
  warnings: string[];
};

type RowCells = (string | number | undefined)[];

function cellStr(v: unknown): string {
  if (v == null) return "";
  return String(v).trim();
}

function parseNum(v: unknown): number | null {
  if (v == null || v === "") return null;
  if (typeof v === "number" && Number.isFinite(v)) return v;
  const s = String(v)
    .replace(/\s/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function resolveSheetCategory(sheetName: string): string {
  const direct = SHEET_TO_CATEGORY[sheetName];
  if (direct) return direct;
  const lower = sheetName.toLowerCase();
  for (const [key, val] of Object.entries(SHEET_TO_CATEGORY)) {
    if (key.toLowerCase() === lower) return val;
  }
  return sheetName.trim();
}

function normalizeSectionTitle(raw: string): string {
  let t = raw.trim();
  t = t.replace(/\s+x\s+\d+\s*%?\s*$/i, "").trim();
  t = t.replace(/\s+\d+\s*%\s*$/i, "").trim();
  if (/^ALIMENTOS\s+PERROS/i.test(t)) return "Perros";
  if (/^ALIMENTOS\s+GATOS/i.test(t)) return "Gatos";
  if (/^AGROQUIMICOS/i.test(t)) return "Agroquímicos";
  if (/^CEREALES/i.test(t)) return "Cereales";
  if (/^BOLSAS/i.test(t)) return "Bolsas";
  if (/^MACETAS/i.test(t)) return "Macetas";
  if (/^CARBONES/i.test(t)) return "Carbones";
  if (/^GARRAFAS/i.test(t)) return "Garrafas";
  if (/^ROLLOS DE COCINA/i.test(t)) return "Rollos de cocina";
  if (/^TODO SUELTO/i.test(t)) return "Todo Suelto";
  if (/^CONDIMENTOS/i.test(t)) return "Condimentos";
  if (/^BEBIDAS/i.test(t)) return "Bebidas";
  if (/^PAJAROS/i.test(t)) return "Pájaros";
  return t;
}

function isHeaderRow(cells: RowCells): boolean {
  const a = cellStr(cells[0]).toLowerCase();
  const b = cellStr(cells[1]).toLowerCase();
  const c = cellStr(cells[2]).toLowerCase();
  if (a === "articulo" || a === "artículo") return true;
  if (b.includes("costo") && (c.includes("negocio") || c.includes("precio")))
    return true;
  if (b === "x kg" || c === "x kg") return true;
  return false;
}

function isSectionTitleRow(cells: RowCells): boolean {
  const name = cellStr(cells[0]);
  if (!name || name.length < 2) return false;
  if (isHeaderRow(cells)) return false;
  const lower = name.toLowerCase();
  if (lower === "articulo" || lower === "artículo") return false;
  if (lower === "costo" || lower === "negocio") return false;

  const nums = [1, 2, 3, 4].map((i) => parseNum(cells[i]));
  const hasPrice = nums.some((n) => n != null && n > 0);
  if (hasPrice) return false;

  if (
    name.length <= 60 &&
    (/%/.test(name) ||
      /^[A-ZÁÉÍÓÚÑ\s\d]+$/u.test(name) ||
      /^(Carbones|Garrafas|Macetas|Cereales|Bolsas|Condimentos|Bebidas|Pajaros|Pájaros|Todo Suelto|Rollos)/i.test(
        name
      ))
  ) {
    return true;
  }
  return false;
}

function extractPrices(cells: RowCells): { cost: number; price: number } | null {
  const b = parseNum(cells[1]);
  const c = parseNum(cells[2]);
  const d = parseNum(cells[3]);
  const e = parseNum(cells[4]);

  // Perros/gatos: kg (B,C) y bolsa (D,E) — usar precio de bolsa si existe
  if (e != null && e > 0) {
    return { cost: d ?? b ?? 0, price: e };
  }

  // Estándar: COSTO | NEGOCIO
  if (b != null && c != null && c > 0) {
    return { cost: b, price: c };
  }

  // Macetas: columna B vacía, costo en C y precio en D
  if (c != null && d != null && d > 0 && (b == null || b === 0)) {
    return { cost: c, price: d };
  }

  // Agroquímicos: COSTO en B, NEGOCIO en D (C vacía)
  if (b != null && d != null && d > 0 && (c == null || c === 0)) {
    return { cost: b, price: d };
  }

  // Verduras: solo X KG en B
  if (b != null && b > 0) {
    return { cost: 0, price: b };
  }

  // Fallback: dos números en la fila
  const nums = [b, c, d, e].filter((n): n is number => n != null && n > 0);
  if (nums.length >= 2) {
    const sorted = [...nums].sort((x, y) => x - y);
    return { cost: sorted[0], price: sorted[sorted.length - 1] };
  }
  if (nums.length === 1) {
    return { cost: 0, price: nums[0] };
  }
  return null;
}

function slugPart(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 28);
}

function makeBarcode(category: string, name: string, index: number): string {
  const base = `EX-${slugPart(category)}-${slugPart(name)}`.slice(0, 40);
  return index > 0 ? `${base}-${index}` : base;
}

function parseSheet(
  sheetName: string,
  rows: RowCells[],
  warnings: string[]
): { products: ProductInput[]; category: string; count: number } {
  let category = resolveSheetCategory(sheetName);
  const products: ProductInput[] = [];
  const barcodeCount = new Map<string, number>();

  for (let i = 0; i < rows.length; i++) {
    const cells = rows[i];
    if (!cells || cells.every((c) => cellStr(c) === "")) continue;

    if (isHeaderRow(cells)) continue;

    if (isSectionTitleRow(cells)) {
      category = normalizeSectionTitle(cellStr(cells[0]));
      continue;
    }

    const name = cellStr(cells[0]);
    if (!name || name.length < 2) continue;
    if (/^(articulo|costo|negocio)$/i.test(name)) continue;

    const prices = extractPrices(cells);
    if (!prices) {
      warnings.push(`Hoja "${sheetName}" fila ${i + 1}: sin precio — "${name}"`);
      continue;
    }

    const key = `${category}::${name}`;
    const dup = barcodeCount.get(key) ?? 0;
    barcodeCount.set(key, dup + 1);

    products.push({
      barcode: makeBarcode(category, name, dup),
      name,
      category,
      cost: prices.cost,
      price: prices.price,
    });
  }

  return { products, category: resolveSheetCategory(sheetName), count: products.length };
}

export async function parseExcelCatalog(file: File): Promise<ExcelImportResult> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array", cellDates: false });

  const allProducts: ProductInput[] = [];
  const sheetStats: ExcelImportResult["sheetStats"] = [];
  const categoriesUsed = new Set<string>();
  const warnings: string[] = [];

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) continue;

    const raw = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
      header: 1,
      defval: "",
      raw: true,
    }) as RowCells[];

    const { products, category, count } = parseSheet(sheetName, raw, warnings);
    if (count === 0) {
      warnings.push(`Hoja "${sheetName}": no se encontraron productos.`);
      continue;
    }

    products.forEach((p) => categoriesUsed.add(p.category));
    allProducts.push(...products);
    sheetStats.push({ sheet: sheetName, category, count });
  }

  if (allProducts.length === 0) {
    warnings.push("No se importó ningún producto. Revisá que el Excel tenga el formato esperado.");
  }

  return {
    products: allProducts,
    categoriesUsed: [...categoriesUsed].sort(),
    sheetStats,
    warnings,
  };
}
