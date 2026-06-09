import Papa from "papaparse";
import { defaultColumnsForCategory } from "../data/categoryColumns";
import type { Product, ProductInput } from "../types";

export function exportProductsCsv(products: Product[]): string {
  const fields = ["barcode", "name", "category", "values", "image"];
  return Papa.unparse({
    fields,
    data: products.map((p) => [
      p.barcode,
      p.name,
      p.category,
      JSON.stringify(p.values),
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
    const category = (raw.category ?? "Sin categoría").trim() || "Sin categoría";
    let values: Record<string, number> = {};

    if (raw.values) {
      try {
        const parsed = JSON.parse(raw.values) as Record<string, unknown>;
        for (const [k, v] of Object.entries(parsed)) {
          values[k] = Number(v) || 0;
        }
      } catch {
        errors.push(`Línea ${idx + 2}: values no es JSON válido.`);
      }
    } else if (raw.price != null || raw.cost != null) {
      const cost = parseNumber(raw.cost);
      const price = parseNumber(raw.price);
      const cols = defaultColumnsForCategory(category);
      if (cols.some((c) => c.id === "costo")) values.costo = cost;
      if (cols.some((c) => c.id === "negocio")) values.negocio = price;
      if (cols.some((c) => c.id === "negocio_kg") && !values.negocio)
        values.negocio_kg = price || cost;
    }

    rows.push({
      barcode,
      name,
      category,
      values,
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

export function downloadFile(
  filename: string,
  content: string,
  mime = "text/csv"
) {
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

export const PRODUCT_CSV_TEMPLATE =
  'barcode,name,category,values,image\n7790000000001,Producto Ejemplo,Almacén,"{""costo"":1000,""negocio"":1500}",\n';
