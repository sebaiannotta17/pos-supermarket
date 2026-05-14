import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_CATEGORIES, MOCK_PRODUCTS } from "../data/mockProducts";
import { generateId } from "../lib/format";
import type {
  Category,
  CategoryInput,
  Product,
  ProductInput,
  RecordMovementInput,
  StockMovement,
  StockStatus,
} from "../types";

type Feedback = {
  kind: "success" | "warning" | "error";
  message: string;
};

type InventoryState = {
  products: Product[];
  categories: Category[];
  movements: StockMovement[];
  lastFeedback: Feedback | null;

  setFeedback: (f: Feedback | null) => void;
  clearFeedback: () => void;

  findByBarcode: (barcode: string) => Product | undefined;
  findById: (id: string) => Product | undefined;
  getStockStatus: (product: Product) => StockStatus;

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

  recordMovement: (
    input: RecordMovementInput
  ) => StockMovement | { error: string };

  importProducts: (rows: ProductInput[]) => {
    inserted: number;
    updated: number;
    errors: string[];
  };

  resetAll: () => void;
};

export const useInventoryStore = create<InventoryState>()(
  persist(
    (set, get) => ({
      products: MOCK_PRODUCTS,
      categories: DEFAULT_CATEGORIES,
      movements: [],
      lastFeedback: null,

      setFeedback: (f) => set({ lastFeedback: f }),
      clearFeedback: () => set({ lastFeedback: null }),

      findByBarcode: (barcode) => {
        const trimmed = barcode.trim();
        if (!trimmed) return undefined;
        return get().products.find((p) => p.barcode === trimmed);
      },

      findById: (id) => get().products.find((p) => p.id === id),

      getStockStatus: (p) => {
        if (p.stock <= 0) return "out";
        if (p.stock <= p.minStock) return "low";
        return "ok";
      },

      addProduct: (input) => {
        const validation = validateProduct(input);
        if (validation) return { error: validation };
        const barcode = input.barcode.trim();
        const duplicate = get().products.find((p) => p.barcode === barcode);
        if (duplicate)
          return { error: `Ya existe un producto con el código ${barcode}.` };
        const product: Product = {
          id: generateId("p"),
          barcode,
          name: input.name.trim(),
          price: Number(input.price) || 0,
          cost: Number(input.cost) || 0,
          category: input.category.trim() || "Sin categoría",
          stock: Math.max(0, Math.floor(Number(input.stock) || 0)),
          minStock: Math.max(0, Math.floor(Number(input.minStock) || 0)),
          image: input.image?.trim() || undefined,
        };
        set({ products: [product, ...get().products] });
        return product;
      },

      updateProduct: (id, input) => {
        const validation = validateProduct(input);
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
              price: Number(input.price) || 0,
              cost: Number(input.cost) || 0,
              category: input.category.trim() || "Sin categoría",
              stock: Math.max(0, Math.floor(Number(input.stock) || 0)),
              minStock: Math.max(0, Math.floor(Number(input.minStock) || 0)),
              image: input.image?.trim() || undefined,
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
        const exists = get().categories.find(
          (c) => c.name.toLowerCase() === name.toLowerCase()
        );
        if (exists) return { error: "Ya existe una categoría con ese nombre." };
        const cat: Category = {
          id: generateId("cat"),
          name,
          color: input.color || "#64748b",
        };
        set({ categories: [...get().categories, cat] });
        return cat;
      },

      updateCategory: (id, input) => {
        const name = input.name.trim();
        if (!name) return { error: "El nombre es obligatorio." };
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

      recordMovement: (input) => {
        const product = get().products.find((p) => p.id === input.productId);
        if (!product) return { error: "Producto no encontrado." };
        const balanceBefore = product.stock;
        let delta: number;
        let quantity = Math.abs(Math.floor(Number(input.quantity) || 0));

        if (input.type === "in") {
          if (quantity <= 0)
            return { error: "La cantidad debe ser mayor a 0." };
          delta = quantity;
        } else if (input.type === "out") {
          if (quantity <= 0)
            return { error: "La cantidad debe ser mayor a 0." };
          if (quantity > balanceBefore)
            return {
              error: `Stock insuficiente. Disponible: ${balanceBefore}.`,
            };
          delta = -quantity;
        } else {
          const target = Math.max(
            0,
            Math.floor(Number(input.newStock ?? 0))
          );
          delta = target - balanceBefore;
          quantity = Math.abs(delta);
          if (delta === 0)
            return {
              error: "El nuevo stock es igual al actual, no hay ajuste.",
            };
        }

        const balanceAfter = balanceBefore + delta;
        const movement: StockMovement = {
          id: generateId("mov"),
          createdAt: new Date().toISOString(),
          productId: product.id,
          productName: product.name,
          productBarcode: product.barcode,
          type: input.type,
          quantity,
          reason: input.reason,
          note: input.note?.trim() || undefined,
          unitCost:
            input.type === "in" && input.unitCost && input.unitCost > 0
              ? Number(input.unitCost)
              : undefined,
          balanceBefore,
          balanceAfter,
        };

        set({
          products: get().products.map((p) =>
            p.id === product.id ? { ...p, stock: balanceAfter } : p
          ),
          movements: [movement, ...get().movements],
        });

        return movement;
      },

      importProducts: (rows) => {
        let inserted = 0;
        let updated = 0;
        const errors: string[] = [];

        const productsByBarcode = new Map(
          get().products.map((p) => [p.barcode, p])
        );

        rows.forEach((raw, idx) => {
          const validation = validateProduct(raw);
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

      resetAll: () => {
        set({
          products: MOCK_PRODUCTS,
          categories: DEFAULT_CATEGORIES,
          movements: [],
          lastFeedback: { kind: "success", message: "Datos restablecidos." },
        });
      },
    }),
    {
      name: "inventory-store-v2",
      partialize: (state) => ({
        products: state.products,
        categories: state.categories,
        movements: state.movements,
      }),
    }
  )
);

function validateProduct(input: ProductInput): string | null {
  if (!input.barcode.trim()) return "El código de barras es obligatorio.";
  if (!input.name.trim()) return "El nombre es obligatorio.";
  if (Number(input.price) < 0) return "El precio no puede ser negativo.";
  if (Number(input.cost) < 0) return "El costo no puede ser negativo.";
  if (Number(input.stock) < 0) return "El stock no puede ser negativo.";
  if (Number(input.minStock) < 0)
    return "El stock mínimo no puede ser negativo.";
  return null;
}

export function useInventoryKpis() {
  return useInventoryStore((state) => {
    const products = state.products;
    const totalUnits = products.reduce((acc, p) => acc + p.stock, 0);
    const inventoryValueByCost = products.reduce(
      (acc, p) => acc + p.stock * p.cost,
      0
    );
    const inventoryValueByPrice = products.reduce(
      (acc, p) => acc + p.stock * p.price,
      0
    );
    const lowStock = products.filter(
      (p) => p.stock > 0 && p.stock <= p.minStock
    );
    const outOfStock = products.filter((p) => p.stock === 0);
    return {
      productsCount: products.length,
      totalUnits,
      inventoryValueByCost,
      inventoryValueByPrice,
      lowStockCount: lowStock.length,
      outOfStockCount: outOfStock.length,
      lowStock,
      outOfStock,
    };
  });
}
