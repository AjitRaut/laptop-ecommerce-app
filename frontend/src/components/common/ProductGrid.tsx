import React from 'react';
import { clsx } from 'clsx';
import ProductCard from './ProductCard';
import EmptyState from './EmptyState';
import type { Product } from '@/types';
import { ProductGridSkeleton } from '../storefront/Skeleton';
import { RevealGroup, RevealItem } from '../storefront/Reveal';
import { SfButton } from '../storefront/SfButton';

interface ProductGridProps {
  products: Product[];
  isLoading: boolean;
  error?: unknown;
  emptyStateProps?: {
    title: string;
    description: string;
    action?: React.ReactNode;
  };
  /** Mark every card as already wishlisted (Wishlist page). */
  inWishlist?: boolean;
  skeletonCount?: number;
  /** Responsive grid-cols-* classes; replaces the default column layout. */
  columns?: string;
  className?: string;
}

const defaultColumns = 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';

const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  isLoading,
  error,
  emptyStateProps,
  inWishlist = false,
  skeletonCount = 8,
  columns: columnClasses = defaultColumns,
  className,
}) => {
  const columns = clsx('grid gap-5', columnClasses, className);

  if (isLoading) {
    return <ProductGridSkeleton count={skeletonCount} className={columns} />;
  }

  if (error) {
    return (
      <EmptyState
        illustration="error"
        title="Error loading products"
        description="We encountered an error while loading products. Please try again."
        action={<SfButton onClick={() => window.location.reload()}>Retry</SfButton>}
      />
    );
  }

  if (products.length === 0) {
    return (
      <EmptyState
        illustration="search"
        title={emptyStateProps?.title || 'No products found'}
        description={emptyStateProps?.description || 'Try adjusting your search criteria.'}
        action={emptyStateProps?.action}
      />
    );
  }

  return (
    <RevealGroup className={columns}>
      {products.map((product) => (
        <RevealItem key={product.id} className="h-full">
          <ProductCard product={product} inWishlist={inWishlist} />
        </RevealItem>
      ))}
    </RevealGroup>
  );
};

export default ProductGrid;
