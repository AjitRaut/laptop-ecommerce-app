import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '@/components/common/SEO';

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

const Help: React.FC = () => {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <>
      <SEO
        title="Help Center"
        description="Find answers to common questions about orders, payments, shipping, and returns at LaptopWorld."
        keywords="LaptopWorld help, FAQ, laptop order support, returns India"
      />

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 text-white">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 text-center">
          <h1 className="text-4xl font-bold sm:text-5xl mb-4">
            Help{' '}
            <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
              Center
            </span>
          </h1>
          <p className="mt-4 text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
            Find quick answers to common questions. Can't find what you need?{' '}
            <Link to="/contact" className="underline hover:text-white">
              Contact us
            </Link>
            .
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          {faqs.map((group) => (
            <div key={group.category} className="mb-10">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-2 h-6 bg-blue-600 rounded-full inline-block" />
                {group.category}
              </h2>
              <div className="space-y-3">
                {group.items.map((item) => {
                  const key = `${group.category}-${item.q}`;
                  return (
                    <div key={key} className="card overflow-hidden">
                      <button
                        className="w-full text-left px-6 py-4 flex items-center justify-between"
                        onClick={() => setOpen(open === key ? null : key)}
                      >
                        <span className="font-medium text-gray-900 text-sm">{item.q}</span>
                        <svg
                          className={`h-5 w-5 text-gray-400 transition-transform flex-shrink-0 ml-4 ${open === key ? 'rotate-180' : ''}`}
                          fill="none" viewBox="0 0 24 24" stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {open === key && (
                        <div className="px-6 pb-5 border-t border-gray-100">
                          <p className="text-sm text-gray-600 leading-relaxed mt-3">{item.a}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Still need help */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-14">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Still Need Help?</h2>
          <p className="text-blue-100 mb-6">Our support team is available Mon–Sat, 9 AM – 7 PM IST.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/contact"
              className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors shadow-lg"
            >
              Contact Support
            </Link>
            <a
              href="mailto:sagarcomputersatara@gmail.com"
              className="px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition-colors"
            >
              Email Us
            </a>
          </div>
        </div>
      </section>
    </>
  );
};

export default Help;