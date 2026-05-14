import Papa from "papaparse";
import type { Product, ProductInput, StockMovement } from "../types";
import { MOVEMENT_REASON_LABEL, MOVEMENT_TYPE_LABEL } from "../types";

const PRODUCT_HEADERS = [
  "barcode",
  "name",
  "category",
  "price",
  "cost",
  "stock",
  "minStock",
  "image",
] as const;

export function exportProductsCsv(products: Product[]): string {
  return Papa.unparse({
    fields: [...PRODUCT_HEADERS],
    data: products.map((p) => [
      p.barcode,
      p.name,
      p.category,
      p.price,
      p.cost,
      p.stock,
      p.minStock,
      p.image ?? "",
    ]),
  });
}

export type ParseProductsResult = {
  rows: ProductInput[];
  errors: string[];
};

export function parseProductsCsv(text: string): ParseProductsResult {
  const result = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: "greedy",
    transformHeader: (h) => h.trim(),
  });

  const errors: string[] = [];
  result.errors.forEach((err) => {
    errors.push(`Línea ${err.row != null ? err.row + 2 : "?"}: ${err.message}`);
  });

  const rows: ProductInput[] = [];
  result.data.forEach((raw, idx) => {
    const barcode = (raw.barcode ?? "").trim();
    const name = (raw.name ?? "").trim();
    if (!barcode && !name) return;
    if (!barcode) {
      errors.push(`Línea ${idx + 2}: falta el código de barras.`);
      return;
    }
    if (!name) {
      errors.push(`Línea ${idx + 2}: falta el nombre.`);
      return;
    }
    rows.push({
      barcode,
      name,
      category: (raw.category ?? "Sin categoría").trim() || "Sin categoría",
      price: parseNumber(raw.price),
      cost: parseNumber(raw.cost),
      stock: Math.floor(parseNumber(raw.stock)),
      minStock: Math.floor(parseNumber(raw.minStock)),
      image: (raw.image ?? "").trim() || undefined,
    });
  });

  return { rows, errors };
}

function parseNumber(value: string | undefined): number {
  if (!value) return 0;
  const normalized = value.replace(/\./g, "").replace(",", ".").trim();
  const n = Number(normalized);
  return Number.isFinite(n) ? n : 0;
}

export function exportMovementsCsv(movements: StockMovement[]): string {
  return Papa.unparse({
    fields: [
      "id",
      "createdAt",
      "type",
      "reason",
      "productBarcode",
      "productName",
      "quantity",
      "balanceBefore",
      "balanceAfter",
      "unitCost",
      "note",
    ],
    data: movements.map((m) => [
      m.id,
      m.createdAt,
      MOVEMENT_TYPE_LABEL[m.type],
      MOVEMENT_REASON_LABEL[m.reason],
      m.productBarcode,
      m.productName,
      m.quantity,
      m.balanceBefore,
      m.balanceAfter,
      m.unitCost ?? "",
      m.note ?? "",
    ]),
  });
}

export function downloadFile(filename: string, content: string, mime = "text/csv") {
  const blob = new Blob([`\uFEFF${content}`], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export const PRODUCT_CSV_TEMPLATE = `${PRODUCT_HEADERS.join(",")}\n7790000000001,Producto Ejemplo,Almacén,1500,1000,20,5,\n`;
