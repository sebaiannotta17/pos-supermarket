# POS Supermercado

Sistema POS / caja registradora moderno para tiendas y supermercados, construido con **React 19**, **TypeScript**, **Vite**, **Tailwind CSS v4** y **Zustand**.

## Funcionalidades

- **Pantalla de venta** con escaneo / ingreso manual de código de barras (Enter para agregar al carrito).
- Búsqueda automática del producto y vista previa con nombre, código, precio, categoría, stock e imagen.
- **Carrito** con tabla de ítems, modificación de cantidades, eliminación y vaciado.
- Cálculo automático de **subtotal, total e ítems**.
- **Finalizar venta** con método de pago, descuento de stock y registro en historial.
- **Gestión de productos** (CRUD completo): alta, edición, eliminación, búsqueda y filtro por categoría.
- **Stock** con vista de productos críticos, ajuste rápido (+1, +10, −1) y edición directa de cantidades.
- **Historial de ventas** con detalle por comprobante, totales y método de pago.
- **Persistencia local** con `localStorage` (productos, carrito y ventas).
- **Diseño responsive** con sidebar fijo en desktop y menú lateral en mobile.

## Stack

- React 19 + TypeScript
- Vite 8
- Tailwind CSS 4 (vía `@tailwindcss/vite`)
- Zustand (estado global con persistencia en `localStorage`)
- React Router 6

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
├── components/         # UI compartida (Sidebar, Layout, modales, ProductImage)
├── data/               # Productos mockeados iniciales
├── lib/                # Helpers (formato de moneda, fechas, ids)
├── pages/              # Una página por ruta (Venta, Productos, Stock, Historial)
├── store/              # Estado global Zustand (POS store)
├── types/              # Tipos compartidos (Product, CartItem, Sale, ...)
├── App.tsx             # Configuración de rutas
└── main.tsx            # Entry point
```

## Cómo usar la caja

1. Posicionate en la pantalla **Venta** (es la home).
2. Escaneá un producto con un lector USB de códigos de barras o ingresá el código manualmente y presioná **Enter**.
3. El producto se agrega automáticamente al carrito; podés modificar cantidades o eliminarlo.
4. Elegí el **método de pago** y tocá **Finalizar venta**: se descuenta el stock y se guarda en el historial.

> Datos iniciales: el catálogo arranca con 20 productos mockeados realistas (códigos EAN-13 ficticios). Todos los cambios persisten en este navegador.

## Deploy en Vercel

El proyecto trae un `vercel.json` con rewrite SPA listo para usar.

### Opción A — Importar desde GitHub (recomendado)

1. Hacé push de este repo a GitHub.
2. Entrá a <https://vercel.com/new>.
3. Importá el repositorio.
4. Vercel detecta automáticamente Vite. Dejá los valores por defecto:
   - **Framework preset**: Vite
   - **Build command**: `npm run build`
   - **Output directory**: `dist`
5. Hacé clic en **Deploy**. Listo.

### Opción B — Vercel CLI

```bash
npm i -g vercel
vercel login
vercel               # primer deploy (preview)
vercel --prod        # deploy a producción
```

Cualquier push al branch principal vuelve a deployar automáticamente si lo conectás vía GitHub.

## Notas

- Todos los datos viven en `localStorage` (clave `pos-supermarket-v1`). Si querés volver al catálogo mock original podés llamar a `usePosStore.getState().resetToMock()` desde la consola del navegador.
- Las imágenes de los productos mock se sirven desde Unsplash. Si una imagen falla, se muestra un placeholder.
