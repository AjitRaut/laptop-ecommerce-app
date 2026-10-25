import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ShoppingBagIcon,
  CreditCardIcon,
  TruckIcon,
  ArrowPathIcon,
  ChevronDownIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import SEO from '@/components/common/SEO';
import GlassPanel from '@/components/storefront/GlassPanel';
import { RevealGroup, RevealItem } from '@/components/storefront/Reveal';
import { SfLinkButton, sfButtonClasses } from '@/components/storefront/SfButton';
import { Accent, InfoCta, InfoHero, InfoSection, slugify } from '@/components/storefront/InfoPage';

const faqs = [
  {
    category: 'Orders',
    items: [
      {
        q: 'How do I place an order?',
        a: 'Browse products, add to cart, and proceed to checkout. You can pay via UPI, credit/debit card, or net banking.',
      },
      {
        q: 'Can I modify or cancel my order?',
        a: 'Orders can be cancelled within 2 hours of placement. After that, please contact our support team and we will do our best to help.',
      },
      {
        q: 'How do I track my order?',
        a: 'Go to My Orders in your profile. Each order shows real-time status and a tracking link once shipped.',
      },
    ],
  },
  {
    category: 'Payments',
    items: [
      {
        q: 'What payment methods are accepted?',
        a: 'We accept UPI, Visa, Mastercard, net banking, and select EMI options. All transactions are secured with SSL encryption.',
      },
      {
        q: 'Is my payment information safe?',
        a: 'Yes. We do not store card details. All payments are processed through PCI-DSS compliant payment gateways.',
      },
    ],
  },
  {
    category: 'Shipping',
    items: [
      {
        q: 'How long does delivery take?',
        a: 'Standard delivery takes 3–7 business days. Express options are available at checkout for select pin codes.',
      },
      {
        q: 'Do you deliver across India?',
        a: 'Yes, we deliver to 100+ cities across India. Enter your pin code on the product page to check availability.',
      },
    ],
  },
  {
    category: 'Returns',
    items: [
      {
        q: 'What is the return policy?',
        a: 'We offer a 7-day return window for most products. Items must be unused, in original packaging with all accessories.',
      },
      {
        q: 'How do I initiate a return?',
        a: 'Go to My Orders, select the order, and click "Request Return". Our team will arrange a pickup within 48 hours.',
      },
    ],
  },
];

const groupIcons: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  Orders: ShoppingBagIcon,
  Payments: CreditCardIcon,
  Shipping: TruckIcon,
  Returns: ArrowPathIcon,
};

const Help: React.FC = () => {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <>
      <SEO
        title="Help Center"
        description="Find answers to common questions about orders, payments, shipping, and returns at LaptopWorld."
        keywords="LaptopWorld help, FAQ, laptop order support, returns India"
      />

      <InfoHero
        eyebrow="Support"
        title={
          <>
            Help <Accent>Center</Accent>
          </>
        }
        subtitle={
          <>
            Find quick answers to common questions. Can't find what you need?{' '}
            <Link to="/contact" className="font-medium text-sf-accent underline-offset-4 hover:underline">
              Contact us
            </Link>
            .
          </>
        }
      />

      {/* Topic shortcuts */}
      <nav aria-label="FAQ topics" className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <RevealGroup as="ul" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {faqs.map((group) => {
            const Icon = groupIcons[group.category] ?? ShoppingBagIcon;
            return (
              <RevealItem as="li" key={group.category}>
                <a
                  href={`#faq-${slugify(group.category)}`}
                  className="sf-glass group flex items-center gap-3 rounded-sf-lg p-4 transition-colors hover:border-sf-accent/40"
                >
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-sf bg-sf-gradient text-sf-on-accent shadow-sf-glow transition-transform duration-300 group-hover:-translate-y-0.5">
                    <Icon aria-hidden="true" className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-sf-ink">{group.category}</span>
                    <span className="block text-xs text-sf-subtle">{group.items.length} questions</span>
                  </span>
                </a>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </nav>

      {/* FAQ */}
      <InfoSection narrow>
        <div className="space-y-12">
          {faqs.map((group) => {
            const Icon = groupIcons[group.category] ?? ShoppingBagIcon;
            const groupId = `faq-${slugify(group.category)}`;
            return (
              <section key={group.category} id={groupId} aria-labelledby={`${groupId}-heading`} className="scroll-mt-28">
                <h2 id={`${groupId}-heading`} className="mb-4 flex items-center gap-3 font-display text-xl font-semibold text-sf-ink">
                  <Icon aria-hidden="true" className="h-6 w-6 text-sf-accent" />
                  {group.category}
                </h2>
                <RevealGroup as="ul" className="space-y-3">
                  {group.items.map((item) => {
                    const key = `${group.category}-${item.q}`;
                    const isOpen = open === key;
                    const panelId = `${groupId}-${slugify(item.q)}`;
                    return (
                      <RevealItem as="li" key={key}>
                        <GlassPanel padded={false} className={clsx('overflow-hidden transition-colors', isOpen && 'border-sf-accent/40')}>
                          <h3>
                            <button
                              type="button"
                              id={`${panelId}-button`}
                              aria-expanded={isOpen}
                              aria-controls={panelId}
                              onClick={() => setOpen(isOpen ? null : key)}
                              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left sm:px-6"
                            >
                              <span className="text-sm font-medium text-sf-ink sm:text-base">{item.q}</span>
                              <ChevronDownIcon
                                aria-hidden="true"
                                className={clsx(
                                  'h-5 w-5 flex-shrink-0 text-sf-subtle transition-transform duration-300',
                                  isOpen && 'rotate-180 text-sf-accent'
                                )}
                              />
                            </button>
                          </h3>
                          <AnimatePresence initial={false}>
                            {isOpen && (
                              <motion.div
                                id={panelId}
                                role="region"
                                aria-labelledby={`${panelId}-button`}
                                initial={{ opacity: 0, y: -6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.25 }}
                                className="border-t border-sf-line px-5 pb-5 sm:px-6"
                              >
                                <p className="mt-3 text-sm leading-relaxed text-sf-muted">{item.a}</p>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </GlassPanel>
                      </RevealItem>
                    );
                  })}
                </RevealGroup>
              </section>
            );
          })}
        </div>
      </InfoSection>

      <InfoCta
        title="Still Need Help?"
        actions={
          <>
            <SfLinkButton to="/contact" size="lg">
              Contact Support
            </SfLinkButton>
            <a href="mailto:sagarcomputersatara@gmail.com" className={sfButtonClasses({ variant: 'secondary', size: 'lg' })}>
              <EnvelopeIcon aria-hidden="true" className="h-5 w-5" />
              Email Us
            </a>
          </>
        }
      >
        Our support team is available Mon–Sat, 9 AM – 7 PM IST.
      </InfoCta>
    </>
  );
};

export default Help;
