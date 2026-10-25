import React from 'react';
import { CheckCircleIcon, XCircleIcon, BanknotesIcon } from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import SEO from '@/components/common/SEO';
import GlassPanel from '@/components/storefront/GlassPanel';
import SectionHeading from '@/components/storefront/SectionHeading';
import { Reveal } from '@/components/storefront/Reveal';
import { SfLinkButton } from '@/components/storefront/SfButton';
import { Accent, InfoCallout, InfoCta, InfoHero, InfoSection, InfoSteps } from '@/components/storefront/InfoPage';

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

    <InfoHero
      eyebrow="Returns"
      title={
        <>
          Returns &amp; <Accent>Refunds</Accent>
        </>
      }
      subtitle="Not satisfied? We offer a hassle-free 7-day return policy on most products."
    />

    <InfoSection className="pt-4 sm:pt-6" labelledBy="returns-how">
      <SectionHeading align="center" eyebrow="Process" title={<span id="returns-how">How Returns Work</span>} />
      <div className="mt-12">
        <InfoSteps steps={returnSteps} />
      </div>
    </InfoSection>

    <InfoSection narrow className="pt-0 sm:pt-4" labelledBy="returns-eligibility">
      <SectionHeading align="center" eyebrow="Eligibility" title={<span id="returns-eligibility">Return Eligibility</span>} />
      <Reveal className="mt-10">
        <GlassPanel className="p-6 sm:p-8">
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {eligibility.map((e) => (
              <li
                key={e.text}
                className={clsx(
                  'flex items-start gap-3 rounded-sf p-3 text-sm ring-1 ring-inset',
                  e.ok ? 'bg-sf-success/10 ring-sf-success/20' : 'bg-sf-danger/10 ring-sf-danger/20'
                )}
              >
                {e.ok ? (
                  <CheckCircleIcon className="h-5 w-5 flex-shrink-0 text-sf-success" aria-label="Eligible" />
                ) : (
                  <XCircleIcon className="h-5 w-5 flex-shrink-0 text-sf-danger" aria-label="Not eligible" />
                )}
                <span className="text-sf-ink">{e.text}</span>
              </li>
            ))}
          </ul>
        </GlassPanel>
      </Reveal>
      <InfoCallout tone="warning" icon={<BanknotesIcon aria-hidden="true" className="text-sf-warning" />} className="mt-6">
        <strong>Refund Timeline:</strong> Once your return is approved, refunds take 5–7 business days to reflect in your
        account depending on your bank.
      </InfoCallout>
    </InfoSection>

    <InfoCta title="Need Help With a Return?" actions={<SfLinkButton to="/contact" size="lg">Contact Support</SfLinkButton>}>
      Our support team will guide you through the entire process.
    </InfoCta>
  </>
);

export default Returns;
