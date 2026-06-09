import { useState } from "react";
import { useInventoryStore } from "../store/useInventoryStore";
import {
  emptyValuesForColumns,
  findCategoryByName,
  primaryCost,
  primarySalePrice,
} from "../lib/productValues";
import type { Category, CategoryColumn, Product, ProductInput } from "../types";

type Props = {
  initial?: Product | null;
  fixedCategory?: Category;
  onClose: () => void;
  onSubmit: (input: ProductInput) => string | null;
};

export function ProductFormModal({
  initial,
  fixedCategory,
  onClose,
  onSubmit,
}: Props) {
  const categories = useInventoryStore((s) => s.categories);

  const [categoryName, setCategoryName] = useState(
    fixedCategory?.name ?? initial?.category ?? categories[0]?.name ?? ""
  );
  const activeCategory =
    fixedCategory ??
    findCategoryByName(categories, categoryName) ??
    categories[0];

  const [form, setForm] = useState<ProductInput>(() => {
    if (initial) {
      return {
        barcode: initial.barcode,
        name: initial.name,
        category: initial.category,
        image: initial.image ?? "",
        values: { ...initial.values },
      };
    }
    const cat = fixedCategory ?? categories[0];
    return {
      barcode: "",
      name: "",
      category: cat?.name ?? "",
      image: "",
      values: cat ? emptyValuesForColumns(cat.columns) : {},
    };
  });
  const [error, setError] = useState<string | null>(null);

  const columns = activeCategory?.columns ?? [];

  const setValue = (columnId: string, value: number) => {
    setForm((prev) => ({
      ...prev,
      values: { ...prev.values, [columnId]: value },
    }));
  };

  const handleCategoryChange = (name: string) => {
    setCategoryName(name);
    const cat = findCategoryByName(categories, name);
    if (!cat) return;
    setForm((prev) => ({
      ...prev,
      category: name,
      values: emptyValuesForColumns(cat.columns),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = onSubmit({
      ...form,
      category: fixedCategory?.name ?? categoryName,
    });
    if (result) {
      setError(result);
      return;
    }
    onClose();
  };

  const previewProduct: Product = {
    id: "preview",
    ...form,
    category: fixedCategory?.name ?? categoryName,
  };
  const sale = primarySalePrice(previewProduct, activeCategory);
  const cost = primaryCost(previewProduct, activeCategory);
  const margin = sale - cost;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold">
            {initial ? "Editar artículo" : "Nuevo artículo"}
            {activeCategory ? ` — ${activeCategory.name}` : ""}
          </h2>
          <button
            type="button"
            className="rounded p-1 text-slate-400 hover:bg-slate-100"
            onClick={onClose}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>
        <form
          onSubmit={handleSubmit}
          className="max-h-[80vh] space-y-4 overflow-y-auto px-6 py-5"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="label">Artículo</label>
              <input
                className="input"
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
                required
                placeholder="Nombre y peso / marca"
              />
            </div>

            <div>
              <label className="label">Código</label>
              <input
                className="input font-mono"
                value={form.barcode}
                onChange={(e) =>
                  setForm((p) => ({ ...p, barcode: e.target.value }))
                }
                required
              />
            </div>

            {!fixedCategory && (
              <div>
                <label className="label">Categoría</label>
                <select
                  className="input"
                  value={categoryName}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {columns.map((col) => (
              <ColumnField
                key={col.id}
                column={col}
                value={form.values[col.id] ?? 0}
                onChange={(v) => setValue(col.id, v)}
              />
            ))}
          </div>

          {sale > 0 && cost > 0 && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
              Margen estimado:{" "}
              <span className="font-semibold text-emerald-700">
                {margin.toLocaleString("es-AR", {
                  style: "currency",
                  currency: "ARS",
                })}
              </span>
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              {initial ? "Guardar" : "Crear"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ColumnField({
  column,
  value,
  onChange,
}: {
  column: CategoryColumn;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <label className="label">{column.label}</label>
      <input
        type="number"
        min={0}
        step="1"
        className="input"
        value={value || ""}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
      />
    </div>
  );
}
