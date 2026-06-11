import { useMemo } from "react";
import { create } from "zustand";

import { DEFAULT_CATEGORIES, MOCK_PRODUCTS } from "../data/mockProducts";
import { defaultColumnsForCategory } from "../data/categoryColumns";
import { parseExcelCatalog } from "../lib/excelImport";
import { generateId } from "../lib/format";
import {
  findCategoryByName,
  primaryCost,
  primarySalePrice,
} from "../lib/productValues";
import type {
  Category,
  CategoryInput,
  Product,
  ProductInput,
} from "../types";

type Feedback = {
  kind: "success" | "warning" | "error";
  message: string;
};

export type ExcelImportSummary = {
  inserted: number;
  replaced: boolean;
  sheetStats: { sheet: string; category: string; count: number }[];
  categoriesUsed: string[];
  warnings: string[];
  errors: string[];
};

type InventoryState = {
  products: Product[];
  categories: Category[];
  lastFeedback: Feedback | null;

  setFeedback: (f: Feedback | null) => void;
  clearFeedback: () => void;

  findByBarcode: (barcode: string) => Product | undefined;
  findById: (id: string) => Product | undefined;
  getCategoryById: (id: string) => Category | undefined;

  addProduct: (input: ProductInput) => Product | { error: string };
  updateProduct: (
    id: string,
    input: ProductInput
  ) => Product | { error: string };
  deleteProduct: (id: string) => void;

  addCategory: (input: CategoryInput) => Category | { error: string };
  updateCategory: (
    id: string,
    input: CategoryInput
  ) => Category | { error: string };
  deleteCategory: (id: string) => { error: string } | { ok: true };

  importProducts: (rows: ProductInput[]) => {
    inserted: number;
    updated: number;
    errors: string[];
  };

  clearCatalog: () => void;
  importExcelCatalog: (
    file: File,
    options?: { replace?: boolean }
  ) => Promise<ExcelImportSummary>;

  resetAll: () => void;
};

const EXTRA_COLORS = [
  "#64748b",
  "#78716c",
  "#059669",
  "#7c3aed",
  "#db2777",
  "#0891b2",
];

function colorForCategory(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return EXTRA_COLORS[Math.abs(hash) % EXTRA_COLORS.length];
}

function ensureCategories(names: string[]): void {
  const state = useInventoryStore.getState();
  const existing = new Set(state.categories.map((c) => c.name.toLowerCase()));
  for (const name of names) {
    if (existing.has(name.toLowerCase())) continue;
    state.addCategory({
      name,
      color: colorForCategory(name),
      columns: defaultColumnsForCategory(name),
    });
    existing.add(name.toLowerCase());
  }
}

export const useInventoryStore = create<InventoryState>()((set, get) => ({
  products: MOCK_PRODUCTS,
  categories: DEFAULT_CATEGORIES,
  lastFeedback: null,

  setFeedback: (f) => set({ lastFeedback: f }),
  clearFeedback: () => set({ lastFeedback: null }),

  findByBarcode: (barcode) => {
    const trimmed = barcode.trim();
    if (!trimmed) return undefined;
    return get().products.find((p) => p.barcode === trimmed);
  },

  findById: (id) => get().products.find((p) => p.id === id),

  getCategoryById: (id) => get().categories.find((c) => c.id === id),

  addProduct: (input) => {
    const validation = validateProduct(input, get().categories);
    if (validation) return { error: validation };
    const barcode = input.barcode.trim();
    const duplicate = get().products.find((p) => p.barcode === barcode);
    if (duplicate)
      return { error: `Ya existe un producto con el código ${barcode}.` };
    const product: Product = {
      id: generateId("p"),
      barcode,
      name: input.name.trim(),
      category: input.category.trim() || "Sin categoría",
      image: input.image?.trim() || undefined,
      values: sanitizeValues(input.values),
    };
    set({ products: [product, ...get().products] });
    return product;
  },

  updateProduct: (id, input) => {
    const validation = validateProduct(input, get().categories);
    if (validation) return { error: validation };
    const barcode = input.barcode.trim();
    const duplicate = get().products.find(
      (p) => p.barcode === barcode && p.id !== id
    );
    if (duplicate)
      return {
        error: `Ya existe otro producto con el código ${barcode}.`,
      };
    let updated: Product | undefined;
    set({
      products: get().products.map((p) => {
        if (p.id !== id) return p;
        updated = {
          ...p,
          barcode,
          name: input.name.trim(),
          category: input.category.trim() || "Sin categoría",
          image: input.image?.trim() || undefined,
          values: sanitizeValues(input.values),
        };
        return updated;
      }),
    });
    if (!updated) return { error: "Producto no encontrado." };
    return updated;
  },

  deleteProduct: (id) => {
    set({ products: get().products.filter((p) => p.id !== id) });
  },

  addCategory: (input) => {
    const name = input.name.trim();
    if (!name) return { error: "El nombre es obligatorio." };
    if (!input.columns?.length)
      return { error: "Elegí al menos una columna para la categoría." };
    const exists = get().categories.find(
      (c) => c.name.toLowerCase() === name.toLowerCase()
    );
    if (exists) return { error: "Ya existe una categoría con ese nombre." };
    const cat: Category = {
      id: generateId("cat"),
      name,
      color: input.color || "#64748b",
      columns: input.columns,
    };
    set({ categories: [...get().categories, cat] });
    return cat;
  },

  updateCategory: (id, input) => {
    const name = input.name.trim();
    if (!name) return { error: "El nombre es obligatorio." };
    if (!input.columns?.length)
      return { error: "Elegí al menos una columna para la categoría." };
    const exists = get().categories.find(
      (c) => c.name.toLowerCase() === name.toLowerCase() && c.id !== id
    );
    if (exists) return { error: "Ya existe otra categoría con ese nombre." };
    const previous = get().categories.find((c) => c.id === id);
    if (!previous) return { error: "Categoría no encontrada." };
    const updated: Category = {
      ...previous,
      name,
      color: input.color || previous.color,
      columns: input.columns,
    };
    set({
      categories: get().categories.map((c) => (c.id === id ? updated : c)),
      products:
        previous.name !== name
          ? get().products.map((p) =>
              p.category === previous.name ? { ...p, category: name } : p
            )
          : get().products,
    });
    return updated;
  },

  deleteCategory: (id) => {
    const cat = get().categories.find((c) => c.id === id);
    if (!cat) return { error: "Categoría no encontrada." };
    const inUse = get().products.some((p) => p.category === cat.name);
    if (inUse)
      return {
        error: `No se puede eliminar "${cat.name}" porque hay productos asignados.`,
      };
    set({ categories: get().categories.filter((c) => c.id !== id) });
    return { ok: true };
  },

  importProducts: (rows) => {
    let inserted = 0;
    let updated = 0;
    const errors: string[] = [];
    const productsByBarcode = new Map(get().products.map((p) => [p.barcode, p]));

    rows.forEach((raw, idx) => {
      const validation = validateProduct(raw, get().categories);
      if (validation) {
        errors.push(`Fila ${idx + 1}: ${validation}`);
        return;
      }
      const barcode = raw.barcode.trim();
      const existing = productsByBarcode.get(barcode);
      if (existing) {
        const result = get().updateProduct(existing.id, raw);
        if ("error" in result) {
          errors.push(`Fila ${idx + 1}: ${result.error}`);
        } else {
          updated += 1;
          productsByBarcode.set(barcode, result);
        }
      } else {
        const result = get().addProduct(raw);
        if ("error" in result) {
          errors.push(`Fila ${idx + 1}: ${result.error}`);
        } else {
          inserted += 1;
          productsByBarcode.set(barcode, result);
        }
      }
    });

    return { inserted, updated, errors };
  },

  clearCatalog: () =>
    set({
      products: [],
      categories: DEFAULT_CATEGORIES,
      lastFeedback: {
        kind: "success",
        message: "Catálogo vaciado. Podés importar un Excel nuevo.",
      },
    }),

  importExcelCatalog: async (file, options) => {
    const replace = options?.replace ?? true;
    const errors: string[] = [];

    try {
      const parsed = await parseExcelCatalog(file);
      ensureCategories(parsed.categoriesUsed);

      if (replace) {
        const products: Product[] = parsed.products.map((p) => ({
          id: generateId("p"),
          ...p,
          values: sanitizeValues(p.values),
        }));
        set({
          products,
          lastFeedback: {
            kind: "success",
            message: `Importados ${products.length} productos desde Excel.`,
          },
        });
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("catalog-flush-save"));
        }
        return {
          inserted: products.length,
          replaced: true,
          sheetStats: parsed.sheetStats,
          categoriesUsed: parsed.categoriesUsed,
          warnings: parsed.warnings,
          errors,
        };
      }

      const result = get().importProducts(parsed.products);
      set({
        lastFeedback: {
          kind: result.errors.length ? "warning" : "success",
          message: `Importados ${result.inserted} nuevos, ${result.updated} actualizados.`,
        },
      });
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("catalog-flush-save"));
      }
      return {
        inserted: result.inserted + result.updated,
        replaced: false,
        sheetStats: parsed.sheetStats,
        categoriesUsed: parsed.categoriesUsed,
        warnings: parsed.warnings,
        errors: [...errors, ...result.errors],
      };
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "No se pudo leer el archivo Excel.";
      errors.push(message);
      set({
        lastFeedback: { kind: "error", message },
      });
      return {
        inserted: 0,
        replaced: replace,
        sheetStats: [],
        categoriesUsed: [],
        warnings: [],
        errors,
      };
    }
  },

  resetAll: () =>
    set({
      products: MOCK_PRODUCTS,
      categories: DEFAULT_CATEGORIES,
      lastFeedback: { kind: "success", message: "Datos restablecidos." },
    }),
}));

function sanitizeValues(values: Record<string, number>): Record<string, number> {
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(values)) {
    out[k] = Number(v) || 0;
  }
  return out;
}

function validateProduct(
  input: ProductInput,
  categories: Category[]
): string | null {
  if (!input.barcode.trim()) return "El código de barras es obligatorio.";
  if (!input.name.trim()) return "El nombre es obligatorio.";
  const cat = findCategoryByName(categories, input.category);
  for (const col of cat?.columns ?? []) {
    const v = input.values[col.id];
    if (v != null && v < 0) return `${col.label} no puede ser negativo.`;
  }
  const hasValue = Object.values(input.values ?? {}).some((v) => v > 0);
  if (!hasValue) return "Completá al menos un precio.";
  return null;
}

export function useCatalogStats() {
  const products = useInventoryStore((s) => s.products);
  const categories = useInventoryStore((s) => s.categories);

  return useMemo(() => {
    const avgPrice =
      products.length > 0
        ? products.reduce((a, p) => {
            const cat = findCategoryByName(categories, p.category);
            return a + primarySalePrice(p, cat);
          }, 0) / products.length
        : 0;
    const avgMargin =
      products.length > 0
        ? products.reduce((a, p) => {
            const cat = findCategoryByName(categories, p.category);
            return (
              a + (primarySalePrice(p, cat) - primaryCost(p, cat))
            );
          }, 0) / products.length
        : 0;
    const byCategory = [...categories].map((c) => ({
      id: c.id,
      name: c.name,
      count: products.filter((p) => p.category === c.name).length,
    }));

    return {
      productsCount: products.length,
      categoriesCount: categories.length,
      avgPrice,
      avgMargin,
      byCategory: byCategory.sort((a, b) => b.count - a.count),
    };
  }, [products, categories]);
}
