import React from 'react';
import {
  ShoppingBagIcon,
  HeartIcon,
  ClipboardDocumentListIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { clsx } from 'clsx';

export type IllustrationKind = 'cart' | 'wishlist' | 'orders' | 'search' | 'error';

const icons: Record<IllustrationKind, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  cart: ShoppingBagIcon,
  wishlist: HeartIcon,
  orders: ClipboardDocumentListIcon,
  search: MagnifyingGlassIcon,
  error: ExclamationTriangleIcon,
};

/**
 * Isometric "floating tile over a pedestal" illustration built from CSS
 * transforms only, so it themes automatically and costs nothing to load.
 */
const EmptyIllustration: React.FC<{ kind: IllustrationKind; className?: string }> = ({ kind, className }) => {
  const Icon = icons[kind];
  const danger = kind === 'error';

  return (
    <div aria-hidden="true" className={clsx('relative mx-auto h-48 w-56 [perspective:900px]', className)}>
      {/* Pedestal */}
      <div className="absolute bottom-4 left-1/2 h-28 w-40 -translate-x-1/2 [transform-style:preserve-3d]">
        <div className="absolute inset-0 rounded-3xl bg-sf-surface-2 ring-1 ring-sf-line-strong [transform:rotateX(68deg)]" />
        <div className="absolute inset-6 rounded-2xl bg-sf-gradient opacity-30 blur-xl [transform:rotateX(68deg)]" />
      </div>
      {/* Floating glass tile */}
      <div className="absolute left-1/2 top-2 -translate-x-1/2">
        <div className="animate-sf-float">
          <div className="sf-glass sf-gradient-border relative flex h-24 w-24 items-center justify-center rounded-3xl shadow-sf-float [transform:rotateX(14deg)_rotateY(-18deg)]">
            <Icon className={clsx('h-10 w-10', danger ? 'text-sf-warning' : 'text-sf-accent')} />
            <span className="absolute -right-2 -top-2 h-5 w-5 rounded-full bg-sf-gradient shadow-sf-glow" />
          </div>
        </div>
      </div>
      {/* Orbiting accents */}
      <span className="absolute left-6 top-10 h-2 w-2 rounded-full bg-sf-cyan/70" />
      <span className="absolute right-8 top-20 h-3 w-3 rounded-full bg-sf-violet/60" />
    </div>
  );
};

export default EmptyIllustration;
