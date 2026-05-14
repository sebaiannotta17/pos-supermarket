import { Link } from "react-router-dom";
import { ProductImage } from "../components/ProductImage";
import { formatCurrency } from "../lib/format";
import { useCatalogStats } from "../store/useInventoryStore";
import { useInventoryStore } from "../store/useInventoryStore";

export function DashboardPage() {
  const stats = useCatalogStats();
  const recentProducts = useInventoryStore((s) => s.products.slice(0, 6));

  return (
    <div className="space-y-6 p-4 lg:p-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500">
          Vista general del catálogo de productos y categorías.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi
          label="Productos"
          value={stats.productsCount.toString()}
          accent="bg-brand-50 text-brand-700"
        />
        <Kpi
          label="Categorías"
          value={stats.categoriesCount.toString()}
          accent="bg-sky-50 text-sky-700"
        />
        <Kpi
          label="Precio medio"
          value={formatCurrency(stats.avgPrice)}
          accent="bg-violet-50 text-violet-700"
        />
        <Kpi
          label="Margen medio"
          value={formatCurrency(stats.avgMargin)}
          accent="bg-amber-50 text-amber-700"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 lg:px-6">
            <h2 className="text-base font-semibold text-slate-800">
              Productos por categoría
            </h2>
            <Link
              to="/categorias"
              className="text-sm font-medium text-brand-700 hover:underline"
            >
              Ver categorías →
            </Link>
          </div>
          <ul className="divide-y divide-slate-100 px-4 py-2 lg:px-6">
            {stats.byCategory.length === 0 ? (
              <li className="py-8 text-center text-sm text-slate-400">
                Sin datos.
              </li>
            ) : (
              stats.byCategory.map((row) => (
                <li
                  key={row.name}
                  className="flex items-center justify-between py-3 text-sm"
                >
                  <span className="text-slate-700">{row.name}</span>
                  <span className="badge bg-slate-100 text-slate-700">
                    {row.count} productos
                  </span>
                </li>
              ))
            )}
          </ul>
        </section>

        <section className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 lg:px-6">
            <h2 className="text-base font-semibold text-slate-800">
              Altas recientes
            </h2>
            <Link
              to="/productos"
              className="text-sm font-medium text-brand-700 hover:underline"
            >
              Ver catálogo →
            </Link>
          </div>
          <ul className="divide-y divide-slate-100">
            {recentProducts.length === 0 ? (
              <li className="px-4 py-8 text-center text-sm text-slate-400 lg:px-6">
                No hay productos.
              </li>
            ) : (
              recentProducts.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center gap-3 px-4 py-3 lg:px-6"
                >
                  <ProductImage
                    src={p.image}
                    alt={p.name}
                    className="h-10 w-10 flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-800">
                      {p.name}
                    </p>
                    <p className="text-xs text-slate-500">{p.category}</p>
                  </div>
                  <span className="text-sm font-semibold text-brand-700">
                    {formatCurrency(p.price)}
                  </span>
                </li>
              ))
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}

function Kpi({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="card p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className={`mt-2 inline-block rounded-lg px-2 py-1 text-xl font-bold ${accent}`}>
        {value}
      </p>
    </div>
  );
}
