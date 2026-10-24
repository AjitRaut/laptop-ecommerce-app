// ─── Shipping.tsx ───────────────────────────────────────────────────────────
import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '@/components/common/SEO';

const shippingZones = [
  { zone: 'Metro Cities', cities: 'Mumbai, Delhi, Bangalore, Chennai, Hyderabad, Pune', days: '1–3 business days' },
  { zone: 'Tier 2 Cities', cities: 'Satara, Nasik, Aurangabad, Nagpur, Kolhapur and 80+ more', days: '3–5 business days' },
  { zone: 'Rest of India', cities: 'All other serviceable pin codes', days: '5–7 business days' },
];

const steps = [
  { step: '01', title: 'Order Confirmed', desc: 'You receive a confirmation email with your order ID immediately after payment.' },
  { step: '02', title: 'Packed & Dispatched', desc: 'The vendor packs your item within 24 hours and hands it over to our logistics partner.' },
  { step: '03', title: 'In Transit', desc: 'Track your shipment in real time via the tracking link sent to your email.' },
  { step: '04', title: 'Delivered', desc: 'Your laptop arrives safely at your doorstep. We use tamper-proof packaging for all orders.' },
];

export const Shipping: React.FC = () => (
  <>
    <SEO
      title="Shipping Info"
      description="Learn about LaptopWorld's shipping zones, delivery timelines, and packaging policies."
      keywords="LaptopWorld shipping, laptop delivery India, shipping policy"
    />

    <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 text-white">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 text-center">
        <h1 className="text-4xl font-bold sm:text-5xl mb-4">
          Shipping{' '}
          <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
            Information
          </span>
        </h1>
        <p className="mt-4 text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
          Fast, reliable delivery across 100+ cities in India. Free shipping on all orders above ₹25,000.
        </p>
      </div>
    </section>

    {/* How it works */}
    <section className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">How Your Order Gets to You</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s) => (
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

    {/* Delivery Zones */}
    <section className="bg-gray-50 py-16">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Delivery Timelines by Zone</h2>
        <div className="space-y-4">
          {shippingZones.map((z) => (
            <div key={z.zone} className="card p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="font-semibold text-gray-900">{z.zone}</h3>
                <p className="text-sm text-gray-500 mt-1">{z.cities}</p>
              </div>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700 whitespace-nowrap">
                {z.days}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-5 text-sm text-blue-800">
          <strong>Note:</strong> Delivery timelines are estimates and may vary during public holidays or high-demand periods. Express delivery is available at checkout for select pin codes.
        </div>
      </div>
    </section>

    <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-14">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
        <h2 className="text-2xl font-bold text-white mb-3">Questions About Your Shipment?</h2>
        <p className="text-blue-100 mb-6">Reach out and we'll track it down for you.</p>
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

export default Shipping;