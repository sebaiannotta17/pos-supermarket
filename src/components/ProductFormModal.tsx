import { useEffect, useState } from "react";
import type { Product, ProductInput } from "../types";
import { CATEGORIES } from "../data/mockProducts";

type Props = {
  open: boolean;
  initial?: Product | null;
  onClose: () => void;
  onSubmit: (input: ProductInput) => string | null;
};

const empty: ProductInput = {
  barcode: "",
  name: "",
  price: 0,
  category: CATEGORIES[0],
  stock: 0,
  image: "",
};

export function ProductFormModal({ open, initial, onClose, onSubmit }: Props) {
  const [form, setForm] = useState<ProductInput>(empty);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setForm(
        initial
          ? {
              barcode: initial.barcode,
              name: initial.name,
              price: initial.price,
              category: initial.category,
              stock: initial.stock,
              image: initial.image ?? "",
            }
          : empty
      );
      setError(null);
    }
  }, [open, initial]);

  if (!open) return null;

  const handleChange = <K extends keyof ProductInput>(
    key: K,
    value: ProductInput[K]
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = onSubmit(form);
    if (result) {
      setError(result);
      return;
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold">
            {initial ? "Editar producto" : "Nuevo producto"}
          </h2>
          <button
            type="button"
            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            onClick={onClose}
            aria-label="Cerrar"
          >
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="label" htmlFor="name">
                Nombre
              </label>
              <input
                id="name"
                className="input"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label" htmlFor="barcode">
                Código de barras
              </label>
              <input
                id="barcode"
                className="input"
                value={form.barcode}
                onChange={(e) => handleChange("barcode", e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label" htmlFor="category">
                Categoría
              </label>
              <input
                id="category"
                list="category-options"
                className="input"
                value={form.category}
                onChange={(e) => handleChange("category", e.target.value)}
              />
              <datalist id="category-options">
                {CATEGORIES.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
            <div>
              <label className="label" htmlFor="price">
                Precio
              </label>
              <input
                id="price"
                type="number"
                min={0}
                step="0.01"
                className="input"
                value={form.price}
                onChange={(e) =>
                  handleChange("price", Number(e.target.value) || 0)
                }
                required
              />
            </div>
            <div>
              <label className="label" htmlFor="stock">
                Stock
              </label>
              <input
                id="stock"
                type="number"
                min={0}
                step="1"
                className="input"
                value={form.stock}
                onChange={(e) =>
                  handleChange("stock", Number(e.target.value) || 0)
                }
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="label" htmlFor="image">
                URL de imagen (opcional)
              </label>
              <input
                id="image"
                className="input"
                value={form.image ?? ""}
                onChange={(e) => handleChange("image", e.target.value)}
                placeholder="https://..."
              />
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 border-t border-slate-200 pt-4">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              {initial ? "Guardar cambios" : "Crear producto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
