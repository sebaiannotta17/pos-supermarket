import { defaultColumnsForCategory } from "./categoryColumns";
import type { Category } from "../types";

/** Categorías según las pestañas del Excel de la tienda. */
export const STORE_CATEGORIES: Category[] = [
  { id: "cat-perros", name: "Perros", color: "#d97706", columns: defaultColumnsForCategory("Perros") },
  { id: "cat-verduras", name: "Verduras", color: "#22c55e", columns: defaultColumnsForCategory("Verduras") },
  { id: "cat-agroquimicos", name: "Agroquímicos", color: "#84cc16", columns: defaultColumnsForCategory("Agroquímicos") },
  { id: "cat-todo-suelto", name: "Todo Suelto", color: "#06b6d4", columns: defaultColumnsForCategory("Todo Suelto") },
  { id: "cat-art-limpieza", name: "Art. Limpieza", color: "#0ea5e9", columns: defaultColumnsForCategory("Art. Limpieza") },
  { id: "cat-lucero", name: "Lucero", color: "#6366f1", columns: defaultColumnsForCategory("Lucero") },
  { id: "cat-carbon", name: "Carbón", color: "#475569", columns: defaultColumnsForCategory("Carbón") },
  { id: "cat-garrafas", name: "Garrafas", color: "#334155", columns: defaultColumnsForCategory("Garrafas") },
  { id: "cat-cereales", name: "Cereales", color: "#eab308", columns: defaultColumnsForCategory("Cereales") },
  { id: "cat-bolsas", name: "Bolsas", color: "#14b8a6", columns: defaultColumnsForCategory("Bolsas") },
  { id: "cat-macetas", name: "Macetas", color: "#f97316", columns: defaultColumnsForCategory("Macetas") },
  { id: "cat-almacen", name: "Almacén", color: "#f59e0b", columns: defaultColumnsForCategory("Almacén") },
  { id: "cat-papeles", name: "Papeles", color: "#a855f7", columns: defaultColumnsForCategory("Papeles") },
  { id: "cat-gatos", name: "Gatos", color: "#ec4899", columns: defaultColumnsForCategory("Gatos") },
  { id: "cat-pajaros", name: "Pájaros", color: "#8b5cf6", columns: defaultColumnsForCategory("Pájaros") },
  { id: "cat-condimentos", name: "Condimentos", color: "#ef4444", columns: defaultColumnsForCategory("Condimentos") },
  { id: "cat-bebidas", name: "Bebidas", color: "#3b82f6", columns: defaultColumnsForCategory("Bebidas") },
];

/** Nombre de pestaña Excel → categoría en la app. */
export const SHEET_TO_CATEGORY: Record<string, string> = {
  perros: "Perros",
  PERROS: "Perros",
  VERDURAS: "Verduras",
  verduras: "Verduras",
  Agroquimicos: "Agroquímicos",
  agroquimicos: "Agroquímicos",
  "Todo Suelto": "Todo Suelto",
  "Art Limpieza": "Art. Limpieza",
  Lucero: "Lucero",
  CARBON: "Carbón",
  carbon: "Carbón",
  cereales: "Cereales",
  CEREALES: "Cereales",
  bolsas: "Bolsas",
  BOLSAS: "Bolsas",
  Macetas: "Macetas",
  macetas: "Macetas",
  Almacen: "Almacén",
  ALMACEN: "Almacén",
  Papeles: "Papeles",
  PAPELES: "Papeles",
  gatos: "Gatos",
  GATOS: "Gatos",
  pajaros: "Pájaros",
  PAJAROS: "Pájaros",
  condimentos: "Condimentos",
  CONDIMENTOS: "Condimentos",
  bebidas: "Bebidas",
  BEBIDAS: "Bebidas",
};

export function findStoreCategory(name: string): Category | undefined {
  const lower = name.toLowerCase();
  return STORE_CATEGORIES.find((c) => c.name.toLowerCase() === lower);
}
