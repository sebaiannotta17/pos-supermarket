import { useMemo, useState } from "react";
import { formatCurrency, formatDate } from "../lib/format";
import { usePosStore } from "../store/usePosStore";
import type { Sale } from "../types";

const PAYMENT_LABEL: Record<Sale["paymentMethod"], string> = {
  efectivo: "Efectivo",
  debito: "Débito",
  credito: "Crédito",
  qr: "QR",
};

export function HistoryPage() {
  const sales = usePosStore((s) => s.sales);
  const [selected, setSelected] = useState<Sale | null>(null);

  const stats = useMemo(() => {
    const totalRevenue = sales.reduce((acc, s) => acc + s.total, 0);
    const totalItems = sales.reduce((acc, s) => acc + s.itemCount, 0);
    return { totalRevenue, totalItems };
  }, [sales]);

  return (
    <div className="space-y-4 p-4 lg:p-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Historial de ventas</h1>
        <p className="text-sm text-slate-500">
          Consultá las ventas finalizadas en este equipo.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <SummaryCard label="Ventas" value={sales.length.toString()} />
        <SummaryCard label="Ítems vendidos" value={stats.totalItems.toString()} />
        <SummaryCard
          label="Recaudación"
          value={formatCurrency(stats.totalRevenue)}
        />
      </div>

      <div className="card overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Comprobante</th>
              <th className="px-4 py-3 text-left font-medium">Fecha</th>
              <th className="px-4 py-3 text-left font-medium">Pago</th>
              <th className="px-4 py-3 text-right font-medium">Ítems</th>
              <th className="px-4 py-3 text-right font-medium">Total</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sales.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-10 text-center text-sm text-slate-400"
                >
                  Todavía no hay ventas registradas.
                </td>
              </tr>
            )}
            {sales.map((sale) => (
              <tr key={sale.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-mono text-xs text-slate-700">
                  {sale.id}
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {formatDate(sale.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <span className="badge bg-slate-100 text-slate-700">
                    {PAYMENT_LABEL[sale.paymentMethod]}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-slate-700">
                  {sale.itemCount}
                </td>
                <td className="px-4 py-3 text-right font-semibold text-slate-900">
                  {formatCurrency(sale.total)}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    className="text-sm font-medium text-brand-700 hover:underline"
                    onClick={() => setSelected(sale)}
                  >
                    Ver detalle
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSelected(null)}
          />
          <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Detalle de venta
                </h2>
                <p className="text-xs text-slate-500">
                  {selected.id} · {formatDate(selected.createdAt)}
                </p>
              </div>
              <button
                type="button"
                className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                onClick={() => setSelected(null)}
                aria-label="Cerrar"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium">Producto</th>
                    <th className="px-4 py-2 text-right font-medium">Precio</th>
                    <th className="px-4 py-2 text-center font-medium">Cant.</th>
                    <th className="px-4 py-2 text-right font-medium">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selected.items.map((item) => (
                    <tr key={item.productId}>
                      <td className="px-4 py-2">
                        <p className="font-medium text-slate-800">
                          {item.name}
                        </p>
                        <p className="font-mono text-xs text-slate-500">
                          {item.barcode}
                        </p>
                      </td>
                      <td className="px-4 py-2 text-right text-slate-700">
                        {formatCurrency(item.price)}
                      </td>
                      <td className="px-4 py-2 text-center text-slate-700">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-2 text-right font-semibold text-slate-800">
                        {formatCurrency(item.lineTotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="space-y-1 border-t border-slate-200 bg-slate-50 px-6 py-4 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Pago</span>
                <span>{PAYMENT_LABEL[selected.paymentMethod]}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>{formatCurrency(selected.subtotal)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-slate-900">
                <span>Total</span>
                <span>{formatCurrency(selected.total)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-4">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}
