# Catálogo Supermercado

App web para **gestionar el catálogo** de una tienda o supermercado: productos con código de barras, categorías, costos y precios, más import/export CSV.

Stack: **React 19**, **TypeScript**, **Vite**, **Tailwind CSS v4**, **Zustand**.

## Funcionalidades

- **Dashboard**: cantidad de productos y categorías, precio y margen promedio, productos agrupados por categoría y listado rápido de ítems.
- **Productos** (CRUD): nombre, código de barras, categoría, costo, precio de venta, imagen (URL). Tabla sólo lectura; los cambios se hacen con **Editar** o **Nuevo producto**.
- **Categorías** (ABM): alta, edición con color y baja si no tiene productos.
- **CSV**: plantilla descargable, importación (upsert por código de barras) y exportación.
- Persistencia en el navegador: catálogo por perfil (`inventory-catalog-*`) + preferencias (`catalog-profiles-v1`).

## Perfiles Mamá / Papá

Selector al pie del menú: cada persona tiene **su propio catálogo** guardado aparte en el mismo navegador. Podés cambiar cómo aparece cada nombre (“Cambiar nombres mostrados”). **No lleva contraseña** — es para uso familiar en casa.

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
├── store/        useInventoryStore.ts · catalogStorage.ts · useProfileStore.ts
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

Si ves datos viejos, en DevTools → Application → borrá las claves `inventory-catalog-*` y `catalog-profiles-v1` (y la legada `inventory-catalog-v1` si sigue apareciendo).
