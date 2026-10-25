import React from 'react';
import { motion } from 'framer-motion';
import { ArrowPathIcon, CreditCardIcon, BanknotesIcon, EnvelopeIcon, PhoneIcon } from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import SEO from '@/components/common/SEO';
import EmptyIllustration from '@/components/storefront/EmptyIllustration';
import GlassPanel from '@/components/storefront/GlassPanel';
import { SfLinkButton } from '@/components/storefront/SfButton';
import { container } from '@/components/storefront/utils';

const suggestions = [
  { icon: ArrowPathIcon, text: 'Try the payment again. Temporary bank or network issues often clear up.' },
  { icon: CreditCardIcon, text: 'Use a different card, or check the card details and limits.' },
  { icon: BanknotesIcon, text: 'Choose Cash on Delivery at checkout instead.' },
];

const PaymentFailure: React.FC = () => {
  return (
    <div className={clsx(container, 'flex min-h-[70vh] items-center justify-center py-12')}>
      <SEO title="Payment Failed" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        <GlassPanel className="text-center shadow-sf-float sm:p-10">
          <EmptyIllustration kind="error" className="-mt-2" />
          <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-sf-ink">Payment Failed</h1>
          <p className="mx-auto mt-3 max-w-sm text-sf-muted">
            We couldn't process your payment. Please try again or use a different payment method.
          </p>

          <ul className="mt-8 space-y-3 text-left">
            {suggestions.map((item) => (
              <li key={item.text} className="flex gap-3 rounded-sf bg-sf-surface-2/70 p-3 text-sm text-sf-muted">
                <item.icon className="mt-0.5 h-5 w-5 flex-shrink-0 text-sf-accent" />
                {item.text}
              </li>
            ))}
          </ul>

          <div className="mt-8 space-y-3">
            <SfLinkButton to="/checkout" size="lg" fullWidth>
              Try Again
            </SfLinkButton>
            <SfLinkButton to="/cart" variant="outline" size="lg" fullWidth>
              Back to Cart
            </SfLinkButton>
            <SfLinkButton to="/products" variant="ghost" fullWidth>
              Continue Shopping
            </SfLinkButton>
          </div>

          <div className="mt-8 border-t border-sf-line pt-6 text-sm text-sf-subtle">
            <p>Need help? We&apos;re here.</p>
            <div className="mt-2 flex flex-wrap justify-center gap-x-5 gap-y-2">
              <a href="mailto:sagarcomputersatara@gmail.com" className="inline-flex items-center gap-1.5 text-sf-accent hover:underline">
                <EnvelopeIcon className="h-4 w-4" /> Email us
              </a>
              <a href="tel:+918007486058" className="inline-flex items-center gap-1.5 text-sf-accent hover:underline">
                <PhoneIcon className="h-4 w-4" /> +91 8007486058
              </a>
            </div>
          </div>
        </GlassPanel>
      </motion.div>
    </div>
  );
};

export default PaymentFailure;
