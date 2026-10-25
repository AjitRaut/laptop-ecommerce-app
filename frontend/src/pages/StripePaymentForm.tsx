import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { ArrowLeftIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { useConfirmPaymentMutation } from '@/store/api/paymentsApi';
import AnimatedPrice from '@/components/storefront/AnimatedPrice';
import GlassPanel from '@/components/storefront/GlassPanel';
import { SfButton } from '@/components/storefront/SfButton';
import { apiErrorMessage } from '@/components/storefront/utils';

interface StripePaymentFormProps {
  clientSecret: string;
  orderId: string;
  amount: number;
  onCancel: () => void;
}

const StripePaymentForm: React.FC<StripePaymentFormProps> = ({ orderId, amount, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmPayment] = useConfirmPaymentMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment/success`,
        },
        redirect: 'if_required',
      });

      if (error) {
        toast.error(error.message || 'Payment failed');
        setIsProcessing(false);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Confirm payment on backend
        await confirmPayment({
          payment_intent_id: paymentIntent.id,
          order_id: orderId,
        }).unwrap();

        toast.success('Payment successful!');
        navigate('/payment/success', { state: { orderId } });
      }
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Payment verification failed'));
      setIsProcessing(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <GlassPanel glow className="shadow-sf-float sm:p-8">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-2 text-sm font-medium text-sf-muted transition-colors hover:text-sf-ink"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to checkout
        </button>

        <h1 className="mt-5 font-display text-3xl font-semibold tracking-tight text-sf-ink">Complete Payment</h1>
        <p className="mt-2 text-sm text-sf-muted">
          Order ID: <span className="font-mono font-medium text-sf-ink">{orderId}</span>
        </p>

        <div className="mt-6 flex items-center justify-between rounded-sf-lg bg-sf-accent/10 p-4 ring-1 ring-inset ring-sf-accent/25">
          <span className="text-sm font-medium text-sf-muted">Amount to pay</span>
          <AnimatedPrice value={amount} countUpOnMount className="font-display text-2xl font-semibold text-sf-ink" />
        </div>

        <form onSubmit={handleSubmit} className="mt-6">
          <PaymentElement
            options={{
              layout: 'tabs',
            }}
          />

          <div className="mt-8 space-y-3">
            <SfButton
              type="submit"
              loading={isProcessing}
              disabled={!stripe || isProcessing}
              size="lg"
              fullWidth
              leftIcon={<LockClosedIcon className="h-5 w-5" />}
            >
              {isProcessing ? 'Processing...' : 'Pay Now'}
            </SfButton>

            <SfButton type="button" variant="outline" onClick={onCancel} disabled={isProcessing} fullWidth>
              Cancel
            </SfButton>
          </div>

          <p className="mt-6 flex items-center justify-center gap-1.5 text-xs text-sf-subtle">
            <LockClosedIcon className="h-4 w-4" />
            Payments are secure and encrypted
          </p>
        </form>
      </GlassPanel>
    </motion.div>
  );
};

export default StripePaymentForm;
