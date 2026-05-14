export type Product = {
  id: string;
  barcode: string;
  name: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  image?: string;
};

export type ProductInput = Omit<Product, "id">;

export type Category = {
  id: string;
  name: string;
  color: string;
};

export type CategoryInput = Omit<Category, "id">;

export type MovementType = "in" | "out" | "adjust";

export type MovementReason =
  | "compra"
  | "venta"
  | "merma"
  | "vencimiento"
  | "devolucion_cliente"
  | "devolucion_proveedor"
  | "ajuste_conteo"
  | "transferencia"
  | "otro";

export type StockMovement = {
  id: string;
  createdAt: string;
  productId: string;
  productName: string;
  productBarcode: string;
  type: MovementType;
  quantity: number;
  reason: MovementReason;
  note?: string;
  unitCost?: number;
  balanceBefore: number;
  balanceAfter: number;
};

export type RecordMovementInput = {
  productId: string;
  type: MovementType;
  quantity: number;
  reason: MovementReason;
  note?: string;
  unitCost?: number;
  newStock?: number;
};

export type StockStatus = "out" | "low" | "ok";

export const MOVEMENT_REASON_LABEL: Record<MovementReason, string> = {
  compra: "Compra a proveedor",
  venta: "Venta",
  merma: "Merma",
  vencimiento: "Vencimiento",
  devolucion_cliente: "Devolución de cliente",
  devolucion_proveedor: "Devolución a proveedor",
  ajuste_conteo: "Ajuste por conteo",
  transferencia: "Transferencia",
  otro: "Otro",
};

export const MOVEMENT_TYPE_LABEL: Record<MovementType, string> = {
  in: "Entrada",
  out: "Salida",
  adjust: "Ajuste",
};

export const REASONS_BY_TYPE: Record<MovementType, MovementReason[]> = {
  in: ["compra", "devolucion_cliente", "transferencia", "otro"],
  out: [
    "venta",
    "merma",
    "vencimiento",
    "devolucion_proveedor",
    "transferencia",
    "otro",
  ],
  adjust: ["ajuste_conteo", "otro"],
};
