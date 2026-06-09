import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { CategoriesPage } from "./pages/CategoriesPage";
import { CategoryProductsPage } from "./pages/CategoryProductsPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ImportPage } from "./pages/ImportPage";
import { ProductsPage } from "./pages/ProductsPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="productos" element={<ProductsPage />} />
          <Route path="categorias" element={<CategoriesPage />} />
          <Route path="categorias/:categoryId" element={<CategoryProductsPage />} />
          <Route path="importar" element={<ImportPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
