import React from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { CheckIcon } from '@heroicons/react/24/solid';
import { ClipboardDocumentIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import SEO from '@/components/common/SEO';
import CheckoutStepper from '@/components/storefront/CheckoutStepper';
import Confetti from '@/components/storefront/Confetti';
import GlassPanel from '@/components/storefront/GlassPanel';
import { SfLinkButton } from '@/components/storefront/SfButton';
import { container } from '@/components/storefront/utils';

const PaymentSuccess: React.FC = () => {
  const location = useLocation();
  const orderId = (location.state as { orderId?: string } | null)?.orderId;

  const copyOrderId = async () => {
    if (!orderId) return;
    try {
      await navigator.clipboard.writeText(orderId);
      toast.success('Order ID copied');
    } catch {
      toast.error('Could not copy the order ID');
    }
  };

  return (
    <div className={clsx(container, 'pt-8 sm:pt-10')}>
      <SEO title="Order Confirmed" />
      <Confetti />
      <CheckoutStepper current="Done" />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto mt-12 max-w-lg"
      >
        <GlassPanel glow className="relative overflow-hidden text-center shadow-sf-float sm:p-10">
          <div aria-hidden="true" className="absolute inset-x-0 -top-24 mx-auto h-64 w-64 rounded-full bg-sf-gradient opacity-25 blur-3xl" />

          {/* Layered "3D" success badge */}
          <div className="relative mx-auto h-28 w-28 [perspective:600px]">
            <motion.span
              aria-hidden="true"
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: [0.4, 1.25, 1], opacity: [0, 0.6, 0.25] }}
              transition={{ duration: 1.2, delay: 0.1 }}
              className="absolute inset-0 rounded-full bg-sf-success/40"
            />
            <motion.span
              aria-hidden="true"
              initial={{ rotateX: 70, scale: 0.6, opacity: 0 }}
              animate={{ rotateX: 0, scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 180, damping: 14, delay: 0.15 }}
              className="absolute inset-3 flex items-center justify-center rounded-full bg-sf-gradient text-sf-on-accent shadow-sf-glow ring-4 ring-sf-surface"
            >
              <CheckIcon className="h-11 w-11" />
            </motion.span>
          </div>

          <h1 className="relative mt-8 font-display text-3xl font-semibold tracking-tight text-sf-ink sm:text-4xl">
            Payment Successful!
          </h1>
          <p className="relative mx-auto mt-3 max-w-sm text-sf-muted">
            Your order has been placed successfully. You will receive a confirmation email shortly.
          </p>

          {orderId && (
            <div className="relative mt-8 flex items-center justify-between gap-3 rounded-sf-lg bg-sf-surface-2/80 p-4 text-left ring-1 ring-sf-line">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.16em] text-sf-subtle">Order ID</p>
                <p className="mt-1 truncate font-mono text-sm font-medium text-sf-ink">{orderId}</p>
              </div>
              <button
                type="button"
                onClick={copyOrderId}
                aria-label="Copy order ID"
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sf-muted transition-colors hover:bg-sf-surface-3 hover:text-sf-ink"
              >
                <ClipboardDocumentIcon className="h-5 w-5" />
              </button>
            </div>
          )}

          <div className="relative mt-8 space-y-3">
            {orderId && (
              <SfLinkButton to={`/orders/${orderId}`} size="lg" fullWidth rightIcon={<ArrowRightIcon className="h-5 w-5" />}>
                View Order Details
              </SfLinkButton>
            )}
            <SfLinkButton to="/orders" variant={orderId ? 'outline' : 'primary'} size="lg" fullWidth>
              View All Orders
            </SfLinkButton>
            <SfLinkButton to="/products" variant="ghost" fullWidth>
              Continue Shopping
            </SfLinkButton>
          </div>
        </GlassPanel>
      </motion.div>
    </div>
  );
};

export default PaymentSuccess;
