import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchSession } from './store/authSlice';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import MeProfilePage from './pages/MeProfilePage';
import MeOrdersPage from './pages/MeOrdersPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminCustomersPage from './pages/admin/AdminCustomersPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AppLayout from './layouts/AppLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import AdminClientDetailPage from './pages/admin/AdminClientDetailPage';
import AdminCreateOrderPage from './pages/admin/AdminCreateOrderPage';
import AdminOrderDetailPage from './pages/admin/AdminOrderDetailPage';
import MeOrderDetailPage from './pages/MeOrderDetailPage';
function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchSession());
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />

        {/* Layout global pour tout le reste */}
        <Route element={<AppLayout />}>
          {/* Route publique */}
          <Route path="/products" element={<ProductsPage />} />

          {/* Espace CLIENT */}
          <Route
            element={<ProtectedRoute requiredRole="CLIENT" />}
          >
            <Route path="/me/profile" element={<MeProfilePage />} />
            <Route path="/me/orders" element={<MeOrdersPage />} />
            <Route path="/me/orders/:id" element={<MeOrderDetailPage />} />
          </Route>

          {/* Espace ADMIN */}
          <Route
            element={<ProtectedRoute requiredRole="ADMIN" />}
          >
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/customers" element={<AdminCustomersPage />} />
            <Route path="/admin/clients/:id" element={<AdminClientDetailPage />} />
            <Route path="/admin/products" element={<AdminProductsPage />} />
            <Route path="/admin/orders" element={<AdminOrdersPage />} />
            <Route path="/admin/orders/new" element={<AdminCreateOrderPage />} />
            <Route path="/admin/orders/:id" element={<AdminOrderDetailPage />} />
          </Route>

          {/* Ancien dashboard générique (optionnel) */}
          <Route
            element={<ProtectedRoute />}
          >
            <Route path="/dashboard" element={<DashboardPage />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;