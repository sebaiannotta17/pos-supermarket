# Stock Manager Supermarket

Sistema de **gestión de inventario** moderno para tiendas y supermercados, con escaneo de códigos de barras, control de stock, alertas de reposición, categorías ABM e import/export CSV.

Construido con **React 19**, **TypeScript**, **Vite**, **Tailwind CSS v4**, **Zustand** y **PapaParse**.

## Funcionalidades

### Núcleo

- **Dashboard**: KPIs en vivo (productos, unidades, valor a costo y a precio, alertas y agotados), top de productos a reponer y últimos movimientos.
- **Movimientos con scanner**: pasás el lector → cargás producto → registrás **Entrada / Salida / Ajuste** con motivo y nota opcional.
- **Historial de movimientos**: filtros por tipo, texto, rango de fechas y exportación a CSV.
- **Alertas / Reposición**: lista de productos por debajo del mínimo o agotados, con botón "Reponer ahora" que abre el flujo de Entrada.
- **Productos** (CRUD completo): nombre, código de barras, categoría, costo, precio, stock, stock mínimo e imagen.
- **Categorías** (ABM): alta, edición y baja con color para identificar.
- **Import / Export CSV** de productos (con plantilla descargable y modo upsert por código de barras).
- **Persistencia** en `localStorage` (clave `inventory-store-v2`) — productos, categorías y movimientos.
- **Diseño responsive**: sidebar fijo en desktop con badge de alertas, drawer en mobile.

### Tipos de movimiento

| Tipo | Cómo afecta el stock | Motivos disponibles |
| --- | --- | --- |
| **Entrada** | Suma `cantidad` al stock | Compra · Devolución de cliente · Transferencia · Otro |
| **Salida** | Resta `cantidad` del stock (valida disponibilidad) | Venta · Merma · Vencimiento · Devolución a proveedor · Transferencia · Otro |
| **Ajuste** | Setea el stock en un valor real (ingresás el nuevo valor contado) | Ajuste por conteo · Otro |

Cada movimiento queda auditado con: fecha, producto, código de barras, tipo, motivo, cantidad, saldo antes/después, costo unitario (en entradas) y nota.

## Stack

- React 19 + TypeScript
- Vite 8
- Tailwind CSS 4 (vía `@tailwindcss/vite`)
- Zustand (estado global con persistencia)
- React Router 6
- PapaParse (import/export CSV)

## Scripts

```bash
npm install        # instalar dependencias
npm run dev        # entorno de desarrollo en http://localhost:5173
npm run build      # build de producción a /dist
npm run preview    # servir el build localmente
npm run lint       # ESLint
```

## Estructura

```
src/
├── components/   Sidebar, Layout, ProductImage, ProductFormModal
├── data/         mockProducts.ts (20 productos + categorías por defecto)
├── lib/          format.ts (moneda/fecha/ids), csv.ts (import/export PapaParse)
├── pages/        DashboardPage, MovementsPage, MovementsHistoryPage,
│                 AlertsPage, ProductsPage, CategoriesPage
├── store/        useInventoryStore.ts (Zustand + persist)
├── types/        Product, Category, StockMovement, MovementType, ...
├── App.tsx       Router con 6 rutas
└── main.tsx
```

## Importación CSV

Formato esperado (descargá la plantilla desde Productos → "Plantilla CSV"):

```csv
barcode,name,category,price,cost,stock,minStock,image
7790000000001,Producto Ejemplo,Almacén,1500,1000,20,5,
```

- Si el `barcode` ya existe → **actualiza** el producto.
- Si no existe → **crea** uno nuevo.
- Errores por fila se muestran en pantalla, los válidos se procesan igual.

## Deploy en Vercel

Trae `vercel.json` con rewrite SPA listo para usar.

### Opción A — Importar desde GitHub (recomendado)

1. Subí los cambios a GitHub.
2. Andá a <https://vercel.com/new>.
3. Importá `pos-supermarket`.
4. Vercel detecta Vite. Dejá los defaults (`Build: npm run build`, `Output: dist`).
5. **Deploy**.

### Opción B — Vercel CLI

```bash
npm i -g vercel
vercel login
vercel               # preview
vercel --prod        # producción
```

## Notas

- Datos persisten en `localStorage` clave `inventory-store-v2`. Para resetear todo a los mocks, desde la consola del navegador: `useInventoryStore.getState().resetAll()`.
- Las imágenes mock vienen de Unsplash; si fallan se muestra un placeholder.
- Si subís este repo y luego en otra sesión cambiás el shape de los datos, conviene cambiar la versión del nombre del store en `useInventoryStore.ts` para evitar choques con datos viejos en `localStorage`.
