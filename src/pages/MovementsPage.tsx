import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ProductImage } from "../components/ProductImage";
import { formatCurrency, formatDate } from "../lib/format";
import { useInventoryStore } from "../store/useInventoryStore";
import {
  MOVEMENT_REASON_LABEL,
  MOVEMENT_TYPE_LABEL,
  REASONS_BY_TYPE,
} from "../types";
import type { MovementReason, MovementType, Product } from "../types";

export function MovementsPage() {
  const [params] = useSearchParams();
  const products = useInventoryStore((s) => s.products);
  const movements = useInventoryStore((s) => s.movements);
  const lastFeedback = useInventoryStore((s) => s.lastFeedback);
  const recordMovement = useInventoryStore((s) => s.recordMovement);
  const setFeedback = useInventoryStore((s) => s.setFeedback);
  const clearFeedback = useInventoryStore((s) => s.clearFeedback);
  const findByBarcode = useInventoryStore((s) => s.findByBarcode);
  const findById = useInventoryStore((s) => s.findById);

  const initialProductId = params.get("productId");
  const [barcode, setBarcode] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(() =>
    initialProductId && useInventoryStore.getState().findById(initialProductId)
      ? initialProductId
      : null
  );
  const [type, setType] = useState<MovementType>("in");
  const [reason, setReason] = useState<MovementReason>("compra");
  const [quantity, setQuantity] = useState<number>(1);
  const [newStock, setNewStock] = useState<number>(0);
  const [unitCost, setUnitCost] = useState<number>(0);
  const [note, setNote] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!lastFeedback) return;
    const t = setTimeout(() => clearFeedback(), 4000);
    return () => clearTimeout(t);
  }, [lastFeedback, clearFeedback]);

  const selected: Product | undefined = useMemo(
    () => (selectedId ? findById(selectedId) : undefined),
    // We re-derive when products change so that the latest stock is reflected
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedId, products]
  );

  const handleTypeChange = (newType: MovementType) => {
    setType(newType);
    const allowed = REASONS_BY_TYPE[newType];
    if (!allowed.includes(reason)) setReason(allowed[0]);
    if (newType === "adjust" && selected) setNewStock(selected.stock);
  };

  const selectProduct = (productId: string | null) => {
    setSelectedId(productId);
    if (productId) {
      const product = findById(productId);
      if (product) {
        setNewStock(product.stock);
        setUnitCost(product.cost);
        setQuantity(1);
      }
    }
  };

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    const code = barcode.trim();
    if (!code) return;
    const product = findByBarcode(code);
    if (!product) {
      setFeedback({
        kind: "error",
        message: `No se encontró producto con código ${code}.`,
      });
      return;
    }
    selectProduct(product.id);
    setBarcode("");
    setFeedback({ kind: "success", message: `Producto cargado: ${product.name}` });
    inputRef.current?.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) {
      setFeedback({
        kind: "warning",
        message: "Seleccioná un producto primero.",
      });
      return;
    }
    const result = recordMovement({
      productId: selected.id,
      type,
      quantity,
      reason,
      note,
      unitCost: type === "in" ? unitCost : undefined,
      newStock: type === "adjust" ? newStock : undefined,
    });
    if ("error" in result) {
      setFeedback({ kind: "error", message: result.error });
      return;
    }
    setFeedback({
      kind: "success",
      message: `Movimiento registrado. Nuevo stock: ${result.balanceAfter}.`,
    });
    selectProduct(null);
    setBarcode("");
    setNote("");
    inputRef.current?.focus();
  };

  const recent = movements.slice(0, 5);

  const feedbackStyle = lastFeedback
    ? lastFeedback.kind === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : lastFeedback.kind === "warning"
        ? "border-amber-200 bg-amber-50 text-amber-800"
        : "border-rose-200 bg-rose-50 text-rose-800"
    : "";

  return (
    <div className="grid h-full grid-cols-1 gap-4 p-4 lg:grid-cols-3 lg:p-6">
      <div className="space-y-4 lg:col-span-2">
        <section className="card p-4 lg:p-6">
          <h2 className="text-lg font-semibold text-slate-800">
            Escanear producto
          </h2>
          <p className="text-sm text-slate-500">
            Pasá el lector de código de barras o ingresalo manualmente.
          </p>
          <form
            onSubmit={handleScan}
            className="mt-3 flex flex-col gap-2 sm:flex-row"
          >
            <input
              ref={inputRef}
              className="input flex-1 text-base"
              placeholder="Código de barras..."
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              autoFocus
              autoComplete="off"
              inputMode="numeric"
            />
            <button type="submit" className="btn-primary px-6">
              Cargar (Enter)
            </button>
          </form>
          {lastFeedback && (
            <div
              className={`mt-3 rounded-lg border px-3 py-2 text-sm ${feedbackStyle}`}
            >
              {lastFeedback.message}
            </div>
          )}
        </section>

        <section className="card p-4 lg:p-6">
          {!selected ? (
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-center text-slate-400">
              <svg
                viewBox="0 0 24 24"
                width="48"
                height="48"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M9 12h6M12 9v6" />
              </svg>
              <p className="text-sm">
                Seleccioná un producto escaneando su código.
              </p>
              <p className="text-xs">
                O elegilo de la lista de Productos para cargarlo acá.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center">
                <ProductImage
                  src={selected.image}
                  alt={selected.name}
                  className="h-20 w-20 flex-shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900">{selected.name}</p>
                  <p className="text-xs text-slate-500">
                    {selected.barcode} · {selected.category}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                    <span className="badge bg-white text-slate-700 ring-1 ring-slate-200">
                      Stock actual: <strong className="ml-1">{selected.stock}</strong>
                    </span>
                    <span className="badge bg-white text-slate-700 ring-1 ring-slate-200">
                      Min: {selected.minStock}
                    </span>
                    <span className="badge bg-white text-slate-700 ring-1 ring-slate-200">
                      Costo: {formatCurrency(selected.cost)}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-ghost text-sm text-slate-600"
                  onClick={() => selectProduct(null)}
                >
                  Cambiar
                </button>
              </div>

              <div>
                <label className="label">Tipo de movimiento</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["in", "out", "adjust"] as const).map((t) => {
                    const active = type === t;
                    const color =
                      t === "in"
                        ? active
                          ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                          : "border-slate-200 hover:border-emerald-300"
                        : t === "out"
                          ? active
                            ? "border-rose-500 bg-rose-50 text-rose-700"
                            : "border-slate-200 hover:border-rose-300"
                          : active
                            ? "border-sky-500 bg-sky-50 text-sky-700"
                            : "border-slate-200 hover:border-sky-300";
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => handleTypeChange(t)}
                        className={`rounded-lg border px-3 py-3 text-sm font-medium transition ${color}`}
                      >
                        {MOVEMENT_TYPE_LABEL[t]}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {type !== "adjust" ? (
                  <div>
                    <label className="label">Cantidad</label>
                    <input
                      type="number"
                      min={1}
                      step="1"
                      className="input"
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(Math.max(0, Number(e.target.value) || 0))
                      }
                    />
                  </div>
                ) : (
                  <div>
                    <label className="label">Nuevo stock real</label>
                    <input
                      type="number"
                      min={0}
                      step="1"
                      className="input"
                      value={newStock}
                      onChange={(e) =>
                        setNewStock(Math.max(0, Number(e.target.value) || 0))
                      }
                    />
                    <p className="mt-1 text-xs text-slate-500">
                      Sistema dice {selected.stock}; ingresá el valor real
                      contado.
                    </p>
                  </div>
                )}

                <div>
                  <label className="label">Motivo</label>
                  <select
                    className="input"
                    value={reason}
                    onChange={(e) => setReason(e.target.value as MovementReason)}
                  >
                    {REASONS_BY_TYPE[type].map((r) => (
                      <option key={r} value={r}>
                        {MOVEMENT_REASON_LABEL[r]}
                      </option>
                    ))}
                  </select>
                </div>

                {type === "in" && (
                  <div>
                    <label className="label">Costo unitario (opcional)</label>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      className="input"
                      value={unitCost}
                      onChange={(e) =>
                        setUnitCost(Math.max(0, Number(e.target.value) || 0))
                      }
                    />
                  </div>
                )}

                <div className={type === "in" ? "md:col-span-1" : "md:col-span-2"}>
                  <label className="label">Nota (opcional)</label>
                  <input
                    className="input"
                    placeholder="Ej: factura #1234"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 border-t border-slate-200 pt-4">
                <div className="text-sm text-slate-600">
                  {type === "adjust" ? (
                    <>
                      Diferencia:{" "}
                      <span
                        className={
                          newStock - selected.stock >= 0
                            ? "font-semibold text-emerald-700"
                            : "font-semibold text-rose-700"
                        }
                      >
                        {newStock - selected.stock >= 0 ? "+" : ""}
                        {newStock - selected.stock}
                      </span>
                    </>
                  ) : (
                    <>
                      Stock resultante:{" "}
                      <span className="font-semibold text-slate-900">
                        {type === "in"
                          ? selected.stock + quantity
                          : Math.max(0, selected.stock - quantity)}
                      </span>
                    </>
                  )}
                </div>
                <button type="submit" className="btn-primary px-6 py-2.5">
                  Registrar movimiento
                </button>
              </div>
            </form>
          )}
        </section>
      </div>

      <aside className="card flex flex-col">
        <div className="border-b border-slate-200 px-4 py-3">
          <h2 className="text-base font-semibold text-slate-800">
            Últimos movimientos
          </h2>
        </div>
        {recent.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 py-10 text-center text-sm text-slate-400">
            <p>Sin movimientos todavía.</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {recent.map((m) => {
              const isIn = m.type === "in";
              const isAdjust = m.type === "adjust";
              const sign = isAdjust
                ? m.balanceAfter >= m.balanceBefore
                  ? "+"
                  : "−"
                : isIn
                  ? "+"
                  : "−";
              const colorClass = isAdjust
                ? "text-sky-700"
                : isIn
                  ? "text-emerald-700"
                  : "text-rose-700";
              return (
                <li key={m.id} className="px-4 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-800">
                        {m.productName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {MOVEMENT_REASON_LABEL[m.reason]}
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-400">
                        {formatDate(m.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${colorClass}`}>
                        {sign}
                        {m.quantity}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {m.balanceBefore} → {m.balanceAfter}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </aside>
    </div>
  );
}
