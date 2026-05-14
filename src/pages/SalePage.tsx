import { useEffect, useMemo, useRef, useState } from "react";
import { ProductImage } from "../components/ProductImage";
import { formatCurrency } from "../lib/format";
import { useCartTotals, usePosStore } from "../store/usePosStore";
import type { PaymentMethod, Product, Sale } from "../types";

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "efectivo", label: "Efectivo" },
  { value: "debito", label: "Débito" },
  { value: "credito", label: "Crédito" },
  { value: "qr", label: "QR / Transferencia" },
];

export function SalePage() {
  const products = usePosStore((s) => s.products);
  const cart = usePosStore((s) => s.cart);
  const lastScan = usePosStore((s) => s.lastScan);
  const scanBarcode = usePosStore((s) => s.scanBarcode);
  const updateCartQuantity = usePosStore((s) => s.updateCartQuantity);
  const removeFromCart = usePosStore((s) => s.removeFromCart);
  const clearCart = usePosStore((s) => s.clearCart);
  const finalizeSale = usePosStore((s) => s.finalizeSale);
  const findByBarcode = usePosStore((s) => s.findByBarcode);
  const clearScanFeedback = usePosStore((s) => s.clearScanFeedback);

  const [barcode, setBarcode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("efectivo");
  const [lastSale, setLastSale] = useState<Sale | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const totals = useCartTotals(cart);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!lastScan) return;
    const t = setTimeout(() => clearScanFeedback(), 3500);
    return () => clearTimeout(t);
  }, [lastScan, clearScanFeedback]);

  const previewProduct: Product | undefined = useMemo(() => {
    if (!barcode.trim()) return undefined;
    return findByBarcode(barcode);
  }, [barcode, findByBarcode, products]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const product = scanBarcode(barcode);
    if (product) {
      setBarcode("");
    }
    inputRef.current?.focus();
    inputRef.current?.select();
  };

  const handleFinalize = () => {
    const sale = finalizeSale(paymentMethod);
    if (sale) {
      setLastSale(sale);
      inputRef.current?.focus();
    }
  };

  const feedbackStyle = lastScan
    ? lastScan.kind === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : lastScan.kind === "warning"
        ? "border-amber-200 bg-amber-50 text-amber-800"
        : "border-rose-200 bg-rose-50 text-rose-800"
    : "";

  return (
    <div className="grid h-full grid-cols-1 gap-4 p-4 lg:grid-cols-3 lg:p-6">
      {/* Columna izquierda: scanner + carrito */}
      <div className="flex flex-col gap-4 lg:col-span-2">
        <section className="card p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800">
              Escanear producto
            </h2>
            <span className="text-xs uppercase tracking-wide text-slate-500">
              {products.length} productos cargados
            </span>
          </div>
          <form
            onSubmit={handleSubmit}
            className="mt-3 flex flex-col gap-2 sm:flex-row"
          >
            <input
              ref={inputRef}
              className="input flex-1 text-base"
              placeholder="Escaneá o ingresá un código de barras..."
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              autoFocus
              autoComplete="off"
              inputMode="numeric"
            />
            <button type="submit" className="btn-primary px-6">
              Agregar (Enter)
            </button>
          </form>

          {lastScan && (
            <div
              className={`mt-3 rounded-lg border px-3 py-2 text-sm ${feedbackStyle}`}
            >
              {lastScan.message}
            </div>
          )}

          {previewProduct && (
            <div className="mt-4 flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <ProductImage
                src={previewProduct.image}
                alt={previewProduct.name}
                className="h-20 w-20 flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-slate-800">
                  {previewProduct.name}
                </p>
                <p className="text-xs text-slate-500">
                  {previewProduct.category} · {previewProduct.barcode}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
                  <span className="font-bold text-brand-700">
                    {formatCurrency(previewProduct.price)}
                  </span>
                  <span
                    className={`badge ${
                      previewProduct.stock > 5
                        ? "bg-emerald-100 text-emerald-700"
                        : previewProduct.stock > 0
                          ? "bg-amber-100 text-amber-700"
                          : "bg-rose-100 text-rose-700"
                    }`}
                  >
                    Stock: {previewProduct.stock}
                  </span>
                </div>
              </div>
            </div>
          )}
        </section>

        <section className="card flex flex-1 flex-col overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 lg:px-6">
            <h2 className="text-lg font-semibold text-slate-800">Carrito</h2>
            <button
              type="button"
              className="btn-ghost text-sm text-slate-600 disabled:opacity-50"
              onClick={clearCart}
              disabled={cart.length === 0}
            >
              Vaciar
            </button>
          </div>

          {cart.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center text-slate-400">
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
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" />
              </svg>
              <p className="text-sm">Escaneá un producto para empezar la venta.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium">Producto</th>
                    <th className="px-4 py-2 text-right font-medium">Precio</th>
                    <th className="px-4 py-2 text-center font-medium">Cant.</th>
                    <th className="px-4 py-2 text-right font-medium">Subtotal</th>
                    <th className="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {cart.map((item) => {
                    const product = products.find(
                      (p) => p.id === item.productId
                    );
                    const maxStock = product?.stock ?? item.quantity;
                    return (
                      <tr key={item.productId} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <p className="font-medium text-slate-800">
                            {item.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {item.barcode}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-right text-slate-700">
                          {formatCurrency(item.price)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="mx-auto flex w-fit items-center gap-1 rounded-lg border border-slate-200 bg-white">
                            <button
                              type="button"
                              className="px-2 py-1 text-slate-600 hover:bg-slate-100"
                              onClick={() =>
                                updateCartQuantity(
                                  item.productId,
                                  item.quantity - 1
                                )
                              }
                              aria-label="Disminuir"
                            >
                              −
                            </button>
                            <input
                              type="number"
                              min={1}
                              max={maxStock}
                              value={item.quantity}
                              onChange={(e) =>
                                updateCartQuantity(
                                  item.productId,
                                  Number(e.target.value) || 0
                                )
                              }
                              className="w-12 border-0 bg-transparent text-center text-sm focus:outline-none"
                            />
                            <button
                              type="button"
                              className="px-2 py-1 text-slate-600 hover:bg-slate-100"
                              onClick={() =>
                                updateCartQuantity(
                                  item.productId,
                                  item.quantity + 1
                                )
                              }
                              aria-label="Aumentar"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-slate-800">
                          {formatCurrency(item.price * item.quantity)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            className="rounded p-1 text-rose-600 hover:bg-rose-50"
                            onClick={() => removeFromCart(item.productId)}
                            aria-label="Eliminar"
                          >
                            <svg
                              viewBox="0 0 24 24"
                              width="18"
                              height="18"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6" />
                              <path d="M10 11v6M14 11v6" />
                              <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {/* Columna derecha: totales + cobro */}
      <div className="flex flex-col gap-4">
        <section className="card p-5">
          <h2 className="text-lg font-semibold text-slate-800">Resumen</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between text-slate-600">
              <dt>Ítems</dt>
              <dd>{totals.itemCount}</dd>
            </div>
            <div className="flex justify-between text-slate-600">
              <dt>Subtotal</dt>
              <dd>{formatCurrency(totals.subtotal)}</dd>
            </div>
            <div className="my-2 border-t border-dashed border-slate-200" />
            <div className="flex justify-between text-lg font-bold text-slate-900">
              <dt>Total</dt>
              <dd>{formatCurrency(totals.total)}</dd>
            </div>
          </dl>

          <div className="mt-5">
            <label className="label">Método de pago</label>
            <div className="grid grid-cols-2 gap-2">
              {PAYMENT_METHODS.map((m) => {
                const active = paymentMethod === m.value;
                return (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setPaymentMethod(m.value)}
                    className={[
                      "rounded-lg border px-3 py-2 text-sm font-medium transition",
                      active
                        ? "border-brand-500 bg-brand-50 text-brand-700"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300",
                    ].join(" ")}
                  >
                    {m.label}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            className="btn-primary mt-5 w-full py-3 text-base"
            onClick={handleFinalize}
            disabled={cart.length === 0}
          >
            Finalizar venta
          </button>
        </section>

        {lastSale && (
          <section className="card border-emerald-200 bg-emerald-50 p-5">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-emerald-100 p-2 text-emerald-700">
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
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-emerald-800">
                  Venta cobrada con éxito
                </p>
                <p className="text-xs text-emerald-700">
                  #{lastSale.id} · {lastSale.itemCount} ítems ·{" "}
                  {formatCurrency(lastSale.total)}
                </p>
                <button
                  type="button"
                  className="mt-2 text-xs font-medium text-emerald-800 underline"
                  onClick={() => setLastSale(null)}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
