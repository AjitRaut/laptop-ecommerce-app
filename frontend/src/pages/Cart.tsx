import React from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { TrashIcon, LockClosedIcon, ShieldCheckIcon, ArrowLeftIcon, TruckIcon } from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import { useGetCartQuery, useUpdateCartItemMutation, useRemoveFromCartMutation } from '@/store/api/ordersApi';
import { formatPrice } from '@/utils/formatters';
import EmptyState from '@/components/common/EmptyState';
import QuantitySelector from '@/components/common/QuantitySelector';
import SEO from '@/components/common/SEO';
import AnimatedPrice from '@/components/storefront/AnimatedPrice';
import CheckoutStepper from '@/components/storefront/CheckoutStepper';
import GlassPanel from '@/components/storefront/GlassPanel';
import ProductImage from '@/components/storefront/ProductImage';
import { SfLinkButton } from '@/components/storefront/SfButton';
import { RowSkeleton, Skeleton } from '@/components/storefront/Skeleton';
import { container, toNumber } from '@/components/storefront/utils';

const FREE_SHIPPING_THRESHOLD = 10000;

export const TrustBadges: React.FC<{ className?: string }> = ({ className }) => (
  <div className={clsx('flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-sf-subtle', className)}>
    <span className="inline-flex items-center gap-1.5">
      <LockClosedIcon className="h-4 w-4" /> Secure checkout
    </span>
    <span className="inline-flex items-center gap-1.5">
      <ShieldCheckIcon className="h-4 w-4" /> SSL encrypted
    </span>
  </div>
);

const Cart: React.FC = () => {
  const { data: cart, isLoading } = useGetCartQuery();
  const [updateCartItem, { isLoading: isUpdating }] = useUpdateCartItemMutation();
  const [removeFromCart, { isLoading: isRemoving }] = useRemoveFromCartMutation();

  const handleUpdateQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;

    try {
      await updateCartItem({ item_id: itemId, quantity: newQuantity }).unwrap();
      toast.success('Cart updated');
    } catch (error) {
      toast.error('Failed to update cart');
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    try {
      await removeFromCart(itemId).unwrap();
      toast.success('Item removed from cart');
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  const calculateSubtotal = () => {
    if (!cart?.items) return 0;
    return cart.items.reduce((total, item) => total + parseFloat(item.total_price), 0);
  };

  const subtotal = calculateSubtotal();
  const tax = subtotal * 0.18; // 18% tax
  const shipping = subtotal > FREE_SHIPPING_THRESHOLD ? 0 : 100; // Free shipping over ₹10,000
  const total = subtotal + tax + shipping;
  const shippingProgress = Math.min(1, subtotal / FREE_SHIPPING_THRESHOLD);

  if (isLoading) {
    return (
      <div className={clsx(container, 'pt-10')}>
        <Skeleton className="mx-auto h-10 w-full max-w-xl rounded-full" />
        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <RowSkeleton rows={3} />
          </div>
          <Skeleton className="h-80 rounded-sf-lg lg:col-span-4" />
        </div>
      </div>
    );
  }

  if (!cart?.items || cart.items.length === 0) {
    return (
      <div className={clsx(container, 'flex min-h-[70vh] items-center justify-center')}>
        <SEO title="Your Cart" />
        <EmptyState
          headingLevel="h1"
          illustration="cart"
          title="Your cart is empty"
          description="Looks like you haven't added any items to your cart yet."
          action={
            <SfLinkButton to="/products" size="lg">
              Continue Shopping
            </SfLinkButton>
          }
        />
      </div>
    );
  }

  return (
    <div className={clsx(container, 'pt-8 sm:pt-10')}>
      <SEO title="Your Cart" />
      <CheckoutStepper current="Cart" />

      <div className="mt-12">
        <h1 className="font-display text-4xl font-semibold tracking-tight text-sf-ink sm:text-5xl">Shopping Cart</h1>
        <p className="mt-2 text-sm text-sf-muted">
          {cart.items.length} {cart.items.length === 1 ? 'item' : 'items'} in your cart
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Items */}
        <section aria-label="Cart items" className="lg:col-span-8">
          <ul className="space-y-4">
            <AnimatePresence mode="popLayout" initial={false}>
              {cart.items.map((item, index) => (
                <motion.li
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: index * 0.05 } }}
                  exit={{ opacity: 0, x: -40, scale: 0.96 }}
                  className="sf-card flex gap-4 p-4 sm:gap-6 sm:p-5"
                >
                  <Link to={`/products/${item.product.id}`} className="flex-shrink-0 rounded-sf" tabIndex={-1} aria-hidden="true">
                    <ProductImage
                      src={item.product.primary_image}
                      alt=""
                      label={item.product.brand_name}
                      className="h-24 w-24 rounded-sf sm:h-28 sm:w-28"
                      imgClassName="p-2"
                    />
                  </Link>

                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-medium uppercase tracking-[0.14em] text-sf-subtle">
                          {item.product.brand_name}
                        </p>
                        <h2 className="mt-1 font-display text-base font-semibold leading-snug text-sf-ink sm:text-lg">
                          <Link to={`/products/${item.product.id}`} className="hover:text-sf-accent">
                            {item.product.name}
                          </Link>
                        </h2>
                        <p className="mt-1 text-sm tabular-nums text-sf-muted">
                          {formatPrice(item.product.discounted_price)} each
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={isRemoving}
                        aria-label={`Remove ${item.product.name} from cart`}
                        title="Remove item"
                        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-sf-subtle transition-colors hover:bg-sf-danger/10 hover:text-sf-danger disabled:opacity-50"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-4">
                      <QuantitySelector
                        quantity={item.quantity}
                        onQuantityChange={(next) => handleUpdateQuantity(item.id, next)}
                        max={item.product.stock_quantity > 0 ? item.product.stock_quantity : 99}
                        disabled={isUpdating}
                        size="sm"
                        label={`Quantity for ${item.product.name}`}
                      />
                      <AnimatedPrice
                        value={toNumber(item.total_price)}
                        className="font-display text-lg font-semibold text-sf-ink"
                      />
                    </div>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>

          <Link
            to="/products"
            className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-sf-muted transition-colors hover:text-sf-ink"
          >
            <ArrowLeftIcon className="h-4 w-4" /> Continue Shopping
          </Link>
        </section>

        {/* Summary */}
        <aside aria-labelledby="cart-summary" className="lg:col-span-4">
          <GlassPanel glow className="shadow-sf-float lg:sticky lg:top-24">
            <h2 id="cart-summary" className="font-display text-lg font-semibold text-sf-ink">
              Order Summary
            </h2>

            <dl className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-sf-muted">Subtotal</dt>
                <dd>
                  <AnimatedPrice value={subtotal} className="font-medium text-sf-ink" />
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sf-muted">Tax (18%)</dt>
                <dd>
                  <AnimatedPrice value={tax} className="font-medium text-sf-ink" />
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sf-muted">Shipping</dt>
                <dd className={clsx('font-medium', shipping === 0 ? 'text-sf-success' : 'text-sf-ink')}>
                  {shipping === 0 ? 'Free' : formatPrice(shipping.toString())}
                </dd>
              </div>
            </dl>

            {/* Free-shipping progress */}
            <div className="mt-5 rounded-sf bg-sf-surface-2/70 p-3">
              <p className="flex items-center gap-2 text-xs text-sf-muted">
                <TruckIcon className="h-4 w-4 text-sf-accent" />
                {subtotal < FREE_SHIPPING_THRESHOLD ? (
                  <>Add {formatPrice((FREE_SHIPPING_THRESHOLD - subtotal).toString())} more for free shipping!</>
                ) : (
                  <>You&apos;ve unlocked free shipping.</>
                )}
              </p>
              <div
                className="mt-2 h-1.5 overflow-hidden rounded-full bg-sf-surface-3"
                role="progressbar"
                aria-label="Progress towards free shipping"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(shippingProgress * 100)}
              >
                <div
                  style={{ transform: `scaleX(${shippingProgress})` }}
                  className="h-full origin-left rounded-full bg-sf-gradient transition-transform duration-700 ease-sf-out"
                />
              </div>
            </div>

            <div className="mt-6 flex items-baseline justify-between border-t border-sf-line pt-5">
              <span className="font-display text-base font-semibold text-sf-ink">Total</span>
              <AnimatedPrice value={total} className="font-display text-3xl font-semibold tracking-tight text-sf-ink" />
            </div>

            <SfLinkButton to="/checkout" size="lg" fullWidth className="mt-6" leftIcon={<LockClosedIcon className="h-5 w-5" />}>
              Proceed to Checkout
            </SfLinkButton>
            <TrustBadges className="mt-5" />
          </GlassPanel>
        </aside>
      </div>
    </div>
  );
};

export default Cart;
