import { Link } from "react-router-dom";
import { ProductImage } from "../components/ProductImage";
import { formatCurrency, formatDate } from "../lib/format";
import {
  useInventoryKpis,
  useInventoryStore,
} from "../store/useInventoryStore";
import {
  MOVEMENT_REASON_LABEL,
  MOVEMENT_TYPE_LABEL,
} from "../types";

export function DashboardPage() {
  const kpis = useInventoryKpis();
  const movements = useInventoryStore((s) => s.movements);
  const recent = movements.slice(0, 6);
  const topAlerts = [...kpis.outOfStock, ...kpis.lowStock].slice(0, 5);

  return (
    <div className="space-y-6 p-4 lg:p-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500">
          Resumen del inventario en tiempo real.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi
          label="Productos"
          value={kpis.productsCount.toString()}
          accent="bg-brand-50 text-brand-700"
          icon={
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 8 12 3 3 8v8l9 5 9-5V8z" />
              <path d="M3 8l9 5 9-5" />
            </svg>
          }
        />
        <Kpi
          label="Unidades en stock"
          value={kpis.totalUnits.toLocaleString("es-AR")}
          accent="bg-sky-50 text-sky-700"
          icon={
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2 2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          }
        />
        <Kpi
          label="Valor a costo"
          value={formatCurrency(kpis.inventoryValueByCost)}
          accent="bg-violet-50 text-violet-700"
          icon={
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          }
        />
        <Kpi
          label="Alertas / Agotados"
          value={`${kpis.lowStockCount} / ${kpis.outOfStockCount}`}
          accent="bg-amber-50 text-amber-700"
          icon={
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          }
        />
      </div>

      <div className="card p-4 lg:p-6">
        <p className="text-sm text-slate-500">Valor del inventario a precio de venta</p>
        <p className="mt-1 text-3xl font-bold text-slate-900">
          {formatCurrency(kpis.inventoryValueByPrice)}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Margen potencial:{" "}
          <span className="font-semibold text-emerald-700">
            {formatCurrency(
              kpis.inventoryValueByPrice - kpis.inventoryValueByCost
            )}
          </span>
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 lg:px-6">
            <h2 className="text-base font-semibold text-slate-800">
              Productos a reponer
            </h2>
            <Link
              to="/alertas"
              className="text-sm font-medium text-brand-700 hover:underline"
            >
              Ver todas →
            </Link>
          </div>
          {topAlerts.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 py-12 text-center text-sm text-slate-400">
              <svg
                viewBox="0 0 24 24"
                width="40"
                height="40"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <p>Todo el stock está por encima del mínimo.</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {topAlerts.map((p) => {
                const isOut = p.stock === 0;
                return (
                  <li key={p.id} className="flex items-center gap-3 px-4 py-3 lg:px-6">
                    <ProductImage
                      src={p.image}
                      alt={p.name}
                      className="h-10 w-10 flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-800">
                        {p.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        Min: {p.minStock} · {p.category}
                      </p>
                    </div>
                    <span
                      className={`badge ${
                        isOut
                          ? "bg-rose-100 text-rose-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {isOut ? "Agotado" : `${p.stock} u.`}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="card flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 lg:px-6">
            <h2 className="text-base font-semibold text-slate-800">
              Últimos movimientos
            </h2>
            <Link
              to="/historial"
              className="text-sm font-medium text-brand-700 hover:underline"
            >
              Ver historial →
            </Link>
          </div>
          {recent.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 py-12 text-center text-sm text-slate-400">
              <svg
                viewBox="0 0 24 24"
                width="40"
                height="40"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
                <path d="M3 3v5h5" />
              </svg>
              <p>Todavía no se registraron movimientos.</p>
              <Link
                to="/movimientos"
                className="mt-2 text-sm font-medium text-brand-700 hover:underline"
              >
                Registrar el primero →
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recent.map((m) => {
                const isIn = m.type === "in";
                const isAdjust = m.type === "adjust";
                const colorClass = isAdjust
                  ? "bg-sky-100 text-sky-700"
                  : isIn
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-rose-100 text-rose-700";
                const sign = isAdjust
                  ? m.balanceAfter >= m.balanceBefore
                    ? "+"
                    : "−"
                  : isIn
                    ? "+"
                    : "−";
                return (
                  <li key={m.id} className="flex items-center gap-3 px-4 py-3 lg:px-6">
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${colorClass}`}
                    >
                      {MOVEMENT_TYPE_LABEL[m.type][0]}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-800">
                        {m.productName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {MOVEMENT_REASON_LABEL[m.reason]} ·{" "}
                        {formatDate(m.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-sm font-semibold ${
                          isAdjust
                            ? "text-sky-700"
                            : isIn
                              ? "text-emerald-700"
                              : "text-rose-700"
                        }`}
                      >
                        {sign}
                        {m.quantity}
                      </p>
                      <p className="text-xs text-slate-500">
                        → {m.balanceAfter}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function Kpi({
  label,
  value,
  accent,
  icon,
}: {
  label: string;
  value: string;
  accent: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          {label}
        </p>
        <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${accent}`}>
          {icon}
        </span>
      </div>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}
