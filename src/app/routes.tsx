import { createBrowserRouter, Navigate } from 'react-router';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CustomerLayout from './components/layout/CustomerLayout';
import AdminLayout from './components/layout/AdminLayout';
import MenuPage from './pages/MenuPage';
import CartPage from './pages/CartPage';
import OrdersPage from './pages/OrdersPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import MenuManagement from './pages/admin/MenuManagement';
import CategoryManagement from './pages/admin/CategoryManagement';
import OrderManagement from './pages/admin/OrderManagement';
import SalesReports from './pages/admin/SalesReports';
import UserManagement from './pages/admin/UserManagement';
import AuthGuard from './components/AuthGuard';
import AdminGuard from './components/AdminGuard';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/',
    element: <AuthGuard><CustomerLayout /></AuthGuard>,
    children: [
      { index: true, element: <Navigate to="/menu" replace /> },
      { path: 'menu', element: <MenuPage /> },
      { path: 'cart', element: <CartPage /> },
      { path: 'orders', element: <OrdersPage /> },
    ],
  },
  {
    path: '/admin',
    element: <AdminGuard><AdminLayout /></AdminGuard>,
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: 'menu', element: <MenuManagement /> },
      { path: 'categories', element: <CategoryManagement /> },
      { path: 'orders', element: <OrderManagement /> },
      { path: 'reports', element: <SalesReports /> },
      { path: 'users', element: <UserManagement /> },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/login" replace />,
  },
]);
