// ─── Shipping.tsx ───────────────────────────────────────────────────────────
import React from 'react';
import { MapPinIcon, BuildingOffice2Icon, GlobeAsiaAustraliaIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import SEO from '@/components/common/SEO';
import GlassPanel from '@/components/storefront/GlassPanel';
import SectionHeading from '@/components/storefront/SectionHeading';
import StatusPill from '@/components/storefront/StatusPill';
import { RevealGroup, RevealItem } from '@/components/storefront/Reveal';
import { SfLinkButton } from '@/components/storefront/SfButton';
import { Accent, InfoCallout, InfoCta, InfoHero, InfoSection, InfoSteps } from '@/components/storefront/InfoPage';

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

const zoneIcons = [BuildingOffice2Icon, MapPinIcon, GlobeAsiaAustraliaIcon];

export const Shipping: React.FC = () => (
  <>
    <SEO
      title="Shipping Info"
      description="Learn about LaptopWorld's shipping zones, delivery timelines, and packaging policies."
      keywords="LaptopWorld shipping, laptop delivery India, shipping policy"
    />

    <InfoHero
      eyebrow="Delivery"
      title={
        <>
          Shipping <Accent>Information</Accent>
        </>
      }
      subtitle="Fast, reliable delivery across 100+ cities in India. Free shipping on all orders above ₹25,000."
    />

    {/* How it works */}
    <InfoSection className="pt-4 sm:pt-6" labelledBy="shipping-how">
      <SectionHeading align="center" eyebrow="Process" title={<span id="shipping-how">How Your Order Gets to You</span>} />
      <div className="mt-12">
        <InfoSteps steps={steps} />
      </div>
    </InfoSection>

    {/* Delivery Zones */}
    <InfoSection narrow className="pt-0 sm:pt-4" labelledBy="shipping-zones">
      <SectionHeading align="center" eyebrow="Timelines" title={<span id="shipping-zones">Delivery Timelines by Zone</span>} />
      <RevealGroup as="ul" className="mt-10 space-y-4">
        {shippingZones.map((z, index) => {
          const Icon = zoneIcons[index] ?? MapPinIcon;
          return (
            <RevealItem as="li" key={z.zone}>
              <GlassPanel className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-sf bg-sf-gradient text-sf-on-accent shadow-sf-glow">
                    <Icon aria-hidden="true" className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-display font-semibold text-sf-ink">{z.zone}</h3>
                    <p className="mt-1 text-sm text-sf-muted">{z.cities}</p>
                  </div>
                </div>
                <StatusPill tone="success" dot className="self-start sm:self-center">
                  {z.days}
                </StatusPill>
              </GlassPanel>
            </RevealItem>
          );
        })}
      </RevealGroup>
      <InfoCallout icon={<InformationCircleIcon aria-hidden="true" className="text-sf-accent" />} className="mt-6">
        <strong>Note:</strong> Delivery timelines are estimates and may vary during public holidays or high-demand periods.
        Express delivery is available at checkout for select pin codes.
      </InfoCallout>
    </InfoSection>

    <InfoCta title="Questions About Your Shipment?" actions={<SfLinkButton to="/contact" size="lg">Contact Support</SfLinkButton>}>
      Reach out and we'll track it down for you.
    </InfoCta>
  </>
);

export default Shipping;
