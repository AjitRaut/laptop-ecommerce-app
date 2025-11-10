import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { ArrowLeftIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import Button from '@/components/common/Button';
import { formatPrice } from '@/utils/formatters';
import { useConfirmPaymentMutation } from '@/store/api/paymentsApi';

interface StripePaymentFormProps {
  clientSecret: string;
  orderId: string;
  amount: number;
  onCancel: () => void;
}

const StripePaymentForm: React.FC<StripePaymentFormProps> = ({
  clientSecret,
  orderId,
  amount,
  onCancel,
}) => {
    console.log("orderId",amount)
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
    } catch (err: any) {
      toast.error(err?.data?.message || 'Payment verification failed');
      setIsProcessing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8"
    >
      <div className="mb-6">
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to checkout
        </button>
        <h2 className="text-2xl font-bold text-gray-900">Complete Payment</h2>
        <p className="mt-2 text-sm text-gray-600">
          Order ID: <span className="font-medium">{orderId}</span>
        </p>
      </div>

      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">Amount to pay:</span>
          <span className="text-2xl font-bold text-blue-600">
            {formatPrice(amount.toString())}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <PaymentElement
            options={{
              layout: 'tabs',
            }}
          />
        </div>

        <div className="space-y-3">
          <Button
            type="submit"
            loading={isProcessing}
            disabled={!stripe || isProcessing}
            size="lg"
            fullWidth
            leftIcon={<LockClosedIcon className="h-5 w-5" />}
          >
            {isProcessing ? 'Processing...' : 'Pay Now'}
          </Button>

          <button
            type="button"
            onClick={onCancel}
            disabled={isProcessing}
            className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>

        <div className="mt-6 flex items-center justify-center text-xs text-gray-500">
          <LockClosedIcon className="h-4 w-4 mr-1" />
          <span>Payments are secure and encrypted</span>
        </div>
      </form>
    </motion.div>
  );
};

export default StripePaymentForm;