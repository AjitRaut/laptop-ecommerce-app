import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { useAuth } from '@/hooks/useAuth';
import AdminHeader from './AdminHeader';
import VendorHeader from './VendorHeader';

const Layout: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  
  // Determine which layout to use based on route
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isVendorRoute = location.pathname.startsWith('/vendor');
  
  // Determine which header to show
  let HeaderComponent = Header;
  if (isAdminRoute && user?.user_type === 'admin') {
    HeaderComponent = AdminHeader;
  } else if (isVendorRoute && user?.user_type === 'vendor') {
    HeaderComponent = VendorHeader;
  }
  
  // Show footer only for customer routes
  const showFooter = !isAdminRoute && !isVendorRoute;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <HeaderComponent />
      <main className="flex-1">
        <Outlet />
      </main>
      {showFooter && <Footer />}
    </div>
  );
};

export default Layout;