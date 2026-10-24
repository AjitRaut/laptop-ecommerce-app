import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '@/components/common/SEO';

const eligibility = [
  { ok: true,  text: 'Unused, in original condition' },
  { ok: true,  text: 'All accessories & packaging intact' },
  { ok: true,  text: 'Requested within 7 days of delivery' },
  { ok: false, text: 'Used, damaged, or altered products' },
  { ok: false, text: 'Software unlocked or activated items' },
  { ok: false, text: 'Items without original box or accessories' },
];

const returnSteps = [
  { step: '01', title: 'Raise a Request', desc: 'Go to My Orders → select the item → click "Request Return".' },
  { step: '02', title: 'Schedule Pickup', desc: 'Our logistics partner will contact you within 48 hours to arrange a free pickup.' },
  { step: '03', title: 'Inspection', desc: 'Once received, we inspect the item within 2 business days.' },
  { step: '04', title: 'Refund Processed', desc: 'Approved refunds are credited to your original payment method within 5–7 business days.' },
];

const Returns: React.FC = () => (
  <>
    <SEO
      title="Returns & Refunds"
      description="LaptopWorld's hassle-free 7-day return policy. Learn how to initiate a return and get your refund."
      keywords="LaptopWorld returns, laptop refund India, return policy"
    />

    <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 text-white">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 text-center">
        <h1 className="text-4xl font-bold sm:text-5xl mb-4">
          Returns &{' '}
          <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
            Refunds
          </span>
        </h1>
        <p className="mt-4 text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
          Not satisfied? We offer a hassle-free 7-day return policy on most products.
        </p>
      </div>
    </section>

    <section className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">How Returns Work</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {returnSteps.map((s) => (
            <div key={s.step} className="card p-6">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-blue-600 font-bold text-sm">{s.step}</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{s.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    <section className="bg-gray-50 py-16">
      <div className="mx-auto max-w-2xl px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Return Eligibility</h2>
        <div className="card p-6 space-y-3">
          {eligibility.map((e) => (
            <div key={e.text} className="flex items-center gap-3">
              <span className={`text-lg ${e.ok ? 'text-green-500' : 'text-red-400'}`}>
                {e.ok ? '✓' : '✕'}
              </span>
              <span className={`text-sm ${e.ok ? 'text-gray-700' : 'text-gray-400'}`}>{e.text}</span>
            </div>
          ))}
        </div>
        <div className="mt-6 bg-yellow-50 border border-yellow-100 rounded-xl p-5 text-sm text-yellow-800">
          <strong>Refund Timeline:</strong> Once your return is approved, refunds take 5–7 business days to reflect in your account depending on your bank.
        </div>
      </div>
    </section>

    <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-14">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
        <h2 className="text-2xl font-bold text-white mb-3">Need Help With a Return?</h2>
        <p className="text-blue-100 mb-6">Our support team will guide you through the entire process.</p>
        <Link
          to="/contact"
          className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors shadow-lg inline-block"
        >
          Contact Support
        </Link>
      </div>
    </section>
  </>
);

export default Returns;