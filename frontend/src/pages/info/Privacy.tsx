import React from 'react';
import SEO from '@/components/common/SEO';

const sections = [
  {
    title: 'Information We Collect',
    content: `We collect information you provide directly — such as your name, email address, phone number, and shipping address when you register or place an order. We also collect usage data (pages visited, device type, IP address) to improve our platform.`,
  },
  {
    title: 'How We Use Your Information',
    content: `Your information is used to process orders, send delivery updates, provide customer support, personalise your shopping experience, and send you relevant offers (only if you opt in). We do not sell your personal data to third parties.`,
  },
  {
    title: 'Data Sharing',
    content: `We share your data only with vendors fulfilling your orders and logistics partners delivering them. All partners are bound by confidentiality agreements. We may also share data when required by law.`,
  },
  {
    title: 'Cookies',
    content: `We use cookies to keep you logged in, remember your cart, and understand how visitors use our site. You can control cookies through your browser settings. See our Cookie Policy for details.`,
  },
  {
    title: 'Data Security',
    content: `All data is transmitted over HTTPS. Payment information is processed by PCI-DSS compliant gateways — we never store card details. We regularly review our security practices.`,
  },
  {
    title: 'Your Rights',
    content: `You may request access to, correction of, or deletion of your personal data at any time by contacting us at sagarcomputersatara@gmail.com. We will respond within 30 days.`,
  },
  {
    title: 'Changes to This Policy',
    content: `We may update this policy from time to time. Changes will be posted on this page with the updated date. Continued use of LaptopWorld after changes constitutes acceptance.`,
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

export const Privacy: React.FC = () => (
  <>
    <SEO title="Privacy Policy" description="LaptopWorld's privacy policy — how we collect, use, and protect your data." keywords="LaptopWorld privacy policy" />
    <LegalLayout
      title="Privacy Policy"
      subtitle="We take your privacy seriously. Here's exactly what data we collect and how we use it."
      updated="January 1, 2025"
    >
      {sections.map((s) => (
        <div key={s.title}>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">{s.title}</h2>
          <p className="text-sm text-gray-600 leading-relaxed">{s.content}</p>
        </div>
      ))}
      <div className="border-t border-gray-100 pt-6 text-sm text-gray-500">
        Questions? Contact us at{' '}
        <a href="mailto:sagarcomputersatara@gmail.com" className="text-blue-600 hover:underline">
          sagarcomputersatara@gmail.com
        </a>
      </div>
    </LegalLayout>
  </>
);