import React, { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from './components/common/ErrorBoundary';
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Home from './pages/Home';

// Route-level code splitting: every page except Home is fetched on demand, so
// customers never download the admin/report code (recharts, jsPDF, ...).
// Loading states live in Layout (and AuthFallback for the auth screens).
const Login = lazy(() => import('./components/Auth/Login'));
const Register = lazy(() => import('./components/Auth/Register'));
const VendorRegister = lazy(() => import('./components/Auth/VendorRegister'));
const Products = lazy(() => import('./pages/Products'));
const Cart = lazy(() => import('./pages/Cart'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Orders = lazy(() => import('./pages/Orders'));
const Checkout = lazy(() => import('./pages/Checkout'));
const OrderDetail = lazy(() => import('./pages/OrderDetail'));
const Profile = lazy(() => import('./pages/Profile'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const PaymentFailure = lazy(() => import('./pages/PaymentFailure'));
const PaymentSuccess = lazy(() => import('./pages/PaymentSuccess'));

// Admin Pages
const AdminDashboard = lazy(() => import('./pages/admin/VendorDetail'));
const VendorManagement = lazy(() => import('./pages/admin/VendorManagement'));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'));

// Report Pages - ALL 8 REPORTS
const ReportsOverview = lazy(() => import('./pages/admin/reports/ReportsOverview'));
const ProductReports = lazy(() => import('./pages/admin/reports/ProductReports'));
const OrderReports = lazy(() => import('./pages/admin/reports/OrderReports'));
const VendorReports = lazy(() => import('./pages/admin/reports/VendorReports'));
const UserReports = lazy(() => import('./pages/admin/reports/UserReports'));
const SalesReports = lazy(() => import('./pages/admin/reports/SalesReports'));
const CustomerReports = lazy(() => import('./pages/admin/reports/CustomerReports'));
const CategoryBrandReports = lazy(() => import('./pages/admin/reports/CategoryBrandReports'));
const IndividualVendorReport = lazy(() => import('./pages/admin/reports/IndividualVendorReport'));

// Vendor Pages
const VendorDashboard = lazy(() => import('./pages/vendor/VendorDashboard'));
const VendorProducts = lazy(() => import('./pages/vendor/VendorProducts'));
const VendorOrders = lazy(() => import('./pages/vendor/VendorOrders'));

import { useAppDispatch, useAppSelector } from './hooks/useTypedSelector';
import { useGetProfileQuery } from './store/api/authApi';
import { setCredentials, logout } from './store/slices/authSlice';
import LoadingSpinner from './components/common/LoadingSpinner';
const About = lazy(() => import('./pages/info/About'));
const Careers = lazy(() => import('./pages/info/Careers'));
const Help = lazy(() => import('./pages/info/Help'));
const Contact = lazy(() => import('./pages/info/Contact'));
const Shipping = lazy(() => import('./pages/info/Shipping'));
const Disclaimer = lazy(() => import('./pages/info/Disclaimer'));
const Cookies = lazy(() => import('./pages/info/Cookies'));
const Terms = lazy(() => import('./pages/info/Terms'));
const Privacy = lazy(() => import('./pages/info/Privacy').then((module) => ({ default: module.Privacy })));
const Returns = lazy(() => import('./pages/info/Returns'));
const Blog = lazy(() => import('./pages/info/Blog'));
const Press = lazy(() => import('./pages/info/Press'));

// Auth screens render outside Layout; index.html has already painted the
// storefront background, so a blank frame avoids a light spinner flash.
const AuthFallback: React.FC = () => <div className="min-h-screen" aria-busy="true" />;

// Shown while a saved token is being turned back into a logged-in user after a page refresh
const SessionLoading: React.FC = () => (
  <div className="flex justify-center items-center min-h-screen">
    <LoadingSpinner size="lg" />
  </div>
);

// Role-based Route Protection
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, token } = useAppSelector((state) => state.auth);

  if (token && !isAuthenticated) return <SessionLoading />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!user) return <div>Loading user data...</div>;
  if (user.user_type !== 'admin') return <Navigate to="/" replace />;

  return <>{children}</>;
};

const VendorRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, token } = useAppSelector((state) => state.auth);

  if (token && !isAuthenticated) return <SessionLoading />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!user) return <div>Loading user data...</div>;
  if (user.user_type !== 'vendor') return <Navigate to="/" replace />;

  return <>{children}</>;
};

const CustomerRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, token } = useAppSelector((state) => state.auth);

  if (token && !isAuthenticated) return <SessionLoading />;

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

  const { data: userData, isError: profileFailed } = useGetProfileQuery(undefined, {
    skip: !token || isAuthenticated,
  });

  useEffect(() => {
    if (token && userData && !isAuthenticated) {
      dispatch(setCredentials({
        user: userData,
        tokens: { access: token, refresh: localStorage.getItem('refreshToken') || '' }
      }));
    }
  }, [token, userData, isAuthenticated, dispatch]);

  // Saved token is expired/invalid - clear it so the route guards stop waiting and send the user to login
  useEffect(() => {
    if (token && !isAuthenticated && profileFailed) {
      dispatch(logout());
    }
  }, [token, isAuthenticated, profileFailed, dispatch]);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        {/* Safety net only: Layout renders its own fallbacks around lazy pages. */}
        <Suspense fallback={<SessionLoading />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Suspense fallback={<AuthFallback />}><Login /></Suspense>} />
          <Route path="/register" element={<Suspense fallback={<AuthFallback />}><Register /></Suspense>} />
          <Route path="/vendor-register" element={<Suspense fallback={<AuthFallback />}><VendorRegister /></Suspense>} />

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
            <Route path="orders" element={<VendorOrders />} />
          </Route>

          {/* Customer Routes - Only for customers */}
          <Route path="/" element={<CustomerRoute><Layout /></CustomerRoute>}>
            <Route index element={<Home />} />
            <Route path="products" element={<Products />} />

            {/* Footer Pages */}
            <Route path="about" element={<About />} />
            <Route path="careers" element={<Careers />} />
            <Route path="press" element={<Press/>} />
            <Route path="blog" element={<Blog/>} />

            <Route path="help" element={<Help />}/>
            <Route path="contact" element={<Contact />}/>
            <Route path="shipping" element={<Shipping />} />
            <Route path="returns" element={<Returns/>} />

            <Route path="privacy" element={<Privacy />} />
            <Route path="terms" element={<Terms />} />
            <Route path="cookies" element={<Cookies/>} />
            <Route path="disclaimer" element={<Disclaimer />} />

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
        </Suspense>

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