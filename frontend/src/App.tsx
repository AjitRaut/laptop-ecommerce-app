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

// Vendor Pages

import { useAppDispatch, useAppSelector } from './hooks/useTypedSelector';
import { useGetProfileQuery } from './store/api/authApi';
import { setCredentials } from './store/slices/authSlice';
import AdminDashboard from './pages/admin/VendorDetail';
import VendorManagement from './pages/admin/VendorManagement';
import VendorDashboard from './pages/vendor/VendorDashboard';
import VendorProducts from './pages/vendor/VendorProducts';

// Role-based Route Protection
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  
  // if (!isAuthenticated) return <Navigate to="/login" />;
  // if (!user) return <div>Loading user data...</div>;
  // if (user.user_type !== 'admin') return <Navigate to="/" />;

  return <>{children}</>;
};


const VendorRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  // if (!isAuthenticated) return <Navigate to="/login" />;
  // if (user?.user_type !== 'vendor') return <Navigate to="/" />;

  // console.log("User",user)
  
  return <>{children}</>;
};

const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const { token, isAuthenticated } = useAppSelector((state) => state.auth);
  
  const { data: user } = useGetProfileQuery(undefined, {
    skip: !token,
  });

  useEffect(() => {
    if (token && user && !isAuthenticated) {
      dispatch(setCredentials({
        user,
        tokens: { access: token, refresh: '' }
      }));
    }
  }, [token, user, isAuthenticated, dispatch]);

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
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="vendors" element={<VendorManagement />} />
          </Route>
          
          {/* Vendor Routes */}
          <Route path="/vendor" element={<VendorRoute><Layout /></VendorRoute>}>
            <Route index element={<VendorDashboard />} />
            <Route path="dashboard" element={<VendorDashboard />} />
            <Route path="products" element={<VendorProducts />} />
          </Route>
          
          {/* Customer Routes */}
          <Route path="/" element={<Layout />}>
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