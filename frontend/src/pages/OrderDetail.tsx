import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeftIcon, DocumentArrowDownIcon, MapPinIcon, PhoneIcon } from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import { useGetOrderQuery } from '@/store/api/ordersApi';
import { formatPrice, formatDate } from '@/utils/formatters';
import EmptyState from '@/components/common/EmptyState';
import SEO from '@/components/common/SEO';
import GlassPanel from '@/components/storefront/GlassPanel';
import OrderTimeline from '@/components/storefront/OrderTimeline';
import ProductImage from '@/components/storefront/ProductImage';
import StatusPill, { capitalize, orderStatusTone, paymentStatusTone } from '@/components/storefront/StatusPill';
import { SfButton, SfLinkButton } from '@/components/storefront/SfButton';
import { RowSkeleton, Skeleton } from '@/components/storefront/Skeleton';
import { container, toNumber } from '@/components/storefront/utils';
import { downloadOrderPDF } from './Orders';

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.5 },
});

const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading, error } = useGetOrderQuery(id!);

  const handleDownloadPDF = async () => {
    if (order) await downloadOrderPDF(order);
  };

  if (isLoading) {
    return (
      <div className={clsx(container, 'pt-10')}>
        <Skeleton className="h-12 w-72" />
        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <RowSkeleton rows={3} />
          </div>
          <Skeleton className="h-72 rounded-sf-lg lg:col-span-4" />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className={clsx(container, 'flex min-h-[70vh] items-center justify-center')}>
        <SEO title="Order not found" />
        <EmptyState
          headingLevel="h1"
          illustration="orders"
          title="Order not found"
          description="The order you're looking for doesn't exist."
          action={<SfLinkButton to="/orders">Back to Orders</SfLinkButton>}
        />
      </div>
    );
  }

  return (
    <div className={clsx(container, 'pt-8 sm:pt-12')}>
      <SEO title={`Order #${order.order_id}`} />
      <Link
        to="/orders"
        className="inline-flex items-center gap-2 text-sm font-medium text-sf-muted transition-colors hover:text-sf-ink"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Back to Orders
      </Link>

      <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-sf-ink sm:text-4xl">
            Order <span className="font-mono">#{order.order_id}</span>
          </h1>
          <p className="mt-2 text-sm text-sf-muted">Placed on {formatDate(order.created_at)}</p>
        </div>
        <SfButton onClick={handleDownloadPDF} leftIcon={<DocumentArrowDownIcon className="h-5 w-5" />}>
          Download PDF
        </SfButton>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          {/* Status */}
          <motion.div {...fadeUp(0)}>
            <GlassPanel as="section" aria-labelledby="order-status">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 id="order-status" className="font-display text-lg font-semibold text-sf-ink">
                  Order Status
                </h2>
                <div className="flex flex-wrap gap-2">
                  <StatusPill tone={orderStatusTone(order.status)} dot>
                    {capitalize(order.status)}
                  </StatusPill>
                  <StatusPill tone={paymentStatusTone(order.payment_status)}>Payment {order.payment_status}</StatusPill>
                </div>
              </div>
              <OrderTimeline status={order.status} className="mt-8" />
            </GlassPanel>
          </motion.div>

          {/* Items */}
          <motion.div {...fadeUp(0.1)}>
            <GlassPanel as="section" aria-labelledby="order-items">
              <h2 id="order-items" className="font-display text-lg font-semibold text-sf-ink">
                Order Items
              </h2>
              <ul className="mt-5 divide-y divide-sf-line">
                {order.items.map((item) => (
                  <li key={item.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                    <ProductImage
                      src={item.product_image}
                      alt=""
                      label={item.product_name}
                      className="h-20 w-20 flex-shrink-0 rounded-sf"
                      imgClassName="p-2"
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-sf-ink">{item.product_name}</h3>
                      <p className="mt-1 text-sm text-sf-subtle">Price: {formatPrice(item.product_price)}</p>
                      <p className="text-sm text-sf-subtle">Quantity: {item.quantity}</p>
                    </div>
                    <p className="font-display font-semibold tabular-nums text-sf-ink">{formatPrice(item.total_price)}</p>
                  </li>
                ))}
              </ul>
            </GlassPanel>
          </motion.div>
        </div>

        <div className="space-y-6 lg:col-span-4">
          {/* Shipping */}
          <motion.div {...fadeUp(0.15)}>
            <GlassPanel as="section" aria-labelledby="order-shipping">
              <h2 id="order-shipping" className="font-display text-lg font-semibold text-sf-ink">
                Shipping Address
              </h2>
              <div className="mt-4 space-y-2 text-sm text-sf-muted">
                <p className="font-medium text-sf-ink">{order.shipping_name}</p>
                <p className="flex gap-2">
                  <MapPinIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-sf-accent" />
                  <span>
                    {order.shipping_address}
                    <br />
                    {order.shipping_city}, {order.shipping_state} {order.shipping_pincode}
                  </span>
                </p>
                <p className="flex items-center gap-2">
                  <PhoneIcon className="h-4 w-4 flex-shrink-0 text-sf-accent" />
                  Phone: {order.shipping_phone}
                </p>
              </div>
            </GlassPanel>
          </motion.div>

          {/* Summary */}
          <motion.div {...fadeUp(0.2)}>
            <GlassPanel as="section" glow aria-labelledby="order-summary" className="shadow-sf-float">
              <h2 id="order-summary" className="font-display text-lg font-semibold text-sf-ink">
                Order Summary
              </h2>
              <dl className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-sf-muted">Subtotal</dt>
                  <dd className="font-medium tabular-nums text-sf-ink">{formatPrice(order.total_amount)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sf-muted">Tax</dt>
                  <dd className="font-medium tabular-nums text-sf-ink">{formatPrice(order.tax_amount)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sf-muted">Shipping</dt>
                  <dd className="font-medium tabular-nums text-sf-ink">{formatPrice(order.shipping_charges)}</dd>
                </div>
                {toNumber(order.discount_amount) > 0 && (
                  <div className="flex justify-between">
                    <dt className="text-sf-muted">Discount</dt>
                    <dd className="font-medium tabular-nums text-sf-success">-{formatPrice(order.discount_amount)}</dd>
                  </div>
                )}
              </dl>
              <div className="mt-5 flex items-baseline justify-between border-t border-sf-line pt-5">
                <span className="font-display font-semibold text-sf-ink">Total</span>
                <span className="font-display text-2xl font-semibold tabular-nums text-sf-ink">
                  {formatPrice(order.final_amount)}
                </span>
              </div>
              {order.payment_method && (
                <p className="mt-4 text-xs text-sf-subtle">Paid via {order.payment_method.toUpperCase()}</p>
              )}
            </GlassPanel>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
