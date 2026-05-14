import { create } from "zustand";
import { persist } from "zustand/middleware";
import { MOCK_PRODUCTS } from "../data/mockProducts";
import { generateId } from "../lib/format";
import type {
  CartItem,
  PaymentMethod,
  Product,
  ProductInput,
  Sale,
  SaleItem,
} from "../types";

type ScanFeedback = {
  kind: "success" | "warning" | "error";
  message: string;
};

type PosState = {
  products: Product[];
  cart: CartItem[];
  sales: Sale[];
  lastScan: ScanFeedback | null;

  scanBarcode: (rawBarcode: string) => Product | null;
  addToCart: (product: Product, quantity?: number) => boolean;
  updateCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  clearScanFeedback: () => void;

  finalizeSale: (paymentMethod: PaymentMethod) => Sale | null;

  addProduct: (input: ProductInput) => Product | { error: string };
  updateProduct: (
    id: string,
    input: ProductInput
  ) => Product | { error: string };
  deleteProduct: (id: string) => void;
  adjustStock: (id: string, delta: number) => void;
  setStock: (id: string, value: number) => void;

  findByBarcode: (barcode: string) => Product | undefined;

  resetToMock: () => void;
};

function cartSubtotal(cart: CartItem[]): number {
  return cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
}

export function useCartTotals(cart: CartItem[]) {
  const subtotal = cartSubtotal(cart);
  const total = subtotal; // hook for future taxes / discounts
  const itemCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  return { subtotal, total, itemCount };
}

export const usePosStore = create<PosState>()(
  persist(
    (set, get) => ({
      products: MOCK_PRODUCTS,
      cart: [],
      sales: [],
      lastScan: null,

      findByBarcode: (barcode) => {
        const trimmed = barcode.trim();
        if (!trimmed) return undefined;
        return get().products.find((p) => p.barcode === trimmed);
      },

      scanBarcode: (rawBarcode) => {
        const code = rawBarcode.trim();
        if (!code) {
          set({
            lastScan: {
              kind: "warning",
              message: "Ingresá un código de barras.",
            },
          });
          return null;
        }
        const product = get().findByBarcode(code);
        if (!product) {
          set({
            lastScan: {
              kind: "error",
              message: `No se encontró ningún producto con el código ${code}.`,
            },
          });
          return null;
        }
        const ok = get().addToCart(product, 1);
        if (!ok) {
          return null;
        }
        set({
          lastScan: {
            kind: "success",
            message: `Agregado: ${product.name}`,
          },
        });
        return product;
      },

      addToCart: (product, quantity = 1) => {
        if (product.stock <= 0) {
          set({
            lastScan: {
              kind: "error",
              message: `"${product.name}" no tiene stock disponible.`,
            },
          });
          return false;
        }
        const cart = get().cart;
        const existing = cart.find((item) => item.productId === product.id);
        const currentQty = existing ? existing.quantity : 0;
        const targetQty = currentQty + quantity;
        if (targetQty > product.stock) {
          set({
            lastScan: {
              kind: "warning",
              message: `Stock insuficiente para "${product.name}". Disponible: ${product.stock}.`,
            },
          });
          return false;
        }
        if (existing) {
          set({
            cart: cart.map((item) =>
              item.productId === product.id
                ? { ...item, quantity: targetQty }
                : item
            ),
          });
        } else {
          set({
            cart: [
              ...cart,
              {
                productId: product.id,
                barcode: product.barcode,
                name: product.name,
                price: product.price,
                quantity,
              },
            ],
          });
        }
        return true;
      },

      updateCartQuantity: (productId, quantity) => {
        const product = get().products.find((p) => p.id === productId);
        if (!product) return;
        if (quantity <= 0) {
          get().removeFromCart(productId);
          return;
        }
        const finalQty = Math.min(quantity, product.stock);
        if (finalQty < quantity) {
          set({
            lastScan: {
              kind: "warning",
              message: `Cantidad ajustada al stock disponible (${product.stock}) de "${product.name}".`,
            },
          });
        }
        set({
          cart: get().cart.map((item) =>
            item.productId === productId
              ? { ...item, quantity: finalQty }
              : item
          ),
        });
      },

      removeFromCart: (productId) => {
        set({ cart: get().cart.filter((item) => item.productId !== productId) });
      },

      clearCart: () => set({ cart: [] }),

      clearScanFeedback: () => set({ lastScan: null }),

      finalizeSale: (paymentMethod) => {
        const { cart, products } = get();
        if (cart.length === 0) {
          set({
            lastScan: {
              kind: "warning",
              message: "El carrito está vacío.",
            },
          });
          return null;
        }
        for (const item of cart) {
          const product = products.find((p) => p.id === item.productId);
          if (!product || product.stock < item.quantity) {
            set({
              lastScan: {
                kind: "error",
                message: `Stock insuficiente al cobrar "${item.name}".`,
              },
            });
            return null;
          }
        }
        const items: SaleItem[] = cart.map((item) => ({
          productId: item.productId,
          barcode: item.barcode,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          lineTotal: item.price * item.quantity,
        }));
        const subtotal = items.reduce((acc, it) => acc + it.lineTotal, 0);
        const total = subtotal;
        const sale: Sale = {
          id: generateId("sale"),
          createdAt: new Date().toISOString(),
          items,
          subtotal,
          total,
          paymentMethod,
          itemCount: items.reduce((acc, it) => acc + it.quantity, 0),
        };
        const updatedProducts = products.map((p) => {
          const sold = cart.find((c) => c.productId === p.id);
          if (!sold) return p;
          return { ...p, stock: Math.max(0, p.stock - sold.quantity) };
        });
        set({
          products: updatedProducts,
          cart: [],
          sales: [sale, ...get().sales],
          lastScan: {
            kind: "success",
            message: `Venta finalizada por ${items.length} ítem(s).`,
          },
        });
        return sale;
      },

      addProduct: (input) => {
        const barcode = input.barcode.trim();
        if (!barcode) return { error: "El código de barras es obligatorio." };
        if (!input.name.trim()) return { error: "El nombre es obligatorio." };
        if (input.price < 0) return { error: "El precio no puede ser negativo." };
        if (input.stock < 0) return { error: "El stock no puede ser negativo." };
        const duplicate = get().products.find((p) => p.barcode === barcode);
        if (duplicate)
          return {
            error: `Ya existe un producto con el código ${barcode}.`,
          };
        const product: Product = {
          id: generateId("p"),
          barcode,
          name: input.name.trim(),
          price: Number(input.price),
          category: input.category.trim() || "Sin categoría",
          stock: Math.floor(Number(input.stock)),
          image: input.image?.trim() || undefined,
        };
        set({ products: [product, ...get().products] });
        return product;
      },

      updateProduct: (id, input) => {
        const barcode = input.barcode.trim();
        if (!barcode) return { error: "El código de barras es obligatorio." };
        if (!input.name.trim()) return { error: "El nombre es obligatorio." };
        if (input.price < 0) return { error: "El precio no puede ser negativo." };
        if (input.stock < 0) return { error: "El stock no puede ser negativo." };
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
              price: Number(input.price),
              category: input.category.trim() || "Sin categoría",
              stock: Math.floor(Number(input.stock)),
              image: input.image?.trim() || undefined,
            };
            return updated;
          }),
        });
        if (!updated) return { error: "Producto no encontrado." };
        return updated;
      },

      deleteProduct: (id) => {
        set({
          products: get().products.filter((p) => p.id !== id),
          cart: get().cart.filter((item) => item.productId !== id),
        });
      },

      adjustStock: (id, delta) => {
        set({
          products: get().products.map((p) =>
            p.id === id ? { ...p, stock: Math.max(0, p.stock + delta) } : p
          ),
        });
      },

      setStock: (id, value) => {
        set({
          products: get().products.map((p) =>
            p.id === id ? { ...p, stock: Math.max(0, Math.floor(value)) } : p
          ),
        });
      },

      resetToMock: () =>
        set({
          products: MOCK_PRODUCTS,
          cart: [],
          sales: [],
          lastScan: { kind: "success", message: "Datos restablecidos." },
        }),
    }),
    {
      name: "pos-supermarket-v1",
      partialize: (state) => ({
        products: state.products,
        cart: state.cart,
        sales: state.sales,
      }),
    }
  )
);
