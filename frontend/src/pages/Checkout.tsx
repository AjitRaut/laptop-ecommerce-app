import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { LockClosedIcon, CreditCardIcon, BanknotesIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import { useGetCartQuery, useCreateOrderMutation } from '@/store/api/ordersApi';
import { useCreatePaymentIntentMutation } from '@/store/api/paymentsApi';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe, type Appearance } from '@stripe/stripe-js';
import { formatPrice } from '@/utils/formatters';
import { INDIAN_STATES } from '@/utils/constants';
import type { CheckoutFormData } from '@/types/form';
import SEO from '@/components/common/SEO';
import StripePaymentForm from './StripePaymentForm';
import { TrustBadges } from './Cart';
import AnimatedPrice from '@/components/storefront/AnimatedPrice';
import CheckoutStepper from '@/components/storefront/CheckoutStepper';
import GlassPanel from '@/components/storefront/GlassPanel';
import ProductImage from '@/components/storefront/ProductImage';
import { SfButton } from '@/components/storefront/SfButton';
import { RowSkeleton, Skeleton } from '@/components/storefront/Skeleton';
import { SelectField, TextAreaField, TextField } from '@/components/storefront/Field';
import { FONT_STYLESHEET } from '@/components/storefront/StorefrontShell';
import { useTheme, type Theme } from '@/components/storefront/theme';
import { apiErrorMessage, container, readTokenColor, toNumber } from '@/components/storefront/utils';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

/** Stripe Elements renders in an iframe, so pass it concrete colours resolved from our tokens. */
const stripeAppearance = (theme: Theme): Appearance => ({
  theme: theme === 'dark' ? 'night' : 'stripe',
  variables: {
    colorPrimary: readTokenColor('accent-strong'),
    colorBackground: readTokenColor('surface'),
    colorText: readTokenColor('ink'),
    colorTextSecondary: readTokenColor('muted'),
    colorDanger: readTokenColor('danger'),
    fontFamily: 'Inter, system-ui, sans-serif',
    borderRadius: '14px',
    spacingUnit: '4px',
  },
  rules: {
    '.Input': { border: `1px solid ${readTokenColor('subtle', 0.35)}`, boxShadow: 'none' },
    '.Input:focus': {
      border: `1px solid ${readTokenColor('accent-strong')}`,
      boxShadow: `0 0 0 4px ${readTokenColor('accent-strong', 0.2)}`,
    },
    '.Tab, .Block': { border: `1px solid ${readTokenColor('subtle', 0.35)}`, boxShadow: 'none' },
    '.Tab--selected': { borderColor: readTokenColor('accent-strong') },
  },
});

const paymentOptions = [
  {
    id: 'stripe' as const,
    title: 'Credit/Debit Card (Stripe)',
    description: 'Pay securely with your card.',
    icon: CreditCardIcon,
  },
  {
    id: 'cod' as const,
    title: 'Cash on Delivery',
    description: '(₹50 handling charges apply)',
    icon: BanknotesIcon,
  },
];

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'cod'>('stripe');
  const [isProcessing, setIsProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState<string>('');
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [orderId, setOrderId] = useState<string>('');
  const [showStripeForm, setShowStripeForm] = useState(false);

  const { data: cart, isLoading: cartLoading } = useGetCartQuery();
  const [createOrder] = useCreateOrderMutation();
  const [createPaymentIntent] = useCreatePaymentIntentMutation();

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
  const codCharge = paymentMethod === 'cod' ? 50 : 0;

  // Re-derived when the theme flips; react-stripe-js forwards appearance updates to Elements.
  const elementsOptions = useMemo(
    () => ({ clientSecret, appearance: stripeAppearance(theme), fonts: [{ cssSrc: FONT_STYLESHEET }] }),
    [clientSecret, theme]
  );

  const onSubmit = async (data: CheckoutFormData) => {
    try {
      setIsProcessing(true);

      const result = await createOrder(data).unwrap();
      const newOrderId = result.order_id;
      setOrderId(newOrderId);

      if (paymentMethod === 'stripe') {
        const paymentIntent = await createPaymentIntent(newOrderId).unwrap();
        setClientSecret(paymentIntent.client_secret);
        setTotalAmount(paymentIntent.amount);
        setShowStripeForm(true);

        setIsProcessing(false);
        toast.success('Order created! Complete your payment below.');
      } else {
        // Cash on delivery
        toast.success('Order placed successfully!');
        navigate('/payment/success', { state: { orderId: newOrderId } });
      }
    } catch (error) {
      setIsProcessing(false);
      toast.error(apiErrorMessage(error, 'Failed to place order'));
    }
  };

  if (cartLoading) {
    return (
      <div className={clsx(container, 'pt-10')}>
        <Skeleton className="mx-auto h-10 w-full max-w-xl rounded-full" />
        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-12">
          <Skeleton className="h-[32rem] rounded-sf-lg lg:col-span-7" />
          <div className="lg:col-span-5">
            <RowSkeleton rows={2} />
          </div>
        </div>
      </div>
    );
  }

  // Show Stripe payment form once the order + payment intent exist
  if (showStripeForm && clientSecret) {
    return (
      <div className={clsx(container, 'pt-8 sm:pt-10')}>
        <SEO title="Payment" />
        <CheckoutStepper current="Payment" />
        <div className="mx-auto mt-12 max-w-2xl">
          <Elements stripe={stripePromise} options={elementsOptions}>
            <StripePaymentForm
              clientSecret={clientSecret}
              orderId={orderId}
              amount={totalAmount}
              onCancel={() => {
                setShowStripeForm(false);
                setClientSecret('');
              }}
            />
          </Elements>
        </div>
      </div>
    );
  }

  return (
    <div className={clsx(container, 'pt-8 sm:pt-10')}>
      <SEO title="Checkout" />
      <CheckoutStepper current="Address" />

      <h1 className="mt-12 font-display text-4xl font-semibold tracking-tight text-sf-ink sm:text-5xl">Checkout</h1>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Shipping + payment */}
          <div className="space-y-6 lg:col-span-7">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <GlassPanel as="section" aria-labelledby="checkout-shipping">
                <h2 id="checkout-shipping" className="font-display text-xl font-semibold text-sf-ink">
                  Shipping Information
                </h2>
                <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <TextField
                    wrapperClassName="sm:col-span-2"
                    label="Full Name"
                    type="text"
                    autoComplete="name"
                    error={errors.shipping_name?.message}
                    {...register('shipping_name', {
                      required: 'Full name is required',
                    })}
                  />

                  <TextField
                    wrapperClassName="sm:col-span-2"
                    label="Phone Number"
                    type="tel"
                    autoComplete="tel"
                    inputMode="numeric"
                    error={errors.shipping_phone?.message}
                    {...register('shipping_phone', {
                      required: 'Phone number is required',
                      pattern: {
                        value: /^[6-9]\d{9}$/,
                        message: 'Invalid phone number',
                      },
                    })}
                  />

                  <TextAreaField
                    wrapperClassName="sm:col-span-2"
                    label="Address"
                    rows={3}
                    autoComplete="street-address"
                    error={errors.shipping_address?.message}
                    {...register('shipping_address', {
                      required: 'Address is required',
                    })}
                  />

                  <TextField
                    label="City"
                    type="text"
                    autoComplete="address-level2"
                    error={errors.shipping_city?.message}
                    {...register('shipping_city', {
                      required: 'City is required',
                    })}
                  />

                  <SelectField
                    label="State"
                    autoComplete="address-level1"
                    error={errors.shipping_state?.message}
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
                  </SelectField>

                  <TextField
                    label="PIN Code"
                    type="text"
                    inputMode="numeric"
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

                  <TextAreaField
                    wrapperClassName="sm:col-span-2"
                    label="Order Notes (Optional)"
                    rows={2}
                    placeholder="Any special instructions for delivery"
                    {...register('notes')}
                  />
                </div>
              </GlassPanel>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <GlassPanel as="section" aria-labelledby="checkout-payment">
                <h2 id="checkout-payment" className="font-display text-xl font-semibold text-sf-ink">
                  Payment Method
                </h2>
                <fieldset className="mt-6">
                  <legend className="sr-only">Choose a payment method</legend>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {paymentOptions.map((option) => {
                      const selected = paymentMethod === option.id;
                      return (
                        <label
                          key={option.id}
                          htmlFor={`payment-${option.id}`}
                          className={clsx(
                            'relative flex cursor-pointer gap-3 rounded-sf-lg border p-4 transition-[border-color,box-shadow] has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-sf-accent-strong',
                            selected
                              ? 'border-sf-accent-strong bg-sf-accent/5 shadow-sf-glow'
                              : 'border-sf-line-strong hover:border-sf-accent/50'
                          )}
                        >
                          <input
                            id={`payment-${option.id}`}
                            name="payment-method"
                            type="radio"
                            checked={selected}
                            onChange={() => setPaymentMethod(option.id)}
                            className="sr-only"
                          />
                          <span
                            className={clsx(
                              'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-sf-sm',
                              selected ? 'bg-sf-gradient text-sf-on-accent' : 'bg-sf-surface-2 text-sf-muted'
                            )}
                          >
                            <option.icon className="h-5 w-5" />
                          </span>
                          <span>
                            <span className="block text-sm font-semibold text-sf-ink">{option.title}</span>
                            <span className="mt-0.5 block text-xs text-sf-subtle">{option.description}</span>
                          </span>
                          {selected && <CheckCircleIcon aria-hidden="true" className="absolute right-3 top-3 h-5 w-5 text-sf-accent" />}
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
              </GlassPanel>
            </motion.div>
          </div>

          {/* Floating order summary */}
          <aside aria-labelledby="checkout-summary" className="lg:col-span-5">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:sticky lg:top-24"
            >
              <GlassPanel glow className="shadow-sf-float">
                <h2 id="checkout-summary" className="font-display text-xl font-semibold text-sf-ink">
                  Order Summary
                </h2>

                <ul className="mt-6 max-h-72 space-y-4 overflow-y-auto pr-1">
                  {cart?.items.map((item) => (
                    <li key={item.id} className="flex items-center gap-4">
                      <div className="relative flex-shrink-0">
                        <ProductImage
                          src={item.product.primary_image}
                          alt=""
                          label={item.product.brand_name}
                          className="h-14 w-14 rounded-sf"
                          imgClassName="p-1.5"
                        />
                        <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-sf-gradient px-1 text-[11px] font-semibold text-sf-on-accent">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-sf-ink">{item.product.name}</p>
                        <p className="text-xs text-sf-subtle">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-medium tabular-nums text-sf-ink">{formatPrice(item.total_price)}</p>
                    </li>
                  ))}
                </ul>

                <dl className="mt-6 space-y-3 border-t border-sf-line pt-5 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-sf-muted">Subtotal</dt>
                    <dd className="font-medium tabular-nums text-sf-ink">{formatPrice(subtotal.toString())}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sf-muted">Tax (18%)</dt>
                    <dd className="font-medium tabular-nums text-sf-ink">{formatPrice(tax.toString())}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sf-muted">Shipping</dt>
                    <dd className={clsx('font-medium', shipping === 0 ? 'text-sf-success' : 'tabular-nums text-sf-ink')}>
                      {shipping === 0 ? 'Free' : formatPrice(shipping.toString())}
                    </dd>
                  </div>
                  {paymentMethod === 'cod' && (
                    <div className="flex justify-between">
                      <dt className="text-sf-muted">COD Charges</dt>
                      <dd className="font-medium tabular-nums text-sf-ink">{formatPrice('50')}</dd>
                    </div>
                  )}
                </dl>

                <div className="mt-5 flex items-baseline justify-between border-t border-sf-line pt-5">
                  <span className="font-display text-base font-semibold text-sf-ink">Total</span>
                  <AnimatedPrice
                    value={toNumber(total + codCharge)}
                    className="font-display text-3xl font-semibold tracking-tight text-sf-ink"
                  />
                </div>

                <SfButton
                  type="submit"
                  loading={isProcessing}
                  size="lg"
                  fullWidth
                  className="mt-6"
                  leftIcon={<LockClosedIcon className="h-5 w-5" />}
                >
                  {paymentMethod === 'stripe' ? 'Continue to Payment' : 'Place Order'}
                </SfButton>

                <p className="mt-4 text-center text-xs leading-relaxed text-sf-subtle">
                  By placing your order, you agree to our Terms of Service and Privacy Policy. Your payment information
                  is secure and encrypted.
                </p>
                <TrustBadges className="mt-4" />
              </GlassPanel>
            </motion.div>
          </aside>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
