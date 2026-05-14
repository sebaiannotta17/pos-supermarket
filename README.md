# Catálogo Supermercado

App web para **gestionar el catálogo** de una tienda o supermercado: productos con código de barras, categorías, costos y precios, más import/export CSV.

Stack: **React 19**, **TypeScript**, **Vite**, **Tailwind CSS v4**, **Zustand**.

## Funcionalidades

- **Dashboard**: cantidad de productos y categorías, precio y margen promedio, productos agrupados por categoría y listado rápido de ítems.
- **Productos** (CRUD): nombre, código de barras, categoría, costo, precio de venta, imagen (URL). Tabla sólo lectura; los cambios se hacen con **Editar** o **Nuevo producto**.
- **Categorías** (ABM): alta, edición con color y baja si no tiene productos.
- **CSV**: plantilla descargable, importación (upsert por código de barras) y exportación.
- Persistencia en el navegador (`localStorage`, clave `inventory-catalog-v1`).

## Scripts

```bash
npm install
npm run dev       # http://localhost:5173
npm run build
npm run preview
npm run lint
```

## Estructura

```
src/
├── components/   Layout, Sidebar, ProductImage, ProductFormModal
├── data/         mockProducts.ts · categorías por defecto
├── lib/          format.ts · csv.ts
├── pages/        DashboardPage, ProductsPage, CategoriesPage
├── store/        useInventoryStore.ts · useCatalogStats()
└── types/        Product, Category, ...
```

## CSV de productos

Columnas esperadas:

```csv
barcode,name,category,price,cost,image
```

## Deploy en Vercel

Incluye `vercel.json` SPA. Framework **Vite**, build `npm run build`, carpeta `dist`.

## Datos locales

Para volver al catálogo mock desde la consola del navegador:

```js
useInventoryStore.getState().resetAll()
```

Si ves datos viejos con otra forma, borrá en DevTools → Application → Local Storage la entrada `inventory-catalog-v1` (antes `inventory-store-v2`, etc.).
