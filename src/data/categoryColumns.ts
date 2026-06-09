import type { CategoryColumn } from "../types";

/** Columnas disponibles para armar categorías. */
export const COLUMN_CATALOG: CategoryColumn[] = [
  { id: "costo_kg", label: "Costo por KG", kind: "currency" },
  { id: "negocio_kg", label: "Negocio por KG", kind: "currency" },
  { id: "costo_bolsa", label: "Costo por Bolsa", kind: "currency" },
  { id: "negocio_bolsa", label: "Negocio por Bolsa", kind: "currency" },
  { id: "costo", label: "Costo", kind: "currency" },
  { id: "negocio", label: "Negocio", kind: "currency" },
  { id: "negocio_liquido", label: "Negocio (solo líquido)", kind: "currency" },
  { id: "negocio_bidon", label: "Negocio (con bidón)", kind: "currency" },
];

export const COLUMN_BY_ID = Object.fromEntries(
  COLUMN_CATALOG.map((c) => [c.id, c])
) as Record<string, CategoryColumn>;

export const COLUMN_PRESETS: {
  id: string;
  label: string;
  columnIds: string[];
}[] = [
  {
    id: "kg_bolsa",
    label: "Alimentos — KG y Bolsa (Perros/Gatos)",
    columnIds: ["costo_kg", "negocio_kg", "costo_bolsa", "negocio_bolsa"],
  },
  {
    id: "costo_negocio",
    label: "Costo + Negocio",
    columnIds: ["costo", "negocio"],
  },
  {
    id: "solo_kg",
    label: "Solo precio por KG (Verduras)",
    columnIds: ["negocio_kg"],
  },
  {
    id: "todo_suelto",
    label: "Todo Suelto — líquido y bidón",
    columnIds: ["costo", "negocio_liquido", "negocio_bidon"],
  },
];

export function columnsFromIds(ids: string[]): CategoryColumn[] {
  return ids
    .map((id) => COLUMN_BY_ID[id])
    .filter((c): c is CategoryColumn => c != null);
}

/** Columnas por defecto según el nombre de categoría de la tienda. */
export function defaultColumnsForCategory(name: string): CategoryColumn[] {
  const n = name.toLowerCase();
  if (n === "perros" || n === "gatos") {
    return columnsFromIds(COLUMN_PRESETS[0].columnIds);
  }
  if (n === "verduras") {
    return columnsFromIds(COLUMN_PRESETS[2].columnIds);
  }
  if (n === "todo suelto") {
    return columnsFromIds(COLUMN_PRESETS[3].columnIds);
  }
  return columnsFromIds(COLUMN_PRESETS[1].columnIds);
}
