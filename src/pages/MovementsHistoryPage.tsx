import { useMemo, useState } from "react";
import { downloadFile, exportMovementsCsv } from "../lib/csv";
import { formatCurrency, formatDate } from "../lib/format";
import { useInventoryStore } from "../store/useInventoryStore";
import {
  MOVEMENT_REASON_LABEL,
  MOVEMENT_TYPE_LABEL,
} from "../types";
import type { MovementType } from "../types";

export function MovementsHistoryPage() {
  const movements = useInventoryStore((s) => s.movements);

  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<MovementType | "all">("all");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return movements.filter((m) => {
      if (typeFilter !== "all" && m.type !== typeFilter) return false;
      if (
        q &&
        !m.productName.toLowerCase().includes(q) &&
        !m.productBarcode.toLowerCase().includes(q) &&
        !(m.note ?? "").toLowerCase().includes(q)
      )
        return false;
      if (dateFrom) {
        const from = new Date(dateFrom);
        if (new Date(m.createdAt) < from) return false;
      }
      if (dateTo) {
        const to = new Date(dateTo);
        to.setHours(23, 59, 59, 999);
        if (new Date(m.createdAt) > to) return false;
      }
      return true;
    });
  }, [movements, query, typeFilter, dateFrom, dateTo]);

  const stats = useMemo(() => {
    const inUnits = filtered
      .filter((m) => m.type === "in")
      .reduce((acc, m) => acc + m.quantity, 0);
    const outUnits = filtered
      .filter((m) => m.type === "out")
      .reduce((acc, m) => acc + m.quantity, 0);
    const adjustUnits = filtered
      .filter((m) => m.type === "adjust")
      .reduce((acc, m) => acc + Math.abs(m.balanceAfter - m.balanceBefore), 0);
    const inCost = filtered
      .filter((m) => m.type === "in" && m.unitCost)
      .reduce((acc, m) => acc + m.quantity * (m.unitCost ?? 0), 0);
    return { inUnits, outUnits, adjustUnits, inCost };
  }, [filtered]);

  const handleExport = () => {
    const csv = exportMovementsCsv(filtered);
    downloadFile(`movimientos-${new Date().toISOString().slice(0, 10)}.csv`, csv);
  };

  return (
    <div className="space-y-4 p-4 lg:p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Historial de movimientos</h1>
          <p className="text-sm text-slate-500">
            Todas las entradas, salidas y ajustes registrados.
          </p>
        </div>
        <button
          type="button"
          className="btn-secondary"
          onClick={handleExport}
          disabled={filtered.length === 0}
        >
          Exportar CSV
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <Stat label="Entradas" value={`+${stats.inUnits}`} color="text-emerald-700" />
        <Stat label="Salidas" value={`−${stats.outUnits}`} color="text-rose-700" />
        <Stat label="Ajustes (Δ)" value={stats.adjustUnits.toString()} color="text-sky-700" />
        <Stat label="Costo de entradas" value={formatCurrency(stats.inCost)} color="text-violet-700" />
      </div>

      <div className="card grid gap-3 p-4 md:grid-cols-4">
        <input
          className="input md:col-span-2"
          placeholder="Buscar producto, código o nota..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          className="input"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as MovementType | "all")}
        >
          <option value="all">Todos los tipos</option>
          <option value="in">Entradas</option>
          <option value="out">Salidas</option>
          <option value="adjust">Ajustes</option>
        </select>
        <div className="flex items-center gap-2">
          <input
            type="date"
            className="input"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
          <input
            type="date"
            className="input"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Fecha</th>
              <th className="px-4 py-3 text-left font-medium">Tipo</th>
              <th className="px-4 py-3 text-left font-medium">Producto</th>
              <th className="px-4 py-3 text-left font-medium">Motivo</th>
              <th className="px-4 py-3 text-right font-medium">Cantidad</th>
              <th className="px-4 py-3 text-center font-medium">Saldo</th>
              <th className="px-4 py-3 text-left font-medium">Nota</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-10 text-center text-sm text-slate-400"
                >
                  No hay movimientos para los filtros seleccionados.
                </td>
              </tr>
            )}
            {filtered.map((m) => {
              const isIn = m.type === "in";
              const isAdjust = m.type === "adjust";
              const delta = m.balanceAfter - m.balanceBefore;
              const colorBg = isAdjust
                ? "bg-sky-100 text-sky-700"
                : isIn
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-rose-100 text-rose-700";
              const colorText = isAdjust
                ? "text-sky-700"
                : isIn
                  ? "text-emerald-700"
                  : "text-rose-700";
              const sign = delta > 0 ? "+" : delta < 0 ? "−" : "";
              return (
                <tr key={m.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 whitespace-nowrap text-slate-700">
                    {formatDate(m.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${colorBg}`}>
                      {MOVEMENT_TYPE_LABEL[m.type]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800">
                      {m.productName}
                    </p>
                    <p className="font-mono text-xs text-slate-500">
                      {m.productBarcode}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {MOVEMENT_REASON_LABEL[m.reason]}
                  </td>
                  <td className={`px-4 py-3 text-right font-bold ${colorText}`}>
                    {sign}
                    {Math.abs(delta)}
                  </td>
                  <td className="px-4 py-3 text-center text-xs text-slate-500">
                    {m.balanceBefore} → <strong>{m.balanceAfter}</strong>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {m.note ?? "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Stat({
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
      <p className={`mt-1 text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}
