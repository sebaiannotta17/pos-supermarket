import { useState } from "react";
import { useInventoryStore } from "../store/useInventoryStore";
import type { Product, ProductInput } from "../types";

type Props = {
  initial?: Product | null;
  onClose: () => void;
  onSubmit: (input: ProductInput) => string | null;
};

export function ProductFormModal({ initial, onClose, onSubmit }: Props) {
  const categories = useInventoryStore((s) => s.categories);
  const [form, setForm] = useState<ProductInput>(() =>
    initial
      ? {
          barcode: initial.barcode,
          name: initial.name,
          price: initial.price,
          cost: initial.cost,
          category: initial.category,
          image: initial.image ?? "",
        }
      : {
          barcode: "",
          name: "",
          price: 0,
          cost: 0,
          category: categories[0]?.name ?? "",
          image: "",
        }
  );
  const [error, setError] = useState<string | null>(null);

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

  const margin = form.price - form.cost;
  const marginPct = form.price > 0 ? (margin / form.price) * 100 : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-xl">
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
        <form
          onSubmit={handleSubmit}
          className="max-h-[80vh] space-y-4 overflow-y-auto px-6 py-5"
        >
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
                className="input font-mono"
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
                {categories.map((c) => (
                  <option key={c.id} value={c.name} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="label" htmlFor="cost">
                Costo
              </label>
              <input
                id="cost"
                type="number"
                min={0}
                step="0.01"
                className="input"
                value={form.cost}
                onChange={(e) => handleChange("cost", Number(e.target.value) || 0)}
              />
            </div>

            <div>
              <label className="label" htmlFor="price">
                Precio de venta
              </label>
              <input
                id="price"
                type="number"
                min={0}
                step="0.01"
                className="input"
                value={form.price}
                onChange={(e) => handleChange("price", Number(e.target.value) || 0)}
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

          {form.price > 0 && form.cost > 0 && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
              Margen estimado:{" "}
              <span
                className={
                  margin >= 0 ? "font-semibold text-emerald-700" : "font-semibold text-rose-700"
                }
              >
                {margin.toLocaleString("es-AR", {
                  style: "currency",
                  currency: "ARS",
                })}{" "}
                ({marginPct.toFixed(1)}%)
              </span>
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 border-t border-slate-200 pt-4">
            <button type="button" className="btn-secondary" onClick={onClose}>
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
