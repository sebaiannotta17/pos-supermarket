export type ColumnKind = "currency" | "text";

export type CategoryColumn = {
  id: string;
  label: string;
  kind: ColumnKind;
};

export type Category = {
  id: string;
  name: string;
  color: string;
  columns: CategoryColumn[];
};

export type CategoryInput = Omit<Category, "id">;

export type Product = {
  id: string;
  barcode: string;
  name: string;
  category: string;
  image?: string;
  /** Valores numéricos keyed por id de columna (costo, negocio_kg, etc.) */
  values: Record<string, number>;
};

export type ProductInput = Omit<Product, "id">;
