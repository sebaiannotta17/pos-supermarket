export type Product = {
  id: string;
  barcode: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  image?: string;
};

export type CartItem = {
  productId: string;
  barcode: string;
  name: string;
  price: number;
  quantity: number;
};

export type SaleItem = {
  productId: string;
  barcode: string;
  name: string;
  price: number;
  quantity: number;
  lineTotal: number;
};

export type Sale = {
  id: string;
  createdAt: string;
  items: SaleItem[];
  subtotal: number;
  total: number;
  paymentMethod: PaymentMethod;
  itemCount: number;
};

export type PaymentMethod = "efectivo" | "debito" | "credito" | "qr";

export type ProductInput = Omit<Product, "id">;
