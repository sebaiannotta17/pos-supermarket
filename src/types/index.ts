export type Product = {
  id: string;
  barcode: string;
  name: string;
  category: string;
  price: number;
  cost: number;
  image?: string;
};

export type ProductInput = Omit<Product, "id">;

export type Category = {
  id: string;
  name: string;
  color: string;
};

export type CategoryInput = Omit<Category, "id">;
