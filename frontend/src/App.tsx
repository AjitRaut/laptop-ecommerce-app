import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from './components/common/ErrorBoundary';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import VendorRegister from './components/Auth/VendorRegister';
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Home from './pages/Home';
import Products from './pages/Products';
import Cart from './pages/Cart';
import ProductDetail from './pages/ProductDetail';
import Orders from './pages/Orders';
import Checkout from './pages/Checkout';
import OrderDetail from './pages/OrderDetail';
import Profile from './pages/Profile';
import Wishlist from './pages/Wishlist';
import PaymentFailure from './pages/PaymentFailure';
import PaymentSuccess from './pages/PaymentSuccess';

// Admin Pages
import AdminDashboard from './pages/admin/VendorDetail';
import VendorManagement from './pages/admin/VendorManagement';
import AdminProducts from './pages/admin/AdminProducts';
import AdminUsers from './pages/admin/AdminUsers';
import AdminOrders from './pages/admin/AdminOrders';

// Report Pages - ALL 8 REPORTS
import ReportsOverview from './pages/admin/reports/ReportsOverview';
import ProductReports from './pages/admin/reports/ProductReports';
import OrderReports from './pages/admin/reports/OrderReports';
import VendorReports from './pages/admin/reports/VendorReports';
import UserReports from './pages/admin/reports/UserReports';
import SalesReports from './pages/admin/reports/SalesReports';
import CustomerReports from './pages/admin/reports/CustomerReports';
import CategoryBrandReports from './pages/admin/reports/CategoryBrandReports';
import IndividualVendorReport from './pages/admin/reports/IndividualVendorReport';

// Vendor Pages
import VendorDashboard from './pages/vendor/VendorDashboard';
import VendorProducts from './pages/vendor/VendorProducts';

import { useAppDispatch, useAppSelector } from './hooks/useTypedSelector';
import { useGetProfileQuery } from './store/api/authApi';
import { setCredentials } from './store/slices/authSlice';

// Role-based Route Protection
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!user) return <div>Loading user data...</div>;
  if (user.user_type !== 'admin') return <Navigate to="/" replace />;

  return <>{children}</>;
};

const VendorRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!user) return <div>Loading user data...</div>;
  if (user.user_type !== 'vendor') return <Navigate to="/" replace />;
  
  return <>{children}</>;
};

const CustomerRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  
  // If user is authenticated and is admin or vendor, redirect them to their respective dashboards
  if (isAuthenticated && user) {
    if (user.user_type === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    if (user.user_type === 'vendor') {
      return <Navigate to="/vendor/dashboard" replace />;
    }
  }
  
  return <>{children}</>;
};

const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const { token, isAuthenticated, user } = useAppSelector((state) => state.auth);
  
  const { data: userData } = useGetProfileQuery(undefined, {
    skip: !token || isAuthenticated,
  });

  useEffect(() => {
    if (token && userData && !isAuthenticated) {
      dispatch(setCredentials({
        user: userData,
        tokens: { access: token, refresh: '' }
      }));
    }
  }, [token, userData, isAuthenticated, dispatch]);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/vendor-register" element={<VendorRegister />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminRoute><Layout /></AdminRoute>}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            
            {/* Dashboard with nested routes */}
            <Route path="dashboard">
              <Route index element={<AdminDashboard />} />
              
              {/* ========== ALL 8 REPORT ROUTES ========== */}
              {/* Reports Overview - Main Dashboard */}
              <Route path="reports" element={<ReportsOverview />} />
              
              {/* Individual Report Pages */}
              <Route path="reports/products" element={<ProductReports />} />
              <Route path="reports/orders" element={<OrderReports />} />
              <Route path="reports/vendors" element={<VendorReports />} />
              <Route path="reports/users" element={<UserReports />} />
              <Route path="reports/sales" element={<SalesReports />} />
              <Route path="reports/customers" element={<CustomerReports />} />
              <Route path="reports/category-brand" element={<CategoryBrandReports />} />
              
              {/* Individual Vendor Report with dynamic ID */}
              <Route path="reports/vendor/:vendorId" element={<IndividualVendorReport />} />
            </Route>
            
            {/* Other admin routes */}
            <Route path="vendors" element={<VendorManagement />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="orders" element={<AdminOrders />} />
          </Route>
          
          {/* Vendor Routes */}
          <Route path="/vendor" element={<VendorRoute><Layout /></VendorRoute>}>
            <Route index element={<Navigate to="/vendor/dashboard" replace />} />
            <Route path="dashboard" element={<VendorDashboard />} />
            <Route path="products" element={<VendorProducts />} />
          </Route>
          
          {/* Customer Routes - Only for customers */}
          <Route path="/" element={<CustomerRoute><Layout /></CustomerRoute>}>
            <Route index element={<Home />} />
            <Route path="products" element={<Products />} />
            <Route path="products/:id" element={<ProductDetail />} />
            
            <Route path="cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
            <Route path="checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
            <Route path="orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
            <Route path="orders/:id" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
            <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
            <Route path="payment/success" element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />
            <Route path="payment/failure" element={<ProtectedRoute><PaymentFailure /></ProtectedRoute>} />
          </Route> 
        </Routes>
        
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
              borderRadius: '12px',
              padding: '16px',
            },
            success: {
              iconTheme: {
                primary: '#10B981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#EF4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </div>
    </ErrorBoundary>
  );
};

export default App;