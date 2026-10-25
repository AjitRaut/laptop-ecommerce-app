import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { HeartIcon, ShoppingBagIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { clsx } from 'clsx';
import { useAddToCartMutation, useAddToWishlistMutation } from '@/store/api/ordersApi';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-hot-toast';
import { formatPrice } from '@/utils/formatters';
import type { Product } from '@/types';
import TiltCard from '../storefront/TiltCard';
import ProductImage from '../storefront/ProductImage';
import { SfButton } from '../storefront/SfButton';
import { useCartFly } from '../storefront/CartFly';
import { toNumber } from '../storefront/utils';

interface ProductCardProps {
  product: Product;
  inWishlist?: boolean;
  className?: string;
}

/**
 * Storefront product tile. The product name is a "stretched" link covering the
 * card, so the wishlist / add-to-cart buttons are siblings of the link rather
 * than nested inside it (nested interactive elements are invalid HTML).
 */
const ProductCard: React.FC<ProductCardProps> = ({ product, inWishlist = false, className }) => {
  const { isAuthenticated } = useAuth();
  const [addToCart, { isLoading: isAddingToCart }] = useAddToCartMutation();
  const [addToWishlist, { isLoading: isAddingToWishlist }] = useAddToWishlistMutation();
  const { flyToCart } = useCartFly();
  const imageRef = useRef<HTMLDivElement>(null);

  const discount = toNumber(product.discount_percentage);
  const productUrl = `/products/${product.id}`;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return;
    }

    try {
      await addToCart({ product_id: product.id, quantity: 1 }).unwrap();
      flyToCart(imageRef.current, product.primary_image);
      toast.success('Added to cart!');
    } catch (error) {
      toast.error('Failed to add to cart');
    }
  };

  const handleAddToWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error('Please login to add items to wishlist');
      return;
    }

    try {
      await addToWishlist(product.id).unwrap();
      toast.success('Added to wishlist!');
    } catch (error) {
      toast.error('Failed to add to wishlist');
    }
  };

  return (
    <TiltCard className={clsx('h-full', className)} innerClassName="rounded-sf-lg">
      <article className="group relative flex h-full flex-col rounded-sf-lg border border-sf-line bg-sf-surface/80 p-3 shadow-sf-card transition-colors duration-300 [transform-style:preserve-3d] hover:border-sf-accent/40">
        {/* Whole-card click target. Keyboard and screen-reader users get the title link
            below instead, so this duplicate is hidden from both. */}
        <Link to={productUrl} tabIndex={-1} aria-hidden="true" className="absolute inset-0 rounded-sf-lg" />

        {/* Image stage, lifted forward in 3D on hover-capable devices */}
        <div ref={imageRef} className="sf-depth-2 pointer-events-none relative">
          <ProductImage
            src={product.primary_image}
            alt={product.name}
            label={product.brand_name}
            className="aspect-[4/3] w-full rounded-sf"
            imgClassName="p-4 transition-transform duration-700 ease-sf-out group-hover:scale-[1.06]"
          />
          <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
            {discount > 0 && (
              <span className="rounded-full bg-sf-gradient px-2.5 py-1 text-xs font-semibold text-sf-on-accent shadow-sf-glow">
                {Math.round(discount)}% off
              </span>
            )}
            {/* Solid surface so the pill stays legible over the photo */}
            {product.is_featured && (
              <span className="rounded-full bg-sf-surface px-2.5 py-1 text-xs font-medium text-sf-violet shadow-sf-card ring-1 ring-inset ring-sf-violet/30">
                Featured
              </span>
            )}
            {!product.is_in_stock && (
              <span className="rounded-full bg-sf-surface px-2.5 py-1 text-xs font-medium text-sf-muted shadow-sf-card ring-1 ring-inset ring-sf-line-strong">
                Out of stock
              </span>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={handleAddToWishlist}
          disabled={isAddingToWishlist || inWishlist}
          aria-label={inWishlist ? `${product.name} is in your wishlist` : `Add ${product.name} to wishlist`}
          title={inWishlist ? 'In Wishlist' : 'Add to Wishlist'}
          className="sf-depth-3 absolute right-6 top-6 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-sf-surface/90 text-sf-muted shadow-sf-card ring-1 ring-sf-line backdrop-blur transition-colors hover:text-sf-danger disabled:cursor-default"
        >
          {inWishlist ? <HeartIconSolid className="h-5 w-5 text-sf-danger" /> : <HeartIcon className="h-5 w-5" />}
        </button>

        {/* Info */}
        {/* Clicks fall through this layer to the card link; only its controls catch them. */}
        <div className="sf-depth-1 pointer-events-none flex flex-1 flex-col px-2 pb-1 pt-4">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-sf-subtle">{product.brand_name}</p>
          <h3 className="mt-1.5 line-clamp-2 font-display text-base font-semibold leading-snug text-sf-ink">
            <Link to={productUrl} className="pointer-events-auto rounded-sm hover:text-sf-accent">
              {product.name}
            </Link>
          </h3>

          <div className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="font-display text-xl font-semibold tabular-nums text-sf-ink">
              {formatPrice(product.discounted_price)}
            </span>
            {discount > 0 && (
              <span className="text-sm tabular-nums text-sf-subtle line-through">{formatPrice(product.price)}</span>
            )}
          </div>

          <div className="mt-auto flex items-center justify-between gap-2 pt-4">
            <span className="inline-flex items-center gap-1.5 text-xs text-sf-subtle">
              <ShieldCheckIcon className="h-4 w-4" />
              {product.warranty_months} month warranty
              {product.is_low_stock && product.is_in_stock && (
                <span className="font-medium text-sf-warning">· Low stock</span>
              )}
            </span>
            <SfButton
              onClick={handleAddToCart}
              loading={isAddingToCart}
              disabled={!product.is_in_stock}
              size="sm"
              variant={product.is_in_stock ? 'primary' : 'outline'}
              aria-label={product.is_in_stock ? `Add ${product.name} to cart` : `${product.name} is out of stock`}
              leftIcon={<ShoppingBagIcon className="h-4 w-4" />}
              className="pointer-events-auto relative z-10 px-3"
            >
              {product.is_in_stock ? 'Add' : 'Sold out'}
            </SfButton>
          </div>
        </div>
      </article>
    </TiltCard>
  );
};

export default ProductCard;
