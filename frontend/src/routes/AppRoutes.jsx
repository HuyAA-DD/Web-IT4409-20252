import { Route, Routes } from "react-router-dom";

import UserLayout from "../layouts/UserLayout.jsx";
import HomePage from "../pages/HomePage.jsx";
import ProductListPage from "../pages/ProductListPage.jsx";
import ProductDetailPage from "../pages/ProductDetailPage.jsx";
import CartPage from "../pages/CartPage.jsx";
import LoginPage from "../pages/LoginPage.jsx";
import RegisterPage from "../pages/RegisterPage.jsx";
import NotFoundPage from "../pages/NotFoundPage.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";

function AppRoutes() {
  return (
    <Routes>
      <Route element={<UserLayout />}>
        <Route path="/" element={<HomePage />} />

        <Route path="/products" element={<ProductListPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/cart" element={<CartPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default AppRoutes;