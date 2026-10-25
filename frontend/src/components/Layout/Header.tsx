import React, { Fragment, Suspense, lazy, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Dialog, Menu, Popover, Transition } from '@headlessui/react';
import {
  Bars3Icon,
  XMarkIcon,
  ShoppingBagIcon,
  HeartIcon,
  UserIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  ClipboardDocumentListIcon,
  ArrowRightStartOnRectangleIcon,
  ArrowRightIcon,
  TruckIcon,
} from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { logout } from '@/store/slices/authSlice';
import { useAppDispatch } from '@/hooks/useTypedSelector';
import { useGetBrandsQuery, useGetCategoriesQuery } from '@/store/api/productsApi';
import BrandLogo from '../storefront/BrandLogo';
import CssLaptop from '../storefront/CssLaptop';
import { ThemeToggle } from '../storefront/theme';
import { useCartFly } from '../storefront/CartFly';
import { useScrolled } from '../storefront/hooks';
import { categoryBlurb, categoryIcon } from '../storefront/categoryVisuals';
import { sfButtonClasses } from '../storefront/SfButton';
import { container } from '../storefront/utils';

// The palette (Combobox + live search) is fetched on first use; hovering or
// focusing a search trigger prefetches it so it still opens instantly.
const loadCommandPalette = () => import('../storefront/CommandPalette');
const CommandPalette = lazy(loadCommandPalette);
const prefetchPalette = () => {
  void loadCommandPalette();
};

const navigation = [
  { name: 'Laptops', href: '/products?category=laptop' },
  { name: 'Accessories', href: '/products?category=accessories' },
  { name: 'Support', href: '/help' },
];

const isMac = typeof navigator !== 'undefined' && /mac|iphone|ipad/i.test(navigator.platform);

const iconButton =
  'relative inline-flex h-10 w-10 items-center justify-center rounded-full text-sf-muted transition-colors hover:bg-sf-surface-2 hover:text-sf-ink';

const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [paletteOpen, setPaletteOpenState] = useState(false);
  const [paletteRequested, setPaletteRequested] = useState(false);
  const setPaletteOpen = (open: boolean) => {
    if (open) setPaletteRequested(true);
    setPaletteOpenState(open);
  };
  const { isAuthenticated, user } = useAuth();
  const { itemCount } = useCart();
  const { registerTarget, bumpKey } = useCartFly();
  const scrolled = useScrolled(12);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: categories } = useGetCategoriesQuery();
  const { data: brands } = useGetBrandsQuery();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  // Ctrl/Cmd + K opens the command palette from anywhere on the storefront.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setPaletteRequested(true);
        setPaletteOpenState(true);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const isActive = (href: string) =>
    href.includes('?') ? `${location.pathname}${location.search}` === href : location.pathname === href;

  return (
    <header className="sticky top-0 z-40">
      {/* Glass bar fades in and "shrinks" (scaleY) once the page scrolls: transform/opacity only. */}
      <div
        aria-hidden="true"
        className={clsx(
          'sf-glass absolute inset-0 origin-top border-x-0 border-t-0 transition-[opacity,transform] duration-500 ease-sf-out',
          scrolled ? 'scale-y-[0.86] opacity-100' : 'opacity-0'
        )}
      />
      <nav
        aria-label="Primary"
        className={clsx(
          container,
          'relative flex h-[72px] items-center gap-2 transition-transform duration-500 ease-sf-out sm:gap-4',
          scrolled && '-translate-y-[5px]'
        )}
      >
        <Link
          to="/"
          aria-label="LaptopWorld home"
          className={clsx('mr-2 flex-shrink-0 rounded-full transition-transform duration-500 ease-sf-out', scrolled && 'scale-95')}
        >
          <BrandLogo />
        </Link>

        {/* Desktop navigation */}
        <div className="hidden items-center gap-1 lg:flex">
          <Popover>
            {({ open, close }) => (
              <>
                <Popover.Button
                  className={clsx(
                    'inline-flex items-center gap-1 rounded-full px-3.5 py-2 text-sm font-medium transition-colors',
                    open ? 'bg-sf-surface-2 text-sf-ink' : 'text-sf-muted hover:text-sf-ink'
                  )}
                >
                  Shop
                  <ChevronDownIcon className={clsx('h-4 w-4 transition-transform duration-300', open && 'rotate-180')} />
                </Popover.Button>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-200"
                  enterFrom="opacity-0 -translate-y-2"
                  enterTo="opacity-100 translate-y-0"
                  leave="transition ease-in duration-150"
                  leaveFrom="opacity-100 translate-y-0"
                  leaveTo="opacity-0 -translate-y-2"
                >
                  <Popover.Panel className={clsx(container, 'absolute inset-x-0 top-full mt-1')}>
                    <div className="sf-glass grid grid-cols-12 gap-6 rounded-sf-xl bg-sf-glass-strong p-6 shadow-sf-float">
                      <div className="col-span-6">
                        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-sf-subtle">Categories</p>
                        <ul className="grid grid-cols-2 gap-2">
                          {categories?.results?.map((category) => {
                            const Icon = categoryIcon(category.name);
                            return (
                              <li key={category.id}>
                                <Link
                                  to={`/products?category=${category.id}`}
                                  onClick={() => close()}
                                  className="group flex gap-3 rounded-sf p-3 transition-colors hover:bg-sf-surface-2"
                                >
                                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-sf-sm bg-sf-gradient text-sf-on-accent shadow-sf-glow transition-transform duration-300 group-hover:-translate-y-0.5">
                                    <Icon className="h-5 w-5" />
                                  </span>
                                  <span>
                                    <span className="block text-sm font-semibold text-sf-ink">{category.name}</span>
                                    <span className="mt-0.5 block text-xs leading-relaxed text-sf-subtle">
                                      {categoryBlurb(category.name, category.description)}
                                    </span>
                                  </span>
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                      <div className="col-span-2">
                        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-sf-subtle">Brands</p>
                        <ul className="space-y-1">
                          {brands?.results?.map((brand) => (
                            <li key={brand.id}>
                              <Link
                                to={`/products?brand=${brand.id}`}
                                onClick={() => close()}
                                className="block rounded-sf-sm px-3 py-1.5 text-sm text-sf-muted transition-colors hover:bg-sf-surface-2 hover:text-sf-ink"
                              >
                                {brand.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <Link
                        to="/products"
                        onClick={() => close()}
                        className="group relative col-span-4 flex flex-col justify-between overflow-hidden rounded-sf-lg bg-sf-surface-2 p-5 ring-1 ring-sf-line"
                      >
                        <div className="absolute -right-10 -top-16 h-48 w-48 rounded-full bg-sf-gradient opacity-30 blur-3xl" />
                        <CssLaptop size="sm" label="LaptopWorld" className="relative max-w-[220px] transition-transform duration-500 group-hover:-translate-y-1" />
                        <div className="relative mt-4">
                          <p className="font-display text-lg font-semibold text-sf-ink">Browse all products</p>
                          <p className="mt-1 flex items-center gap-1.5 text-xs text-sf-subtle">
                            <TruckIcon className="h-4 w-4" /> Free shipping over ₹10,000
                          </p>
                          <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-sf-accent">
                            Shop now <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                          </span>
                        </div>
                      </Link>
                    </div>
                  </Popover.Panel>
                </Transition>
              </>
            )}
          </Popover>

          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              aria-current={isActive(item.href) ? 'page' : undefined}
              className={clsx(
                'group relative rounded-full px-3.5 py-2 text-sm font-medium transition-colors',
                isActive(item.href) ? 'text-sf-ink' : 'text-sf-muted hover:text-sf-ink'
              )}
            >
              {item.name}
              <span
                aria-hidden="true"
                className={clsx(
                  'absolute inset-x-3.5 -bottom-0.5 h-px origin-left bg-sf-gradient transition-transform duration-300',
                  isActive(item.href) ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                )}
              />
            </Link>
          ))}
        </div>

        {/* Search trigger (desktop) */}
        <button
          type="button"
          onClick={() => setPaletteOpen(true)}
          onMouseEnter={prefetchPalette}
          onFocus={prefetchPalette}
          className="ml-auto hidden h-10 w-full max-w-xs items-center gap-3 rounded-full border border-sf-line-strong bg-sf-surface/60 pl-4 pr-2 text-sm text-sf-subtle transition-colors hover:border-sf-accent/50 hover:text-sf-muted md:flex"
        >
          <MagnifyingGlassIcon className="h-4 w-4" />
          <span className="flex-1 text-left">Search laptops, accessories…</span>
          <kbd className="rounded-md border border-sf-line-strong bg-sf-surface-2 px-1.5 py-0.5 font-body text-[11px] text-sf-subtle">
            {isMac ? '⌘K' : 'Ctrl K'}
          </kbd>
        </button>

        {/* Actions */}
        <div className="ml-auto flex items-center gap-0.5 md:ml-0 sm:gap-1">
          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            onPointerDown={prefetchPalette}
            aria-label="Search"
            className={clsx(iconButton, 'md:hidden')}
          >
            <MagnifyingGlassIcon className="h-5 w-5" />
          </button>
          <ThemeToggle />

          {isAuthenticated ? (
            <>
              <Link to="/wishlist" aria-label="Wishlist" className={clsx(iconButton, 'hidden sm:inline-flex')}>
                <HeartIcon className="h-5 w-5" />
              </Link>
              <Link
                to="/cart"
                ref={registerTarget}
                aria-label={`Cart, ${itemCount} ${itemCount === 1 ? 'item' : 'items'}`}
                className={iconButton}
              >
                <ShoppingBagIcon className="h-5 w-5" />
                {itemCount > 0 && (
                  <span
                    key={bumpKey}
                    className={clsx(
                      'absolute -right-0.5 -top-0.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-sf-gradient px-1 text-[11px] font-semibold text-sf-on-accent shadow-sf-glow',
                      bumpKey > 0 && 'animate-sf-bounce'
                    )}
                  >
                    {itemCount}
                  </span>
                )}
              </Link>

              <Menu as="div" className="relative ml-1 hidden lg:block">
                <Menu.Button className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2.5 text-sm text-sf-muted transition-colors hover:bg-sf-surface-2 hover:text-sf-ink">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sf-gradient text-sm font-semibold text-sf-on-accent">
                    {user?.first_name?.charAt(0) || 'U'}
                  </span>
                  <span className="max-w-[7rem] truncate font-medium">{user?.first_name || 'Profile'}</span>
                  <ChevronDownIcon className="h-4 w-4" />
                </Menu.Button>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-200"
                  enterFrom="opacity-0 translate-y-1 scale-95"
                  enterTo="opacity-100 translate-y-0 scale-100"
                  leave="transition ease-in duration-150"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Menu.Items className="sf-glass absolute right-0 mt-3 w-64 origin-top-right rounded-sf-lg bg-sf-glass-strong p-2 shadow-sf-float focus:outline-none">
                    <div className="border-b border-sf-line px-3 pb-3 pt-2">
                      <p className="truncate text-sm font-semibold text-sf-ink">
                        {user?.first_name} {user?.last_name}
                      </p>
                      <p className="truncate text-xs text-sf-subtle">{user?.email}</p>
                    </div>
                    <div className="pt-2">
                      {[
                        { label: 'My Profile', href: '/profile', icon: UserIcon },
                        { label: 'My Orders', href: '/orders', icon: ClipboardDocumentListIcon },
                        { label: 'Wishlist', href: '/wishlist', icon: HeartIcon },
                      ].map((item) => (
                        <Menu.Item key={item.href}>
                          {({ active }) => (
                            <Link
                              to={item.href}
                              className={clsx(
                                'flex items-center gap-3 rounded-sf-sm px-3 py-2 text-sm transition-colors',
                                active ? 'bg-sf-surface-2 text-sf-ink' : 'text-sf-muted'
                              )}
                            >
                              <item.icon className="h-4 w-4" />
                              {item.label}
                            </Link>
                          )}
                        </Menu.Item>
                      ))}
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            type="button"
                            onClick={handleLogout}
                            className={clsx(
                              'flex w-full items-center gap-3 rounded-sf-sm px-3 py-2 text-sm transition-colors',
                              active ? 'bg-sf-danger/10 text-sf-danger' : 'text-sf-muted'
                            )}
                          >
                            <ArrowRightStartOnRectangleIcon className="h-4 w-4" />
                            Sign Out
                          </button>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            </>
          ) : (
            <div className="ml-1 hidden items-center gap-1 sm:flex">
              <Link to="/login" className={sfButtonClasses({ variant: 'ghost', size: 'sm' })}>
                Sign In
              </Link>
              <Link to="/register" className={sfButtonClasses({ variant: 'primary', size: 'sm' })}>
                Sign Up
              </Link>
            </div>
          )}

          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
            className={clsx(iconButton, 'lg:hidden')}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
        </div>
      </nav>

      {paletteRequested && (
        <Suspense fallback={null}>
          <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
        </Suspense>
      )}

      {/* Mobile menu */}
      <Transition.Root show={mobileMenuOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={setMobileMenuOpen}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-sf-bg/70 backdrop-blur-sm" />
          </Transition.Child>
          <Transition.Child
            as={Fragment}
            enter="transform transition ease-sf-out duration-500"
            enterFrom="translate-x-full"
            enterTo="translate-x-0"
            leave="transform transition ease-in duration-200"
            leaveFrom="translate-x-0"
            leaveTo="translate-x-full"
          >
            <Dialog.Panel className="sf-glass fixed inset-y-0 right-0 flex w-full flex-col overflow-y-auto border-y-0 border-r-0 bg-sf-glass-strong px-4 py-4 sm:max-w-sm sm:px-6">
              <div className="flex items-center justify-between">
                <Link to="/" onClick={() => setMobileMenuOpen(false)} aria-label="LaptopWorld home">
                  <BrandLogo />
                </Link>
                <button type="button" className={iconButton} onClick={() => setMobileMenuOpen(false)} aria-label="Close menu">
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              <Dialog.Title className="sr-only">Menu</Dialog.Title>

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setPaletteOpen(true);
                }}
                className="mt-6 flex h-12 w-full items-center gap-3 rounded-full border border-sf-line-strong bg-sf-surface/60 px-4 text-sm text-sf-subtle"
              >
                <MagnifyingGlassIcon className="h-5 w-5" />
                Search laptops, accessories…
              </button>

              <div className="mt-6">
                <p className="px-3 text-xs font-semibold uppercase tracking-[0.2em] text-sf-subtle">Shop</p>
                <ul className="mt-2 space-y-1">
                  <li>
                    <Link
                      to="/products"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block rounded-sf px-3 py-2.5 text-base font-semibold text-sf-ink hover:bg-sf-surface-2"
                    >
                      All Products
                    </Link>
                  </li>
                  {categories?.results?.map((category) => {
                    const Icon = categoryIcon(category.name);
                    return (
                      <li key={category.id}>
                        <Link
                          to={`/products?category=${category.id}`}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-3 rounded-sf px-3 py-2.5 text-base font-medium text-sf-muted hover:bg-sf-surface-2 hover:text-sf-ink"
                        >
                          <Icon className="h-5 w-5 text-sf-accent" />
                          {category.name}
                        </Link>
                      </li>
                    );
                  })}
                  {/* The category list above already covers the Laptops/Accessories shortcuts. */}
                  {navigation
                    .filter((item) => !item.href.startsWith('/products'))
                    .map((item) => (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="block rounded-sf px-3 py-2.5 text-base font-medium text-sf-muted hover:bg-sf-surface-2 hover:text-sf-ink"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 border-t border-sf-line pt-6">
                {isAuthenticated ? (
                  <ul className="space-y-1">
                    {[
                      { label: `Cart (${itemCount})`, href: '/cart', icon: ShoppingBagIcon },
                      { label: 'Wishlist', href: '/wishlist', icon: HeartIcon },
                      { label: 'Profile', href: '/profile', icon: UserIcon },
                      { label: 'Orders', href: '/orders', icon: ClipboardDocumentListIcon },
                    ].map((item) => (
                      <li key={item.href}>
                        <Link
                          to={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-3 rounded-sf px-3 py-2.5 text-base font-medium text-sf-ink hover:bg-sf-surface-2"
                        >
                          <item.icon className="h-5 w-5 text-sf-subtle" />
                          {item.label}
                        </Link>
                      </li>
                    ))}
                    <li>
                      <button
                        type="button"
                        onClick={() => {
                          handleLogout();
                          setMobileMenuOpen(false);
                        }}
                        className="flex w-full items-center gap-3 rounded-sf px-3 py-2.5 text-left text-base font-medium text-sf-danger hover:bg-sf-danger/10"
                      >
                        <ArrowRightStartOnRectangleIcon className="h-5 w-5" />
                        Sign Out
                      </button>
                    </li>
                  </ul>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className={sfButtonClasses({ variant: 'outline', size: 'lg', fullWidth: true })}
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className={sfButtonClasses({ variant: 'primary', size: 'lg', fullWidth: true })}
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </Dialog>
      </Transition.Root>
    </header>
  );
};

export default Header;
