import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ProductImage } from "../components/ProductImage";
import { formatCurrency } from "../lib/format";
import { useInventoryStore } from "../store/useInventoryStore";

export function AlertsPage() {
  const products = useInventoryStore((s) => s.products);

  const { outOfStock, lowStock } = useMemo(() => {
    const out = products.filter((p) => p.stock === 0);
    const low = products
      .filter((p) => p.stock > 0 && p.stock <= p.minStock)
      .sort((a, b) => a.stock / Math.max(1, a.minStock) - b.stock / Math.max(1, b.minStock));
    return { outOfStock: out, lowStock: low };
  }, [products]);

  return (
    <div className="space-y-6 p-4 lg:p-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Alertas de stock</h1>
        <p className="text-sm text-slate-500">
          Productos agotados o por debajo de su stock mínimo.
        </p>
      </header>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="card p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Productos agotados
          </p>
          <p className="mt-1 text-3xl font-bold text-rose-600">
            {outOfStock.length}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Stock bajo
          </p>
          <p className="mt-1 text-3xl font-bold text-amber-600">
            {lowStock.length}
          </p>
        </div>
      </div>

      <Section
        title="Agotados"
        emptyText="No hay productos agotados. ¡Bien ahí!"
        items={outOfStock}
        accent="rose"
      />

      <Section
        title="Por debajo del mínimo"
        emptyText="Todos los productos están por encima del mínimo."
        items={lowStock}
        accent="amber"
      />
    </div>
  );
}

function Section({
  title,
  emptyText,
  items,
  accent,
}: {
  title: string;
  emptyText: string;
  items: ReturnType<typeof useInventoryStore.getState>["products"];
  accent: "rose" | "amber";
}) {
  const isRose = accent === "rose";
  return (
    <section className="card overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 lg:px-6">
        <h2 className="text-base font-semibold text-slate-800">{title}</h2>
        <span
          className={`badge ${
            isRose ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"
          }`}
        >
          {items.length}
        </span>
      </div>
      {items.length === 0 ? (
        <div className="px-4 py-8 text-center text-sm text-slate-400 lg:px-6">
          {emptyText}
        </div>
      ) : (
        <ul className="divide-y divide-slate-100">
          {items.map((p) => {
            const ratio = p.minStock > 0 ? p.stock / p.minStock : 0;
            const pct = Math.min(100, Math.round(ratio * 100));
            const restock = Math.max(p.minStock - p.stock, 0);
            return (
              <li key={p.id} className="px-4 py-4 lg:px-6">
                <div className="flex flex-col gap-3 md:flex-row md:items-center">
                  <ProductImage
                    src={p.image}
                    alt={p.name}
                    className="h-14 w-14 flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-slate-800">
                      {p.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {p.category} · {p.barcode} ·{" "}
                      <span className="text-slate-700">
                        Costo {formatCurrency(p.cost)}
                      </span>
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full ${isRose ? "bg-rose-500" : "bg-amber-500"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-20 text-right text-xs text-slate-500">
                        {p.stock} / {p.minStock}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-stretch gap-2 md:items-end">
                    {restock > 0 && (
                      <p className="text-xs text-slate-500 md:text-right">
                        Reponer{" "}
                        <span className="font-semibold text-slate-800">
                          {restock} u.
                        </span>
                      </p>
                    )}
                    <Link
                      to={`/movimientos?productId=${p.id}`}
                      className="btn-primary"
                    >
                      Reponer ahora
                    </Link>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
