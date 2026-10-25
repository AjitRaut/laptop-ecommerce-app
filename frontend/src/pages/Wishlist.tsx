import React from 'react';
import { clsx } from 'clsx';
import { useGetWishlistQuery } from '@/store/api/ordersApi';
import EmptyState from '@/components/common/EmptyState';
import ProductGrid from '@/components/common/ProductGrid';
import SEO from '@/components/common/SEO';
import { SfLinkButton } from '@/components/storefront/SfButton';
import { Skeleton } from '@/components/storefront/Skeleton';
import { container } from '@/components/storefront/utils';

const Wishlist: React.FC = () => {
  const { data: wishlist, isLoading } = useGetWishlistQuery();

  if (!isLoading && (!wishlist?.items || wishlist.items.length === 0)) {
    return (
      <div className={clsx(container, 'flex min-h-[70vh] items-center justify-center')}>
        <SEO title="Wishlist" />
        <EmptyState
          headingLevel="h1"
          illustration="wishlist"
          title="Your wishlist is empty"
          description="Save items you love to your wishlist. Review them anytime and easily move them to your cart."
          action={
            <SfLinkButton to="/products" size="lg">
              Start Shopping
            </SfLinkButton>
          }
        />
      </div>
    );
  }

  const count = wishlist?.items.length ?? 0;

  return (
    <div className={clsx(container, 'pt-8 sm:pt-12')}>
      <SEO title="Wishlist" />
      <p className="font-display text-xs font-semibold uppercase tracking-[0.22em] text-sf-accent">Saved for later</p>
      <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-sf-ink sm:text-5xl">My Wishlist</h1>
      <div className="mt-2 text-sm text-sf-muted">
        {isLoading ? <Skeleton className="h-4 w-24" /> : `${count} ${count === 1 ? 'item' : 'items'} saved`}
      </div>

      <div className="mt-10">
        <ProductGrid
          products={wishlist?.items.map((item) => item.product) ?? []}
          isLoading={isLoading}
          inWishlist
        />
      </div>
    </div>
  );
};

export default Wishlist;
