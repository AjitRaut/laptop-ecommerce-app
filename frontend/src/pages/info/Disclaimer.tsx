import React from 'react';
import SEO from '@/components/common/SEO';
import { LegalPage } from '@/components/storefront/InfoPage';

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

export const Disclaimer: React.FC = () => (
  <>
    <SEO title="Disclaimer" description="LaptopWorld's disclaimer regarding product information, pricing, and platform use." keywords="LaptopWorld disclaimer" />
    <LegalPage
      title="Disclaimer"
      subtitle="Important information about the limitations of our platform and content."
      updated="January 1, 2025"
      sections={disclaimerSections}
    />
  </>
);

export default Disclaimer;
