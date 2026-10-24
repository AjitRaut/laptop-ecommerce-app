import React from 'react';
import SEO from '@/components/common/SEO';
// reuse LegalLayout above

const termsSections = [
  {
    title: 'Acceptance of Terms',
    content: `By accessing or using LaptopWorld, you agree to be bound by these Terms of Service. If you do not agree, please do not use our platform.`,
  },
  {
    title: 'Use of the Platform',
    content: `You must be at least 18 years old to make purchases. You agree not to misuse the platform — including scraping data, submitting false orders, or attempting to manipulate prices or reviews.`,
  },
  {
    title: 'Product Listings',
    content: `Products are listed by verified vendors. LaptopWorld acts as a marketplace facilitator. While we vet our vendors, product descriptions are the vendors' responsibility. We encourage you to read specifications carefully before purchasing.`,
  },
  {
    title: 'Pricing & Payments',
    content: `Prices are displayed in Indian Rupees (INR) inclusive of applicable taxes. LaptopWorld reserves the right to correct pricing errors. In such cases, you will be notified and given the option to cancel your order.`,
  },
  {
    title: 'Intellectual Property',
    content: `All content on LaptopWorld — including logos, text, and UI — is the property of LaptopWorld or its licensors. You may not reproduce, distribute, or create derivative works without written permission.`,
  },
  {
    title: 'Limitation of Liability',
    content: `LaptopWorld is not liable for indirect, incidental, or consequential damages arising from the use of our platform. Our total liability is limited to the amount paid for the transaction in question.`,
  },
  {
    title: 'Governing Law',
    content: `These terms are governed by the laws of Maharashtra, India. Any disputes shall be subject to the exclusive jurisdiction of courts in Satara, Maharashtra.`,
  },
];

const LegalLayout: React.FC<{ title: string; subtitle: string; updated: string; children: React.ReactNode }> = ({
  title, subtitle, updated, children,
}) => (
  <>
    <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 text-white">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 text-center">
        <h1 className="text-4xl font-bold sm:text-5xl mb-4">{title}</h1>
        <p className="mt-4 text-lg text-blue-100 max-w-2xl mx-auto">{subtitle}</p>
        <p className="mt-3 text-sm text-blue-200">Last updated: {updated}</p>
      </div>
    </section>
    <section className="bg-gray-50 py-16">
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        <div className="card p-8 space-y-8">{children}</div>
      </div>
    </section>
  </>
);

export const Terms: React.FC = () => (
  <>
    <SEO title="Terms of Service" description="LaptopWorld's terms of service — your rights and responsibilities as a user." keywords="LaptopWorld terms of service" />
    <LegalLayout
      title="Terms of Service"
      subtitle="Please read these terms carefully before using LaptopWorld."
      updated="January 1, 2025"
    >
      {termsSections.map((s) => (
        <div key={s.title}>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">{s.title}</h2>
          <p className="text-sm text-gray-600 leading-relaxed">{s.content}</p>
        </div>
      ))}
    </LegalLayout>
  </>
);

export default Terms;