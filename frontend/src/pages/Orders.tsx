import React from 'react';
import { Link } from 'react-router-dom';
import { EyeIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import { useGetOrdersQuery } from '@/store/api/ordersApi';
import { formatPrice, formatDate } from '@/utils/formatters';
import type { Order } from '@/types';
import EmptyState from '@/components/common/EmptyState';
import SEO from '@/components/common/SEO';
import OrderTimeline from '@/components/storefront/OrderTimeline';
import ProductImage from '@/components/storefront/ProductImage';
import StatusPill, { capitalize, orderStatusTone, paymentStatusTone } from '@/components/storefront/StatusPill';
import { RevealGroup, RevealItem } from '@/components/storefront/Reveal';
import { SfButton, SfLinkButton } from '@/components/storefront/SfButton';
import { RowSkeleton, Skeleton } from '@/components/storefront/Skeleton';
import { container } from '@/components/storefront/utils';

/** jsPDF/html2canvas are only fetched when a customer actually downloads an invoice. */
export const downloadOrderPDF = async (order: Order) => {
  try {
    const { generateOrderPDF } = await import('@/utils/pdfGenerator');
    await generateOrderPDF(order);
  } catch (error) {
    console.error('Failed to generate PDF:', error);
  }
};

const Orders: React.FC = () => {
  const { data: orders, isLoading } = useGetOrdersQuery();

  if (isLoading) {
    return (
      <div className={clsx(container, 'pt-10')}>
        <Skeleton className="h-12 w-64" />
        <div className="mt-10">
          <RowSkeleton rows={3} />
        </div>
      </div>
    );
  }

  if (!orders || orders.results.length === 0) {
    return (
      <div className={clsx(container, 'flex min-h-[70vh] items-center justify-center')}>
        <SEO title="Your Orders" />
        <EmptyState
          headingLevel="h1"
          illustration="orders"
          title="No orders yet"
          description="You haven't placed any orders yet. Start shopping to see your orders here."
          action={
            <SfLinkButton to="/products" size="lg">
              Start Shopping
            </SfLinkButton>
          }
        />
      </div>
    );
  }

  return (
    <div className={clsx(container, 'pt-8 sm:pt-12')}>
      <SEO title="Your Orders" />
      <p className="font-display text-xs font-semibold uppercase tracking-[0.22em] text-sf-accent">Account</p>
      <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-sf-ink sm:text-5xl">Your Orders</h1>
      <p className="mt-2 text-sm text-sf-muted">Track and manage your orders</p>

      <RevealGroup as="ol" className="mt-10 space-y-5">
        {orders.results.map((order) => (
          <RevealItem key={order.id} as="li">
            <article aria-labelledby={`order-${order.id}`} className="sf-card overflow-hidden">
              <div className="flex flex-col gap-4 border-b border-sf-line p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                <div>
                  <h2 id={`order-${order.id}`} className="font-display text-lg font-semibold text-sf-ink">
                    Order <span className="font-mono text-base">#{order.order_id}</span>
                  </h2>
                  <p className="mt-1 text-sm text-sf-subtle">Placed on {formatDate(order.created_at)}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <StatusPill tone={orderStatusTone(order.status)} dot>
                    {capitalize(order.status)}
                  </StatusPill>
                  <StatusPill tone={paymentStatusTone(order.payment_status)}>
                    {capitalize(order.payment_status)}
                  </StatusPill>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 p-5 sm:p-6 lg:grid-cols-12 lg:items-center">
                <ul className="space-y-3 lg:col-span-7">
                  {order.items.slice(0, 3).map((item) => (
                    <li key={item.id} className="flex items-center gap-4">
                      <ProductImage
                        src={item.product_image}
                        alt=""
                        label={item.product_name}
                        className="h-14 w-14 flex-shrink-0 rounded-sf"
                        imgClassName="p-1.5"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-sf-ink">{item.product_name}</p>
                        <p className="text-xs text-sf-subtle">Quantity: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-medium tabular-nums text-sf-ink">{formatPrice(item.total_price)}</p>
                    </li>
                  ))}
                  {order.items.length > 3 && (
                    <li className="text-sm text-sf-subtle">and {order.items.length - 3} more items</li>
                  )}
                </ul>
                <div className="lg:col-span-5">
                  <OrderTimeline status={order.status} compact />
                </div>
              </div>

              <div className="flex flex-col gap-4 border-t border-sf-line bg-sf-surface-2/40 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <p className="text-sm text-sf-muted">
                  Total:{' '}
                  <span className="font-display text-lg font-semibold tabular-nums text-sf-ink">
                    {formatPrice(order.final_amount)}
                  </span>
                </p>
                <div className="flex gap-2">
                  <SfButton
                    variant="outline"
                    size="sm"
                    onClick={() => downloadOrderPDF(order)}
                    leftIcon={<DocumentArrowDownIcon className="h-4 w-4" />}
                  >
                    Download
                  </SfButton>
                  <SfLinkButton
                    to={`/orders/${order.order_id}`}
                    variant="secondary"
                    size="sm"
                    leftIcon={<EyeIcon className="h-4 w-4" />}
                  >
                    View Details
                  </SfLinkButton>
                </div>
              </div>
            </article>
          </RevealItem>
        ))}
      </RevealGroup>

      <p className="mt-8 text-center text-sm text-sf-subtle">
        Looking for something else? <Link to="/products" className="font-medium text-sf-accent hover:underline">Keep shopping</Link>
      </p>
    </div>
  );
};

export default Orders;
