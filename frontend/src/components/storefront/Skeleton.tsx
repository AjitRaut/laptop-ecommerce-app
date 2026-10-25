import React from 'react';
import { clsx } from 'clsx';

export const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div aria-hidden="true" className={clsx('sf-skeleton rounded-sf-sm', className)} />
);

export const ProductCardSkeleton: React.FC = () => (
  <div aria-hidden="true" className="rounded-sf-lg border border-sf-line bg-sf-surface/60 p-3">
    <Skeleton className="aspect-[4/3] w-full rounded-sf" />
    <div className="space-y-3 p-2 pt-5">
      <Skeleton className="h-3 w-1/3" />
      <Skeleton className="h-5 w-4/5" />
      <Skeleton className="h-6 w-2/5" />
    </div>
  </div>
);

export const ProductGridSkeleton: React.FC<{ count?: number; className?: string }> = ({ count = 8, className }) => (
  <div role="status" aria-label="Loading products" className={className}>
    {Array.from({ length: count }, (_, index) => (
      <ProductCardSkeleton key={index} />
    ))}
  </div>
);

/** Generic list-row skeleton for cart, orders and checkout summaries. */
export const RowSkeleton: React.FC<{ rows?: number }> = ({ rows = 3 }) => (
  <div role="status" aria-label="Loading" className="space-y-4">
    {Array.from({ length: rows }, (_, index) => (
      <div key={index} className="flex items-center gap-4 rounded-sf-lg border border-sf-line bg-sf-surface/60 p-4">
        <Skeleton className="h-20 w-20 flex-shrink-0 rounded-sf" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-1/3" />
        </div>
        <Skeleton className="h-5 w-20" />
      </div>
    ))}
  </div>
);
