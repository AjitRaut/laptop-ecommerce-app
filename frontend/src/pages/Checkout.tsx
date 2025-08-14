import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { LockClosedIcon, CreditCardIcon } from '@heroicons/react/24/outline';
import { useGetCartQuery, useCreateOrderMutation } from '@/store/api/ordersApi';
import { useCreateRazorpayOrderMutation, useVerifyRazorpayPaymentMutation } from '@/store/api/paymentsApi';
import { formatPrice } from '@/utils/formatters';
import { INDIAN_STATES } from '@/utils/constants';
import type { CheckoutFormData } from '@/types';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Input from '@/components/common/input';
import Button from '@/components/common/Button';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod'>('razorpay');
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: cart, isLoading: cartLoading } = useGetCartQuery();
  const [createOrder] = useCreateOrderMutation();
  const [createRazorpayOrder] = useCreateRazorpayOrderMutation();
  const [verifyRazorpayPayment] = useVerifyRazorpayPaymentMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormData>();

  const calculateTotals = () => {
    if (!cart?.items) return { subtotal: 0, tax: 0, shipping: 0, total: 0 };
    
    const subtotal = cart.items.reduce((total, item) => total + parseFloat(item.total_price), 0);
    const tax = subtotal * 0.18;
    const shipping = subtotal > 10000 ? 0 : 100;
    const total = subtotal + tax + shipping;

    return { subtotal, tax, shipping, total };
  };

  const { subtotal, tax, shipping, total } = calculateTotals();

  const handleRazorpayPayment = async (orderData: CheckoutFormData, orderId: string) => {
    try {
      setIsProcessing(true);
      
      // Create Razorpay order
      const razorpayOrder = await createRazorpayOrder(orderId).unwrap();

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount,
        currency: 'INR',
        name: 'LaptopShop',
        description: `Order #${orderId}`,
        order_id: razorpayOrder.id,
        handler: async (response: any) => {
          try {
            await verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              order_id: orderId,
            }).unwrap();

            toast.success('Payment successful!');
            navigate('/payment/success', { state: { orderId } });
          } catch (error) {
            toast.error('Payment verification failed');
            navigate('/payment/failure');
          }
        },
        prefill: {
          name: orderData.shipping_name,
          contact: orderData.shipping_phone,
        },
        theme: {
          color: '#2563eb',
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      setIsProcessing(false);
      toast.error('Failed to initiate payment');
    }
  };

  const onSubmit = async (data: CheckoutFormData) => {
    try {
      setIsProcessing(true);

      // Create the order
      const result = await createOrder(data).unwrap();
      const orderId = result.order_id;

      if (paymentMethod === 'razorpay') {
        await handleRazorpayPayment(data, orderId);
      } else {
        // Cash on delivery
        toast.success('Order placed successfully!');
        navigate('/payment/success', { state: { orderId } });
      }
    } catch (error: any) {
      setIsProcessing(false);
      toast.error(error?.data?.message || 'Failed to place order');
    }
  };

  if (cartLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!cart?.items || cart.items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="lg:grid lg:grid-cols-12 lg:gap-x-8">
              {/* Checkout Form */}
              <div className="lg:col-span-7">
                <div className="space-y-8">
                  {/* Shipping Information */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
                  >
                    <h2 className="text-lg font-medium text-gray-900 mb-6">Shipping Information</h2>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <Input
                          label="Full Name"
                          type="text"
                          autoComplete="name"
                          error={errors.shipping_name?.message}
                          {...register('shipping_name', {
                            required: 'Full name is required',
                          })}
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <Input
                          label="Phone Number"
                          type="tel"
                          autoComplete="tel"
                          error={errors.shipping_phone?.message}
                          {...register('shipping_phone', {
                            required: 'Phone number is required',
                            pattern: {
                              value: /^[6-9]\d{9}$/,
                              message: 'Invalid phone number',
                            },
                          })}
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label htmlFor="shipping_address" className="block text-sm font-medium text-gray-700 mb-1">
                          Address
                        </label>
                        <textarea
                          id="shipping_address"
                          rows={3}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          {...register('shipping_address', {
                            required: 'Address is required',
                          })}
                        />
                        {errors.shipping_address && (
                          <p className="mt-1 text-sm text-red-600">{errors.shipping_address.message}</p>
                        )}
                      </div>

                      <Input
                        label="City"
                        type="text"
                        autoComplete="address-level2"
                        error={errors.shipping_city?.message}
                        {...register('shipping_city', {
                          required: 'City is required',
                        })}
                      />

                      <div>
                        <label htmlFor="shipping_state" className="block text-sm font-medium text-gray-700 mb-1">
                          State
                        </label>
                        <select
                          id="shipping_state"
                          className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          {...register('shipping_state', {
                            required: 'State is required',
                          })}
                        >
                          <option value="">Select a state</option>
                          {INDIAN_STATES.map((state) => (
                            <option key={state} value={state}>
                              {state}
                            </option>
                          ))}
                        </select>
                        {errors.shipping_state && (
                          <p className="mt-1 text-sm text-red-600">{errors.shipping_state.message}</p>
                        )}
                      </div>

                      <Input
                        label="PIN Code"
                        type="text"
                        autoComplete="postal-code"
                        error={errors.shipping_pincode?.message}
                        {...register('shipping_pincode', {
                          required: 'PIN code is required',
                          pattern: {
                            value: /^[1-9][0-9]{5}$/,
                            message: 'Invalid PIN code',
                          },
                        })}
                      />

                      <div className="sm:col-span-2">
                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                          Order Notes (Optional)
                        </label>
                        <textarea
                          id="notes"
                          rows={2}
                          placeholder="Any special instructions for delivery"
                          className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          {...register('notes')}
                        />
                      </div>
                    </div>
                  </motion.div>

                  {/* Payment Method */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
                  >
                    <h2 className="text-lg font-medium text-gray-900 mb-6">Payment Method</h2>

                    <div className="space-y-4">
                      <div className="flex items-center">
                        <input
                          id="razorpay"
                          name="payment-method"
                          type="radio"
                          checked={paymentMethod === 'razorpay'}
                          onChange={() => setPaymentMethod('razorpay')}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <label htmlFor="razorpay" className="ml-3 flex items-center">
                          <CreditCardIcon className="h-5 w-5 text-gray-400 mr-2" />
                          <span className="text-sm font-medium text-gray-900">
                            Credit/Debit Card, UPI, Net Banking
                          </span>
                        </label>
                      </div>

                      <div className="flex items-center">
                        <input
                          id="cod"
                          name="payment-method"
                          type="radio"
                          checked={paymentMethod === 'cod'}
                          onChange={() => setPaymentMethod('cod')}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <label htmlFor="cod" className="ml-3 flex items-center">
                          <span className="text-sm font-medium text-gray-900">
                            Cash on Delivery
                          </span>
                          <span className="ml-2 text-xs text-gray-500">
                            (₹50 handling charges apply)
                          </span>
                        </label>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-5 mt-8 lg:mt-0">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-8"
                >
                  <h2 className="text-lg font-medium text-gray-900 mb-6">Order Summary</h2>

                  {/* Items */}
                  <div className="space-y-4 mb-6">
                    {cart.items.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4">
                        <img
                          src={item.product.primary_image || '/api/placeholder/60/60'}
                          alt={item.product.name}
                          className="h-12 w-12 rounded-lg object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {item.product.name}
                          </p>
                          <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-sm font-medium text-gray-900">
                          {formatPrice(item.total_price)}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Totals */}
                  <div className="space-y-3 border-t border-gray-200 pt-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">{formatPrice(subtotal.toString())}</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tax (18%)</span>
                      <span className="font-medium">{formatPrice(tax.toString())}</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Shipping</span>
                      {shipping === 0 ? (
                        <span className="font-medium text-green-600">Free</span>
                      ) : (
                        <span className="font-medium">{formatPrice(shipping.toString())}</span>
                      )}
                    </div>

                    {paymentMethod === 'cod' && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">COD Charges</span>
                        <span className="font-medium">{formatPrice('50')}</span>
                      </div>
                    )}

                    <div className="border-t border-gray-200 pt-3">
                      <div className="flex justify-between text-lg font-semibold">
                        <span>Total</span>
                        <span>
                          {formatPrice((total + (paymentMethod === 'cod' ? 50 : 0)).toString())}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Place Order Button */}
                  <div className="mt-8">
                    <Button
                      type="submit"
                      loading={isProcessing}
                      size="lg"
                      fullWidth
                      leftIcon={<LockClosedIcon className="h-5 w-5" />}
                    >
                      {paymentMethod === 'razorpay' ? 'Pay Now' : 'Place Order'}
                    </Button>

                    <p className="mt-4 text-xs text-gray-500 text-center">
                      By placing your order, you agree to our Terms of Service and Privacy Policy.
                      Your payment information is secure and encrypted.
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Checkout;