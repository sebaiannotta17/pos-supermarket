import { useMemo, useRef, useState } from "react";
import { ProductFormModal } from "../components/ProductFormModal";
import { ProductImage } from "../components/ProductImage";
import {
  PRODUCT_CSV_TEMPLATE,
  downloadFile,
  exportProductsCsv,
  parseProductsCsv,
} from "../lib/csv";
import { formatCurrency } from "../lib/format";
import { useInventoryStore } from "../store/useInventoryStore";
import type { Product, ProductInput } from "../types";

type ImportSummary = {
  inserted: number;
  updated: number;
  errors: string[];
} | null;

export function ProductsPage() {
  const products = useInventoryStore((s) => s.products);
  const categories = useInventoryStore((s) => s.categories);
  const addProduct = useInventoryStore((s) => s.addProduct);
  const updateProduct = useInventoryStore((s) => s.updateProduct);
  const deleteProduct = useInventoryStore((s) => s.deleteProduct);
  const importProducts = useInventoryStore((s) => s.importProducts);

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Product | null>(null);
  const [importSummary, setImportSummary] = useState<ImportSummary>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleExport = () => {
    const csv = exportProductsCsv(products);
    downloadFile(`productos-${new Date().toISOString().slice(0, 10)}.csv`, csv);
  };

  const handleTemplate = () => {
    downloadFile("plantilla-productos.csv", PRODUCT_CSV_TEMPLATE);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = String(ev.target?.result ?? "");
      const { rows, errors } = parseProductsCsv(text);
      const result = importProducts(rows);
      setImportSummary({
        inserted: result.inserted,
        updated: result.updated,
        errors: [...errors, ...result.errors],
      });
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div className="space-y-4 p-4 lg:p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Productos</h1>
          <p className="text-sm text-slate-500">
            Gestión del catálogo: alta, edición, importación y exportación.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="btn-ghost border border-slate-200"
            onClick={handleTemplate}
          >
            Plantilla CSV
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => fileInputRef.current?.click()}
          >
            Importar CSV
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            type="button"
            className="btn-secondary"
            onClick={handleExport}
          >
            Exportar CSV
          </button>
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
      </div>

      {importSummary && (
        <div className="card border-l-4 border-brand-500 p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-semibold text-slate-800">
                Importación finalizada
              </p>
              <p className="text-sm text-slate-600">
                {importSummary.inserted} agregados ·{" "}
                {importSummary.updated} actualizados
                {importSummary.errors.length > 0
                  ? ` · ${importSummary.errors.length} errores`
                  : ""}
              </p>
              {importSummary.errors.length > 0 && (
                <details className="mt-2 text-xs text-rose-700">
                  <summary className="cursor-pointer font-medium">
                    Ver errores
                  </summary>
                  <ul className="mt-1 list-disc space-y-0.5 pl-5">
                    {importSummary.errors.slice(0, 20).map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                    {importSummary.errors.length > 20 && (
                      <li>… y {importSummary.errors.length - 20} más</li>
                    )}
                  </ul>
                </details>
              )}
            </div>
            <button
              type="button"
              className="text-xs text-slate-500 underline"
              onClick={() => setImportSummary(null)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      <div className="card flex flex-col gap-3 p-4 md:flex-row md:items-center">
        <input
          className="input md:flex-1"
          placeholder="Buscar por nombre o código de barras..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          className="input md:w-56"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">Todas las categorías</option>
          {categories.map((c) => (
            <option key={c.id} value={c.name}>
              {c.name}
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
              <th className="px-4 py-3 text-left font-medium">Categoría</th>
              <th className="px-4 py-3 text-right font-medium">Costo</th>
              <th className="px-4 py-3 text-right font-medium">Precio</th>
              <th className="px-4 py-3 text-right font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={5}
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
                    <div>
                      <p className="font-medium text-slate-800">{p.name}</p>
                      <p className="font-mono text-xs text-slate-500">
                        {p.barcode}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-700">{p.category}</td>
                <td className="px-4 py-3 text-right text-slate-600">
                  {formatCurrency(p.cost)}
                </td>
                <td className="px-4 py-3 text-right font-semibold text-slate-800">
                  {formatCurrency(p.price)}
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

      {open && (
        <ProductFormModal
          key={editing?.id ?? "new"}
          initial={editing}
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
              ¿Seguro que querés eliminar{" "}
              <span className="font-semibold">{confirmDelete.name}</span>?
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
