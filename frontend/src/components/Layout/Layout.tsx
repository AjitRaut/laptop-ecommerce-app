import React, { Suspense, useLayoutEffect } from 'react';
import { Outlet, useLocation, useOutlet } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Header from './Header';
import Footer from './Footer';
import { useAuth } from '@/hooks/useAuth';
import AdminHeader from './AdminHeader';
import VendorHeader from './VendorHeader';
import LoadingSpinner from '../common/LoadingSpinner';
import StorefrontShell, { PageTransition, SkipLink } from '../storefront/StorefrontShell';
import { Skeleton } from '../storefront/Skeleton';
import { container } from '../storefront/utils';

/** Shown inside the storefront chrome while a lazily-loaded page chunk downloads. */
const PageFallback: React.FC = () => (
  <div role="status" aria-label="Loading page" className={`${container} space-y-6 pt-12`}>
    <Skeleton className="h-4 w-24" />
    <Skeleton className="h-12 w-2/3 max-w-xl" />
    <div className="grid grid-cols-1 gap-5 pt-4 sm:grid-cols-2 lg:grid-cols-3">
      <Skeleton className="h-72 rounded-sf-lg" />
      <Skeleton className="h-72 rounded-sf-lg" />
      <Skeleton className="hidden h-72 rounded-sf-lg lg:block" />
    </div>
  </div>
);

/** Customer-facing chrome: themed shell, glass header, animated route transitions. */
const StorefrontLayout: React.FC = () => {
  const location = useLocation();
  const outlet = useOutlet();

  return (
    <StorefrontShell>
      <SkipLink />
      <Header />
      <main id="main" className="flex-1 overflow-x-clip">
        <AnimatePresence mode="wait" initial={false} onExitComplete={() => window.scrollTo(0, 0)}>
          <PageTransition key={location.pathname}>
            <Suspense fallback={<PageFallback />}>{outlet}</Suspense>
          </PageTransition>
        </AnimatePresence>
      </main>
      <Footer />
    </StorefrontShell>
  );
};

const Layout: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();

  // Determine which layout to use based on route
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isVendorRoute = location.pathname.startsWith('/vendor');

  // index.html pre-paints the storefront theme before React loads; if an admin/vendor
  // was redirected here from a storefront URL, drop that pre-paint.
  useLayoutEffect(() => {
    if (isAdminRoute || isVendorRoute) document.documentElement.classList.remove('sf-boot', 'dark');
  }, [isAdminRoute, isVendorRoute]);

  // Customer routes get the storefront layout; admin/vendor markup below is unchanged.
  if (!isAdminRoute && !isVendorRoute) {
    return <StorefrontLayout />;
  }

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
        {/* Pages are lazy-loaded (see App.tsx); keep the header while a page chunk loads. */}
        <Suspense fallback={<LoadingSpinner size="lg" className="py-24" />}>
          <Outlet />
        </Suspense>
      </main>
      {showFooter && <Footer />}
    </div>
  );
};

export default Layout;
