import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TruckIcon, ShieldCheckIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import StorefrontShell, { SkipLink } from './StorefrontShell';
import BrandLogo from './BrandLogo';
import CssLaptop from './CssLaptop';
import GlassPanel from './GlassPanel';
import { ThemeToggle } from './theme';
import { container } from './utils';

const valueProps = [
  {
    name: 'Free Shipping',
    description: 'Free shipping on orders over ₹10,000. Fast and reliable delivery across India.',
    icon: TruckIcon,
  },
  {
    name: 'Extended Warranty',
    description: 'Comprehensive warranty support and extended coverage on all products.',
    icon: ShieldCheckIcon,
  },
  {
    name: 'Easy Returns',
    description: '30-day hassle-free returns and exchange policy for your peace of mind.',
    icon: ArrowPathIcon,
  },
];

interface AuthShellProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  /** Extra content under the form card (e.g. "Already have an account?"). */
  footer?: React.ReactNode;
  /** Wider form card for long forms (vendor registration). */
  wide?: boolean;
}

/**
 * Chrome for the sign-in / sign-up screens, which render outside the main
 * Layout: storefront theme + minimal top bar + split visual/form layout.
 */
const AuthShell: React.FC<AuthShellProps> = ({ title, subtitle, children, footer, wide = false }) => (
  <StorefrontShell>
    <SkipLink />
    <header className={clsx(container, 'flex h-[72px] items-center justify-between')}>
      <Link to="/" aria-label="LaptopWorld home" className="rounded-full">
        <BrandLogo />
      </Link>
      <ThemeToggle />
    </header>

    <main id="main" className={clsx(container, 'flex-1 pb-16 pt-4 lg:pt-8')}>
      <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-12">
        {/* Visual panel (lg+) */}
        <aside aria-label="Why shop with LaptopWorld" className="hidden lg:sticky lg:top-8 lg:col-span-5 lg:block">
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative isolate overflow-hidden rounded-sf-xl border border-sf-line bg-sf-surface/60 p-10 shadow-sf-float"
          >
            <div className="absolute inset-0 -z-10">
              <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-[radial-gradient(closest-side,var(--sf-mesh-a),transparent)]" />
              <div className="absolute -bottom-28 -right-16 h-96 w-96 rounded-full bg-[radial-gradient(closest-side,var(--sf-mesh-b),transparent)]" />
              <div className="sf-grid-bg absolute inset-0 opacity-70" />
            </div>
            <p className="font-display text-xs font-semibold uppercase tracking-[0.22em] text-sf-accent">LaptopWorld</p>
            <p className="mt-3 font-display text-3xl font-semibold leading-tight tracking-tight text-sf-ink">
              Premium laptops, <span className="sf-gradient-text">delivered across India.</span>
            </p>
            <CssLaptop float className="mt-10 max-w-sm" />
            <ul className="mt-10 space-y-5">
              {valueProps.map((item) => (
                <li key={item.name} className="flex gap-4">
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-sf bg-sf-gradient text-sf-on-accent shadow-sf-glow">
                    <item.icon className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block font-display text-sm font-semibold text-sf-ink">{item.name}</span>
                    <span className="mt-0.5 block text-sm leading-relaxed text-sf-muted">{item.description}</span>
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>
        </aside>

        {/* Form card */}
        <div className="lg:col-span-7">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className={clsx('mx-auto w-full', wide ? 'max-w-2xl' : 'max-w-xl')}
          >
            <GlassPanel glow padded={false} className="p-6 sm:p-10">
              <div className="mb-8">
                <h1 className="font-display text-3xl font-semibold tracking-tight text-sf-ink sm:text-4xl">{title}</h1>
                {subtitle && <p className="mt-2 text-sf-muted">{subtitle}</p>}
              </div>
              {children}
            </GlassPanel>
            {footer && <div className="mt-6 text-center text-sm text-sf-muted">{footer}</div>}
          </motion.div>
        </div>
      </div>
    </main>
  </StorefrontShell>
);

export default AuthShell;
