import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  COLUMN_CATALOG,
  COLUMN_PRESETS,
  columnsFromIds,
} from "../data/categoryColumns";
import { useInventoryStore } from "../store/useInventoryStore";
import type { Category, CategoryInput } from "../types";

const COLOR_PRESETS = [
  "#ef4444",
  "#f59e0b",
  "#eab308",
  "#10b981",
  "#22c55e",
  "#06b6d4",
  "#0ea5e9",
  "#3b82f6",
  "#a855f7",
  "#ec4899",
  "#64748b",
  "#0f172a",
];

export function CategoriesPage() {
  const categories = useInventoryStore((s) => s.categories);
  const products = useInventoryStore((s) => s.products);
  const addCategory = useInventoryStore((s) => s.addCategory);
  const updateCategory = useInventoryStore((s) => s.updateCategory);
  const deleteCategory = useInventoryStore((s) => s.deleteCategory);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [confirm, setConfirm] = useState<Category | null>(null);
  const [error, setError] = useState<string | null>(null);

  const productCount = useMemo(() => {
    const counts = new Map<string, number>();
    products.forEach((p) => {
      counts.set(p.category, (counts.get(p.category) ?? 0) + 1);
    });
    return counts;
  }, [products]);

  const handleSubmit = (input: CategoryInput): string | null => {
    const result = editing
      ? updateCategory(editing.id, input)
      : addCategory(input);
    if ("error" in result) return result.error;
    return null;
  };

  return (
    <div className="space-y-4 p-4 lg:p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Categorías</h1>
          <p className="text-sm text-slate-500">
            Cada categoría tiene sus propias columnas de precios. Entrá a una
            para ver solo esa información.
          </p>
        </div>
        <button
          type="button"
          className="btn-primary"
          onClick={() => {
            setEditing(null);
            setError(null);
            setOpen(true);
          }}
        >
          + Nueva categoría
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {categories.length === 0 && (
          <div className="card col-span-full p-8 text-center text-sm text-slate-400">
            No hay categorías. Creá la primera.
          </div>
        )}
        {categories.map((c) => {
          const count = productCount.get(c.name) ?? 0;
          return (
            <div key={c.id} className="card flex flex-col p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span
                    className="h-10 w-10 rounded-lg"
                    style={{ background: c.color }}
                  />
                  <div>
                    <p className="font-semibold text-slate-900">{c.name}</p>
                    <p className="text-xs text-slate-500">
                      {count} producto{count !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    className="rounded p-2 text-slate-600 hover:bg-slate-100"
                    onClick={() => {
                      setEditing(c);
                      setError(null);
                      setOpen(true);
                    }}
                    aria-label="Editar"
                  >
                    ✎
                  </button>
                  <button
                    type="button"
                    className="rounded p-2 text-rose-600 hover:bg-rose-50"
                    onClick={() => setConfirm(c)}
                    aria-label="Eliminar"
                  >
                    🗑
                  </button>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-1">
                <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600">
                  Artículo
                </span>
                {c.columns.map((col) => (
                  <span
                    key={col.id}
                    className="rounded px-2 py-0.5 text-[10px] text-white"
                    style={{ backgroundColor: c.color }}
                  >
                    {col.label}
                  </span>
                ))}
              </div>

              <Link
                to={`/categorias/${c.id}`}
                className="btn-secondary mt-4 w-full text-center text-sm"
              >
                Ver productos →
              </Link>
            </div>
          );
        })}
      </div>

      {open && (
        <CategoryModal
          initial={editing}
          onClose={() => setOpen(false)}
          onSubmit={handleSubmit}
          serverError={error}
        />
      )}

      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setConfirm(null)}
          />
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900">
              Eliminar categoría
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              ¿Eliminar la categoría{" "}
              <span className="font-semibold">{confirm.name}</span>?
            </p>
            {error && (
              <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {error}
              </div>
            )}
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setConfirm(null);
                  setError(null);
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn-danger"
                onClick={() => {
                  const result = deleteCategory(confirm.id);
                  if ("error" in result) {
                    setError(result.error);
                    return;
                  }
                  setConfirm(null);
                  setError(null);
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

function CategoryModal({
  initial,
  onClose,
  onSubmit,
  serverError,
}: {
  initial: Category | null;
  onClose: () => void;
  onSubmit: (input: CategoryInput) => string | null;
  serverError: string | null;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [color, setColor] = useState(initial?.color ?? COLOR_PRESETS[0]);
  const [selectedIds, setSelectedIds] = useState<string[]>(
    initial?.columns.map((c) => c.id) ??
      COLUMN_PRESETS[1].columnIds
  );
  const [error, setError] = useState<string | null>(serverError);

  const selectedColumns = columnsFromIds(selectedIds);

  const applyPreset = (columnIds: string[]) => {
    setSelectedIds(columnIds);
  };

  const toggleColumn = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = onSubmit({
      name,
      color,
      columns: selectedColumns,
    });
    if (result) {
      setError(result);
      return;
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <form
        onSubmit={handleSubmit}
        className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
      >
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">
            {initial ? "Editar categoría" : "Nueva categoría"}
          </h2>
        </div>

        <div className="space-y-4 overflow-y-auto px-6 py-4">
          <div>
            <label className="label">Nombre</label>
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div>
            <label className="label">Color</label>
            <div className="flex flex-wrap gap-2">
              {COLOR_PRESETS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`h-8 w-8 rounded-lg ring-offset-2 transition ${
                    color === c ? "ring-2 ring-slate-900" : "ring-0"
                  }`}
                  style={{ background: c }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="label">Plantillas rápidas</label>
            <div className="flex flex-wrap gap-2">
              {COLUMN_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
                  onClick={() => applyPreset(preset.columnIds)}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Columnas (además de Artículo)</label>
            <p className="mb-2 text-xs text-slate-500">
              Elegí qué precios lleva esta categoría.
            </p>
            <div className="space-y-2">
              {COLUMN_CATALOG.map((col) => (
                <label
                  key={col.id}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 px-3 py-2 hover:bg-slate-50"
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(col.id)}
                    onChange={() => toggleColumn(col.id)}
                    className="h-4 w-4 rounded border-slate-300 text-brand-600"
                  />
                  <span className="text-sm text-slate-800">{col.label}</span>
                </label>
              ))}
            </div>
          </div>

          {selectedColumns.length > 0 && (
            <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
              Vista previa: Artículo ·{" "}
              {selectedColumns.map((c) => c.label).join(" · ")}
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-200 px-6 py-4">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn-primary">
            {initial ? "Guardar" : "Crear"}
          </button>
        </div>
      </form>
    </div>
  );
}
