import { useRef, useState } from "react";
import { STORE_CATEGORIES } from "../data/storeCategories";
import {
  useInventoryStore,
  type ExcelImportSummary,
} from "../store/useInventoryStore";

export function ImportPage() {
  const productsCount = useInventoryStore((s) => s.products.length);
  const clearCatalog = useInventoryStore((s) => s.clearCatalog);
  const importExcelCatalog = useInventoryStore((s) => s.importExcelCatalog);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [replace, setReplace] = useState(true);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<ExcelImportSummary | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  const handleFile = async (file: File) => {
    if (!file.name.match(/\.xlsx?$/i)) {
      setSummary({
        inserted: 0,
        replaced: replace,
        sheetStats: [],
        categoriesUsed: [],
        warnings: [],
        errors: ["Solo se aceptan archivos Excel (.xlsx, .xls)."],
      });
      return;
    }
    setLoading(true);
    setSummary(null);
    try {
      const result = await importExcelCatalog(file, { replace });
      setSummary(result);
    } finally {
      setLoading(false);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void handleFile(file);
    e.target.value = "";
  };

  return (
    <div className="space-y-6 p-4 lg:p-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Importar Excel</h1>
        <p className="mt-1 text-sm text-slate-500">
          Subí el archivo con una pestaña por categoría (perros, VERDURAS,
          Almacen, etc.). Cada hoja se importa automáticamente.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-slate-900">Subir archivo</h2>
          <p className="mt-1 text-sm text-slate-500">
            Productos actuales:{" "}
            <span className="font-medium text-slate-700">{productsCount}</span>
          </p>

          <label className="mt-4 flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={replace}
              onChange={(e) => setReplace(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-brand-600"
            />
            <span className="text-sm text-slate-700">
              Reemplazar catálogo completo al importar
            </span>
          </label>

          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={onFileChange}
          />

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              className="btn-primary"
              disabled={loading}
              onClick={() => fileInputRef.current?.click()}
            >
              {loading ? "Importando…" : "Elegir Excel"}
            </button>
            <button
              type="button"
              className="btn-secondary"
              disabled={loading || productsCount === 0}
              onClick={() => setConfirmClear(true)}
            >
              Vaciar catálogo
            </button>
          </div>

          <p className="mt-4 text-xs text-slate-400">
            Formatos soportados: ARTICULO + COSTO + NEGOCIO, ARTICULO + X KG,
            columnas de kg/bolsa (perros/gatos), secciones dentro de una hoja
            (Carbones, Garrafas, etc.).
          </p>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-slate-900">
            Categorías del Excel ({STORE_CATEGORIES.length})
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Una pestaña por categoría. Si el Excel trae secciones extra, se
            crean automáticamente.
          </p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {STORE_CATEGORIES.map((c) => (
              <li
                key={c.id}
                className="rounded-full px-3 py-1 text-xs font-medium text-white"
                style={{ backgroundColor: c.color }}
              >
                {c.name}
              </li>
            ))}
          </ul>
        </section>
      </div>

      {summary && (
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-slate-900">Resultado</h2>
          <p className="mt-2 text-sm text-slate-600">
            {summary.replaced
              ? `${summary.inserted} productos importados (catálogo reemplazado).`
              : `${summary.inserted} productos procesados (modo combinar).`}
          </p>

          {summary.sheetStats.length > 0 && (
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-slate-500">
                    <th className="py-2 pr-4 font-medium">Pestaña</th>
                    <th className="py-2 pr-4 font-medium">Categoría</th>
                    <th className="py-2 font-medium">Productos</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.sheetStats.map((row) => (
                    <tr key={row.sheet} className="border-b border-slate-100">
                      <td className="py-2 pr-4">{row.sheet}</td>
                      <td className="py-2 pr-4">{row.category}</td>
                      <td className="py-2">{row.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {summary.warnings.length > 0 && (
            <div className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
              <p className="font-medium">Advertencias</p>
              <ul className="mt-1 list-inside list-disc">
                {summary.warnings.slice(0, 12).map((w) => (
                  <li key={w}>{w}</li>
                ))}
                {summary.warnings.length > 12 && (
                  <li>… y {summary.warnings.length - 12} más</li>
                )}
              </ul>
            </div>
          )}

          {summary.errors.length > 0 && (
            <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">
              <p className="font-medium">Errores</p>
              <ul className="mt-1 list-inside list-disc">
                {summary.errors.map((err) => (
                  <li key={err}>{err}</li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {confirmClear && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900">
              ¿Vaciar catálogo?
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Se eliminan todos los productos y se restauran las{" "}
              {STORE_CATEGORIES.length} categorías base. Esta acción no se puede
              deshacer.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setConfirmClear(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                onClick={() => {
                  clearCatalog();
                  setConfirmClear(false);
                  setSummary(null);
                }}
              >
                Vaciar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
