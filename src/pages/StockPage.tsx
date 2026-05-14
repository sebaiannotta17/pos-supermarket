import { useMemo, useState } from "react";
import { ProductImage } from "../components/ProductImage";
import { usePosStore } from "../store/usePosStore";

export function StockPage() {
  const products = usePosStore((s) => s.products);
  const adjustStock = usePosStore((s) => s.adjustStock);
  const setStock = usePosStore((s) => s.setStock);

  const [filter, setFilter] = useState<"all" | "low" | "out">("all");
  const [query, setQuery] = useState("");

  const stats = useMemo(() => {
    const totalUnits = products.reduce((acc, p) => acc + p.stock, 0);
    const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 5).length;
    const outOfStock = products.filter((p) => p.stock === 0).length;
    return { totalUnits, lowStock, outOfStock };
  }, [products]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products
      .filter((p) => {
        if (filter === "low") return p.stock > 0 && p.stock <= 5;
        if (filter === "out") return p.stock === 0;
        return true;
      })
      .filter(
        (p) =>
          !q ||
          p.name.toLowerCase().includes(q) ||
          p.barcode.toLowerCase().includes(q)
      )
      .sort((a, b) => a.stock - b.stock);
  }, [products, filter, query]);

  return (
    <div className="space-y-4 p-4 lg:p-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Stock</h1>
        <p className="text-sm text-slate-500">
          Controlá inventario y ajustá cantidades en segundos.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <StatCard
          label="Productos"
          value={products.length.toString()}
          color="bg-brand-50 text-brand-700"
        />
        <StatCard
          label="Unidades en stock"
          value={stats.totalUnits.toString()}
          color="bg-sky-50 text-sky-700"
        />
        <StatCard
          label="Stock bajo / agotado"
          value={`${stats.lowStock} / ${stats.outOfStock}`}
          color="bg-amber-50 text-amber-700"
        />
      </div>

      <div className="card flex flex-col gap-3 p-4 md:flex-row md:items-center">
        <input
          className="input md:flex-1"
          placeholder="Buscar producto..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="flex gap-1 rounded-lg bg-slate-100 p-1 text-sm">
          {(
            [
              { key: "all", label: "Todos" },
              { key: "low", label: "Stock bajo" },
              { key: "out", label: "Agotado" },
            ] as const
          ).map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => setFilter(opt.key)}
              className={[
                "rounded-md px-3 py-1.5 font-medium transition",
                filter === opt.key
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900",
              ].join(" ")}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Producto</th>
              <th className="px-4 py-3 text-left font-medium">Categoría</th>
              <th className="px-4 py-3 text-center font-medium">Stock</th>
              <th className="px-4 py-3 text-right font-medium">Ajustar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-8 text-center text-sm text-slate-400"
                >
                  Sin productos para mostrar.
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
                      className="h-10 w-10 flex-shrink-0"
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
                <td className="px-4 py-3 text-center">
                  <input
                    type="number"
                    min={0}
                    value={p.stock}
                    onChange={(e) =>
                      setStock(p.id, Number(e.target.value) || 0)
                    }
                    className="w-20 rounded-lg border border-slate-200 px-2 py-1 text-center text-sm focus:border-brand-500 focus:outline-none"
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      className="rounded-lg border border-slate-200 px-2 py-1 text-sm text-slate-700 hover:bg-slate-100"
                      onClick={() => adjustStock(p.id, -1)}
                    >
                      −1
                    </button>
                    <button
                      type="button"
                      className="rounded-lg border border-slate-200 px-2 py-1 text-sm text-slate-700 hover:bg-slate-100"
                      onClick={() => adjustStock(p.id, 1)}
                    >
                      +1
                    </button>
                    <button
                      type="button"
                      className="rounded-lg border border-slate-200 px-2 py-1 text-sm text-slate-700 hover:bg-slate-100"
                      onClick={() => adjustStock(p.id, 10)}
                    >
                      +10
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="card p-4">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-2 inline-flex rounded-lg px-3 py-1 text-2xl font-bold ${color}`}>
        {value}
      </p>
    </div>
  );
}
