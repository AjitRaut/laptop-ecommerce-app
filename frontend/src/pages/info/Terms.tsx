import React from 'react';
import SEO from '@/components/common/SEO';
import { LegalPage } from '@/components/storefront/InfoPage';

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

export const Terms: React.FC = () => (
  <>
    <SEO title="Terms of Service" description="LaptopWorld's terms of service — your rights and responsibilities as a user." keywords="LaptopWorld terms of service" />
    <LegalPage
      title="Terms of Service"
      subtitle="Please read these terms carefully before using LaptopWorld."
      updated="January 1, 2025"
      sections={termsSections}
    />
  </>
);

export default Terms;
