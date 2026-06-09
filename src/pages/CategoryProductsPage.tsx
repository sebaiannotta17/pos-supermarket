import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ProductFormModal } from "../components/ProductFormModal";
import { formatCurrency } from "../lib/format";
import { getProductValue } from "../lib/productValues";
import { useInventoryStore } from "../store/useInventoryStore";
import type { Product, ProductInput } from "../types";

export function CategoryProductsPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const categories = useInventoryStore((s) => s.categories);
  const products = useInventoryStore((s) => s.products);
  const addProduct = useInventoryStore((s) => s.addProduct);
  const updateProduct = useInventoryStore((s) => s.updateProduct);
  const deleteProduct = useInventoryStore((s) => s.deleteProduct);

  const category = useMemo(
    () => categories.find((c) => c.id === categoryId),
    [categories, categoryId]
  );

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Product | null>(null);

  const filtered = useMemo(() => {
    if (!category) return [];
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      if (p.category !== category.name) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.barcode.toLowerCase().includes(q)
      );
    });
  }, [products, category, query]);

  if (!category) {
    return (
      <div className="p-6">
        <p className="text-slate-600">Categoría no encontrada.</p>
        <Link to="/categorias" className="mt-2 inline-block text-brand-600 underline">
          Volver a categorías
        </Link>
      </div>
    );
  }

  const handleSubmit = (input: ProductInput): string | null => {
    const result = editing
      ? updateProduct(editing.id, input)
      : addProduct({ ...input, category: category.name });
    if ("error" in result) return result.error;
    return null;
  };

  return (
    <div className="space-y-4 p-4 lg:p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <Link
            to="/categorias"
            className="text-sm font-medium text-brand-700 hover:underline"
          >
            ← Categorías
          </Link>
          <div className="mt-2 flex items-center gap-3">
            <span
              className="h-10 w-10 rounded-lg"
              style={{ background: category.color }}
            />
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {category.name}
              </h1>
              <p className="text-sm text-slate-500">
                {filtered.length} producto{filtered.length !== 1 ? "s" : ""} ·{" "}
                {category.columns.length} columnas
              </p>
            </div>
          </div>
        </div>
        <button
          type="button"
          className="btn-primary"
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          + Nuevo artículo
        </button>
      </div>

      <div className="card p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Columnas de esta categoría
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
            Artículo
          </span>
          {category.columns.map((col) => (
            <span
              key={col.id}
              className="rounded-full px-3 py-1 text-xs font-medium text-white"
              style={{ backgroundColor: category.color }}
            >
              {col.label}
            </span>
          ))}
        </div>
      </div>

      <div className="card flex flex-col gap-3 p-4 md:flex-row md:items-center">
        <input
          className="input md:flex-1"
          placeholder="Buscar artículo..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="card overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Artículo</th>
              {category.columns.map((col) => (
                <th
                  key={col.id}
                  className="px-4 py-3 text-right font-medium whitespace-nowrap"
                >
                  {col.label}
                </th>
              ))}
              <th className="px-4 py-3 text-right font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={category.columns.length + 2}
                  className="px-4 py-8 text-center text-sm text-slate-400"
                >
                  No hay productos en esta categoría.
                </td>
              </tr>
            )}
            {filtered.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-800">{p.name}</p>
                  <p className="font-mono text-xs text-slate-500">{p.barcode}</p>
                </td>
                {category.columns.map((col) => {
                  const v = getProductValue(p, col.id);
                  return (
                    <td
                      key={col.id}
                      className="px-4 py-3 text-right text-slate-700 whitespace-nowrap"
                    >
                      {v != null && v > 0 ? formatCurrency(v) : "—"}
                    </td>
                  );
                })}
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      className="rounded p-2 text-slate-600 hover:bg-slate-100"
                      onClick={() => {
                        setEditing(p);
                        setOpen(true);
                      }}
                      aria-label="Editar"
                    >
                      ✎
                    </button>
                    <button
                      type="button"
                      className="rounded p-2 text-rose-600 hover:bg-rose-50"
                      onClick={() => setConfirmDelete(p)}
                      aria-label="Eliminar"
                    >
                      🗑
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && (
        <ProductFormModal
          key={editing?.id ?? "new"}
          initial={editing}
          fixedCategory={category}
          onClose={() => setOpen(false)}
          onSubmit={handleSubmit}
        />
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setConfirmDelete(null)}
          />
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900">
              Eliminar producto
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              ¿Eliminar <span className="font-semibold">{confirmDelete.name}</span>
              ?
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setConfirmDelete(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn-danger"
                onClick={() => {
                  deleteProduct(confirmDelete.id);
                  setConfirmDelete(null);
                }}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
