import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { HistoryPage } from "./pages/HistoryPage";
import { ProductsPage } from "./pages/ProductsPage";
import { SalePage } from "./pages/SalePage";
import { StockPage } from "./pages/StockPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<SalePage />} />
          <Route path="productos" element={<ProductsPage />} />
          <Route path="stock" element={<StockPage />} />
          <Route path="historial" element={<HistoryPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
