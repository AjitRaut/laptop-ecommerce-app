import React from 'react';
import SEO from '@/components/common/SEO';

const disclaimerSections = [
  {
    title: 'Product Information',
    content: `Product specifications, images, and descriptions are provided by vendors. While we verify vendor credibility, we cannot guarantee 100% accuracy of all listings. Always verify specifications with the vendor before purchase.`,
  },
  {
    title: 'Pricing',
    content: `Prices are subject to change without notice. Promotional prices are valid only for the duration of the offer. LaptopWorld is not responsible for price discrepancies caused by system errors.`,
  },
  {
    title: 'Third-Party Links',
    content: `Our platform may contain links to external websites. LaptopWorld is not responsible for the content, privacy practices, or reliability of third-party sites.`,
  },
  {
    title: 'Availability',
    content: `Product availability is subject to vendor stock levels. In rare cases, an order may be cancelled if a product becomes unavailable. You will be notified immediately and receive a full refund.`,
  },
  {
    title: 'No Warranty',
    content: `LaptopWorld provides the platform "as is" without warranties of any kind. We do not warrant uninterrupted access or error-free operation. Product warranties are governed by the respective manufacturers.`,
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

export const Disclaimer: React.FC = () => (
  <>
    <SEO title="Disclaimer" description="LaptopWorld's disclaimer regarding product information, pricing, and platform use." keywords="LaptopWorld disclaimer" />
    <LegalLayout
      title="Disclaimer"
      subtitle="Important information about the limitations of our platform and content."
      updated="January 1, 2025"
    >
      {disclaimerSections.map((s) => (
        <div key={s.title}>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">{s.title}</h2>
          <p className="text-sm text-gray-600 leading-relaxed">{s.content}</p>
        </div>
      ))}
    </LegalLayout>
  </>
);

export default Disclaimer;