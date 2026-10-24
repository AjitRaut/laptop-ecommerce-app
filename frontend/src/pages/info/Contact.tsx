import React, { useState } from 'react';
import SEO from '@/components/common/SEO';

const contactMethods = [
  {
    icon: '📧',
    label: 'Email Us',
    value: 'sagarcomputersatara@gmail.com',
    href: 'mailto:sagarcomputersatara@gmail.com',
  },
  {
    icon: '📞',
    label: 'Call Us',
    value: '+91 8007486058',
    href: 'tel:+918007486058',
  },
  {
    icon: '📍',
    label: 'Visit Us',
    value: 'Viswa Naka, Satara, Maharashtra 415001',
    href: 'https://maps.google.com/?q=Satara,Maharashtra',
  },
];

const Contact: React.FC = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.MouseEvent) => {
    e.preventDefault();
    const mailto = `mailto:sagarcomputersatara@gmail.com?subject=${encodeURIComponent(form.subject || 'Contact Form')}&body=${encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`)}`;
    window.location.href = mailto;
    setSubmitted(true);
  };

  return (
    <>
      <SEO
        title="Contact Us"
        description="Get in touch with LaptopWorld. We're here to help with product queries, orders, and support."
        keywords="contact LaptopWorld, laptop support India, Satara laptop store contact"
      />

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 text-white">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 text-center">
          <h1 className="text-4xl font-bold sm:text-5xl mb-4">
            Get in{' '}
            <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
              Touch
            </span>
          </h1>
          <p className="mt-4 text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
            Have a question about a product, an order, or anything else? Our team is ready to help.
          </p>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="bg-white py-14 border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {contactMethods.map((m) => (
              <a
                key={m.label}
                href={m.href}
                target="_blank"
                rel="noopener noreferrer"
                className="card p-6 text-center hover:shadow-md transition-shadow group"
              >
                <div className="text-4xl mb-3">{m.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                  {m.label}
                </h3>
                <p className="text-sm text-gray-500">{m.value}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-2xl px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Send Us a Message</h2>
          <p className="text-gray-500 text-center mb-8">
            Fill out the form below and we'll get back to you within 24 hours.
          </p>

          {submitted ? (
            <div className="card p-10 text-center">
              <div className="text-5xl mb-4">✅</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Message Sent!</h3>
              <p className="text-gray-500">
                Your email client should have opened. If not, email us directly at{' '}
                <a href="mailto:sagarcomputersatara@gmail.com" className="text-blue-600 hover:underline">
                  sagarcomputersatara@gmail.com
                </a>
              </p>
            </div>
          ) : (
            <div className="card p-8 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                  <input
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Rahul Sharma"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="rahul@example.com"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <select
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">Select a topic</option>
                  <option>Product Inquiry</option>
                  <option>Order Issue</option>
                  <option>Return / Refund</option>
                  <option>Vendor Partnership</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  name="message"
                  rows={5}
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Tell us how we can help..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
              <button
                onClick={handleSubmit}
                className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-md"
              >
                Send Message
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Business Hours */}
      <section className="bg-white py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Business Hours</h2>
          <div className="inline-grid grid-cols-2 gap-x-12 gap-y-2 text-sm text-gray-600">
            <span className="text-right font-medium">Monday – Saturday</span>
            <span className="text-left">9:00 AM – 7:00 PM IST</span>
            <span className="text-right font-medium">Sunday</span>
            <span className="text-left">10:00 AM – 4:00 PM IST</span>
          </div>
        </div>
      </section>
    </>
  );
};

export default Contact;