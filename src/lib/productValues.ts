import { defaultColumnsForCategory } from "../data/categoryColumns";
import type { Category, CategoryColumn, Product } from "../types";

export function findCategoryByName(
  categories: Category[],
  name: string
): Category | undefined {
  const lower = name.toLowerCase();
  return categories.find((c) => c.name.toLowerCase() === lower);
}

export function getProductValue(
  product: Product,
  columnId: string
): number | undefined {
  const v = product.values[columnId];
  return v != null && Number.isFinite(v) ? v : undefined;
}

/** Precio principal para KPIs: el de venta más representativo. */
export function primarySalePrice(product: Product, category?: Category): number {
  const order = category?.columns.map((c) => c.id) ?? [
    "negocio_bolsa",
    "negocio",
    "negocio_kg",
    "negocio_liquido",
    "negocio_bidon",
  ];
  for (const id of order) {
    const v = getProductValue(product, id);
    if (v != null && v > 0) return v;
  }
  return 0;
}

export function primaryCost(product: Product, category?: Category): number {
  const order = category?.columns.map((c) => c.id) ?? [
    "costo_bolsa",
    "costo",
    "costo_kg",
  ];
  for (const id of order) {
    const v = getProductValue(product, id);
    if (v != null && v > 0) return v;
  }
  return 0;
}

/** Migra productos viejos (cost/price) al formato values. */
export function migrateProductRow(
  raw: Record<string, unknown>,
  categories: Category[]
): Product {
  const categoryName = String(raw.category ?? "Sin categoría");
  const cat =
    findCategoryByName(categories, categoryName) ??
    ({ columns: defaultColumnsForCategory(categoryName) } as Category);

  let values: Record<string, number> = {};
  if (raw.values && typeof raw.values === "object" && !Array.isArray(raw.values)) {
    for (const [k, v] of Object.entries(raw.values as Record<string, unknown>)) {
      const n = Number(v);
      if (Number.isFinite(n)) values[k] = n;
    }
  }

  if (Object.keys(values).length === 0) {
    const cost = Number(raw.cost) || 0;
    const price = Number(raw.price) || 0;
    values = legacyCostPriceToValues(cat.columns, categoryName, cost, price);
  }

  return {
    id: String(raw.id ?? ""),
    barcode: String(raw.barcode ?? ""),
    name: String(raw.name ?? ""),
    category: categoryName,
    image:
      typeof raw.image === "string" && raw.image.trim()
        ? raw.image.trim()
        : undefined,
    values,
  };
}

function legacyCostPriceToValues(
  columns: CategoryColumn[],
  categoryName: string,
  cost: number,
  price: number
): Record<string, number> {
  const ids = new Set(columns.map((c) => c.id));
  const values: Record<string, number> = {};
  const n = categoryName.toLowerCase();

  if (n === "perros" || n === "gatos") {
    if (ids.has("costo_bolsa") && cost > 0) values.costo_bolsa = cost;
    if (ids.has("negocio_bolsa") && price > 0) values.negocio_bolsa = price;
    if (ids.has("costo_kg") && cost > 0 && !values.costo_bolsa)
      values.costo_kg = cost;
    if (ids.has("negocio_kg") && price > 0 && !values.negocio_bolsa)
      values.negocio_kg = price;
  } else if (n === "verduras") {
    if (price > 0) values.negocio_kg = price;
  } else {
    if (ids.has("costo") && cost > 0) values.costo = cost;
    if (ids.has("negocio") && price > 0) values.negocio = price;
    if (ids.has("negocio_liquido") && price > 0 && !values.negocio)
      values.negocio_liquido = price;
  }
  return values;
}

export function migrateCategoryRow(
  raw: Record<string, unknown>
): Category {
  const name = String(raw.name ?? "");
  const columnsRaw = raw.columns;
  let columns: CategoryColumn[] = defaultColumnsForCategory(name);

  if (Array.isArray(columnsRaw) && columnsRaw.length > 0) {
    columns = columnsRaw
      .filter((c) => c && typeof c === "object")
      .map((c) => {
        const o = c as Record<string, unknown>;
        return {
          id: String(o.id ?? ""),
          label: String(o.label ?? o.id ?? ""),
          kind: (o.kind === "text" ? "text" : "currency") as CategoryColumn["kind"],
        };
      })
      .filter((c) => c.id);
  }

  return {
    id: String(raw.id ?? ""),
    name,
    color: typeof raw.color === "string" && raw.color ? raw.color : "#64748b",
    columns,
  };
}

export function emptyValuesForColumns(
  columns: CategoryColumn[]
): Record<string, number> {
  const values: Record<string, number> = {};
  columns.forEach((c) => {
    values[c.id] = 0;
  });
  return values;
}
