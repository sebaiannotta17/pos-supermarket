import { useMemo, useState } from "react";
import { ProductFormModal } from "../components/ProductFormModal";
import { ProductImage } from "../components/ProductImage";
import { formatCurrency } from "../lib/format";
import { usePosStore } from "../store/usePosStore";
import type { Product, ProductInput } from "../types";

export function ProductsPage() {
  const products = usePosStore((s) => s.products);
  const addProduct = usePosStore((s) => s.addProduct);
  const updateProduct = usePosStore((s) => s.updateProduct);
  const deleteProduct = usePosStore((s) => s.deleteProduct);

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Product | null>(null);

  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category));
    return Array.from(set).sort();
  }, [products]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      const matchQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.barcode.toLowerCase().includes(q);
      const matchCategory = !category || p.category === category;
      return matchQuery && matchCategory;
    });
  }, [products, query, category]);

  const handleSubmit = (input: ProductInput): string | null => {
    const result = editing
      ? updateProduct(editing.id, input)
      : addProduct(input);
    if ("error" in result) return result.error;
    return null;
  };

  return (
    <div className="space-y-4 p-4 lg:p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Productos</h1>
          <p className="text-sm text-slate-500">
            Gestioná el catálogo del supermercado.
          </p>
        </div>
        <button
          type="button"
          className="btn-primary"
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          + Nuevo producto
        </button>
      </div>

      <div className="card flex flex-col gap-3 p-4 md:flex-row md:items-center">
        <input
          className="input md:flex-1"
          placeholder="Buscar por nombre o código de barras..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          className="input md:w-60"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">Todas las categorías</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <span className="text-sm text-slate-500 md:whitespace-nowrap">
          {filtered.length} de {products.length}
        </span>
      </div>

      <div className="card overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Producto</th>
              <th className="px-4 py-3 text-left font-medium">Código</th>
              <th className="px-4 py-3 text-left font-medium">Categoría</th>
              <th className="px-4 py-3 text-right font-medium">Precio</th>
              <th className="px-4 py-3 text-right font-medium">Stock</th>
              <th className="px-4 py-3 text-right font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-sm text-slate-400"
                >
                  No se encontraron productos.
                </td>
              </tr>
            )}
            {filtered.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <ProductImage
                      src={p.image}
                      alt={p.name}
                      className="h-12 w-12 flex-shrink-0"
                    />
                    <span className="font-medium text-slate-800">{p.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-slate-600">
                  {p.barcode}
                </td>
                <td className="px-4 py-3 text-slate-700">{p.category}</td>
                <td className="px-4 py-3 text-right font-semibold text-slate-800">
                  {formatCurrency(p.price)}
                </td>
                <td className="px-4 py-3 text-right">
                  <span
                    className={`badge ${
                      p.stock > 5
                        ? "bg-emerald-100 text-emerald-700"
                        : p.stock > 0
                          ? "bg-amber-100 text-amber-700"
                          : "bg-rose-100 text-rose-700"
                    }`}
                  >
                    {p.stock}
                  </span>
                </td>
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
                      <svg
                        viewBox="0 0 24 24"
                        width="16"
                        height="16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      className="rounded p-2 text-rose-600 hover:bg-rose-50"
                      onClick={() => setConfirmDelete(p)}
                      aria-label="Eliminar"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        width="16"
                        height="16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6" />
                        <path d="M10 11v6M14 11v6" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ProductFormModal
        open={open}
        initial={editing}
        onClose={() => setOpen(false)}
        onSubmit={handleSubmit}
      />

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
              ¿Seguro que querés eliminar{" "}
              <span className="font-semibold">{confirmDelete.name}</span>? Esta
              acción no se puede deshacer.
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
