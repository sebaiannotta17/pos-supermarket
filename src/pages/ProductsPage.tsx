import { useEffect, useMemo, useRef, useState } from "react";
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

function productToInput(
  p: Product,
  patch: Partial<Pick<ProductInput, "price" | "stock">>
): ProductInput {
  return {
    barcode: p.barcode,
    name: p.name,
    category: p.category,
    price: patch.price ?? p.price,
    cost: p.cost,
    stock: patch.stock ?? p.stock,
    minStock: p.minStock,
    image: p.image ?? "",
  };
}

function InlinePriceField({ product }: { product: Product }) {
  const updateProduct = useInventoryStore((s) => s.updateProduct);
  const setFeedback = useInventoryStore((s) => s.setFeedback);
  const [str, setStr] = useState(() => String(product.price));

  const commit = () => {
    const normalized = str.replace(/\s/g, "").replace(",", ".");
    const n = Number(normalized);
    if (!Number.isFinite(n) || n < 0) {
      setStr(String(product.price));
      setFeedback({ kind: "warning", message: "Precio inválido." });
      return;
    }
    if (Math.abs(n - product.price) < 0.005) {
      setStr(String(product.price));
      return;
    }
    const result = updateProduct(product.id, productToInput(product, { price: n }));
    if ("error" in result) {
      setStr(String(product.price));
      setFeedback({ kind: "error", message: result.error });
      return;
    }
  };

  return (
    <input
      type="text"
      inputMode="decimal"
      title="Enter o clic afuera para guardar"
      aria-label={`Precio de ${product.name}`}
      className="w-full min-w-[6.5rem] max-w-[9rem] rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-right text-sm font-semibold text-slate-800 tabular-nums shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 ml-auto block"
      value={str}
      onChange={(e) => setStr(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          (e.target as HTMLInputElement).blur();
        }
        if (e.key === "Escape") {
          setStr(String(product.price));
          (e.target as HTMLInputElement).blur();
        }
      }}
    />
  );
}

function InlineStockField({ product }: { product: Product }) {
  const updateProduct = useInventoryStore((s) => s.updateProduct);
  const setFeedback = useInventoryStore((s) => s.setFeedback);
  const [str, setStr] = useState(() => String(product.stock));

  const commit = () => {
    const n = Math.floor(Number(str.replace(/\s/g, "").replace(",", ".")));
    if (!Number.isFinite(n) || n < 0) {
      setStr(String(product.stock));
      setFeedback({ kind: "warning", message: "Stock inválido." });
      return;
    }
    if (n === product.stock) {
      setStr(String(product.stock));
      return;
    }
    const result = updateProduct(product.id, productToInput(product, { stock: n }));
    if ("error" in result) {
      setStr(String(product.stock));
      setFeedback({ kind: "error", message: result.error });
      return;
    }
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      title="Enter o clic afuera para guardar"
      aria-label={`Stock de ${product.name}`}
      className="w-full min-w-[3.25rem] max-w-[5rem] rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-right text-sm font-semibold tabular-nums shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 ml-auto block"
      value={str}
      onChange={(e) => setStr(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          (e.target as HTMLInputElement).blur();
        }
        if (e.key === "Escape") {
          setStr(String(product.stock));
          (e.target as HTMLInputElement).blur();
        }
      }}
    />
  );
}

export function ProductsPage() {
  const products = useInventoryStore((s) => s.products);
  const categories = useInventoryStore((s) => s.categories);
  const lastFeedback = useInventoryStore((s) => s.lastFeedback);
  const addProduct = useInventoryStore((s) => s.addProduct);
  const updateProduct = useInventoryStore((s) => s.updateProduct);
  const deleteProduct = useInventoryStore((s) => s.deleteProduct);
  const importProducts = useInventoryStore((s) => s.importProducts);
  const clearFeedback = useInventoryStore((s) => s.clearFeedback);

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("");
  const [stockFilter, setStockFilter] = useState<"all" | "ok" | "low" | "out">(
    "all"
  );
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Product | null>(null);
  const [importSummary, setImportSummary] = useState<ImportSummary>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!lastFeedback) return;
    const t = setTimeout(() => clearFeedback(), 4000);
    return () => clearTimeout(t);
  }, [lastFeedback, clearFeedback]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      const matchQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.barcode.toLowerCase().includes(q);
      const matchCategory = !category || p.category === category;
      const matchStock =
        stockFilter === "all"
          ? true
          : stockFilter === "out"
            ? p.stock === 0
            : stockFilter === "low"
              ? p.stock > 0 && p.stock <= p.minStock
              : p.stock > p.minStock;
      return matchQuery && matchCategory && matchStock;
    });
  }, [products, query, category, stockFilter]);

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
            Gestioná el catálogo: alta, edición, importación y exportación. Podés
            cambiar <strong className="font-medium text-slate-700">precio</strong>{" "}
            y <strong className="font-medium text-slate-700">stock</strong>{" "}
            directo en la tabla (Enter o clic afuera para guardar).
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

      {lastFeedback && (
        <div
          className={`rounded-lg border px-3 py-2 text-sm ${
            lastFeedback.kind === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : lastFeedback.kind === "warning"
                ? "border-amber-200 bg-amber-50 text-amber-800"
                : "border-rose-200 bg-rose-50 text-rose-800"
          }`}
          role="status"
        >
          <div className="flex items-start justify-between gap-2">
            <span>{lastFeedback.message}</span>
            <button
              type="button"
              className="shrink-0 text-xs underline opacity-70 hover:opacity-100"
              onClick={() => clearFeedback()}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

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
        <select
          className="input md:w-48"
          value={stockFilter}
          onChange={(e) =>
            setStockFilter(e.target.value as typeof stockFilter)
          }
        >
          <option value="all">Todo el stock</option>
          <option value="ok">Stock OK</option>
          <option value="low">Stock bajo</option>
          <option value="out">Agotados</option>
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
              <th className="px-4 py-3 text-right font-medium">
                Precio{" "}
                <span className="block text-[10px] font-normal normal-case text-slate-400">
                  editable
                </span>
              </th>
              <th className="px-4 py-3 text-right font-medium">
                Stock{" "}
                <span className="block text-[10px] font-normal normal-case text-slate-400">
                  editable
                </span>
              </th>
              <th className="px-4 py-3 text-right font-medium">Min</th>
              <th className="px-4 py-3 text-right font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-8 text-center text-sm text-slate-400"
                >
                  No se encontraron productos.
                </td>
              </tr>
            )}
            {filtered.map((p) => {
              return (
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
                  <td className="px-4 py-3 text-right align-middle">
                    <InlinePriceField key={`pf-${p.id}-${p.price}`} product={p} />
                  </td>
                  <td className="px-4 py-3 text-right align-middle">
                    <InlineStockField key={`sf-${p.id}-${p.stock}`} product={p} />
                  </td>
                  <td className="px-4 py-3 text-right text-slate-500">
                    {p.minStock}
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
              );
            })}
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
              <span className="font-semibold">{confirmDelete.name}</span>? Los
              movimientos previos quedarán en el historial.
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
