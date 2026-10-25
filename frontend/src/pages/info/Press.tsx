import React from 'react';
import {
  CalendarDaysIcon,
  FolderOpenIcon,
  NewspaperIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';
import SEO from '@/components/common/SEO';
import GlassPanel from '@/components/storefront/GlassPanel';
import SectionHeading from '@/components/storefront/SectionHeading';
import StatusPill, { type StatusTone } from '@/components/storefront/StatusPill';
import { ExtrudedCard, IsoCube } from '@/components/storefront/Extruded';
import { RevealGroup, RevealItem } from '@/components/storefront/Reveal';
import { sfButtonClasses } from '@/components/storefront/SfButton';
import { Accent, InfoCta, InfoHero, InfoSection, InfoStats } from '@/components/storefront/InfoPage';

const pressReleases = [
  {
    date: 'April 2025',
    title: 'LaptopWorld Crosses 10,000 Happy Customers Milestone',
    summary:
      'LaptopWorld, the Satara-based laptop marketplace, announces it has served over 10,000 customers across India since launch — a testament to its commitment to quality and transparent pricing.',
    tag: 'Milestone',
  },
  {
    date: 'February 2025',
    title: 'LaptopWorld Expands Delivery to 100+ Cities Across India',
    summary:
      'Following strong demand from Tier 2 and Tier 3 cities, LaptopWorld has partnered with leading logistics providers to offer pan-India delivery with real-time tracking.',
    tag: 'Expansion',
  },
  {
    date: 'November 2024',
    title: 'LaptopWorld Onboards 50th Verified Vendor',
    summary:
      `The platform's vendor network continues to grow, reaching 50 verified partners across India. Each vendor undergoes a rigorous quality and compliance review before listing products.`,
    tag: 'Growth',
  },
  {
    date: 'August 2024',
    title: 'LaptopWorld Launches Multi-Vendor Marketplace in Satara, Maharashtra',
    summary:
      'LaptopWorld officially launched its multi-vendor e-commerce platform, aiming to simplify laptop buying for Indian consumers by aggregating trusted vendors under one roof.',
    tag: 'Launch',
  },
];

const stats = [
  { value: '500+', label: 'Products Listed' },
  { value: '10,000+', label: 'Happy Customers' },
  { value: '50+', label: 'Trusted Vendors' },
  { value: '100+', label: 'Cities Served' },
];

const tagTones: Record<string, StatusTone> = {
  Milestone: 'success',
  Expansion: 'accent',
  Growth: 'violet',
  Launch: 'warning',
};

const Press: React.FC = () => {
  return (
    <>
      <SEO
        title="Press"
        description="LaptopWorld press releases, company news, and media resources. Based in Satara, Maharashtra."
        keywords="LaptopWorld press, laptop marketplace India news, LaptopWorld media"
      />

      <InfoHero
        eyebrow="Newsroom"
        title={
          <>
            Press &amp; <Accent>Newsroom</Accent>
          </>
        }
        subtitle="The latest news, announcements, and milestones from LaptopWorld."
      />

      <InfoStats stats={stats} />

      {/* Press Releases */}
      <InfoSection narrow labelledBy="press-releases">
        <SectionHeading eyebrow="Announcements" title={<span id="press-releases">Press Releases</span>} />
        <RevealGroup as="ol" className="relative mt-10 space-y-5 border-l border-sf-line-strong pl-6 sm:pl-8">
          {pressReleases.map((pr) => (
            <RevealItem as="li" key={pr.title} className="relative">
              <span
                aria-hidden="true"
                className="absolute -left-[31px] top-7 h-3 w-3 rounded-full bg-sf-gradient shadow-sf-glow ring-4 ring-sf-bg sm:-left-[39px]"
              />
              <GlassPanel as="article">
                <div className="flex flex-wrap items-center gap-3">
                  <StatusPill tone={tagTones[pr.tag] ?? 'neutral'} dot>
                    {pr.tag}
                  </StatusPill>
                  <span className="inline-flex items-center gap-1.5 text-xs text-sf-subtle">
                    <CalendarDaysIcon aria-hidden="true" className="h-4 w-4" />
                    {pr.date}
                  </span>
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold leading-snug text-sf-ink sm:text-xl">{pr.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-sf-muted">{pr.summary}</p>
              </GlassPanel>
            </RevealItem>
          ))}
        </RevealGroup>
      </InfoSection>

      {/* Media Kit & Contact */}
      <InfoSection className="pt-0" labelledBy="press-resources">
        <h2 id="press-resources" className="sr-only">
          Media resources
        </h2>
        <RevealGroup className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <RevealItem className="h-full">
            <ExtrudedCard faceClassName="flex flex-col p-6 sm:p-8">
              <IsoCube icon={FolderOpenIcon} size={44} />
              <h3 className="mt-5 font-display text-xl font-semibold text-sf-ink">Media Kit</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-sf-muted">
                Download our official logos, brand guidelines, product screenshots, and company fact sheet for editorial
                use.
              </p>
              <a
                href="mailto:sagarcomputersatara@gmail.com?subject=Media Kit Request"
                className={sfButtonClasses({ variant: 'primary', className: 'mt-6 self-start' })}
              >
                Request Media Kit
              </a>
            </ExtrudedCard>
          </RevealItem>
          <RevealItem className="h-full">
            <ExtrudedCard faceClassName="flex flex-col p-6 sm:p-8">
              <IsoCube icon={NewspaperIcon} size={44} />
              <h3 className="mt-5 font-display text-xl font-semibold text-sf-ink">Press Enquiries</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-sf-muted">
                Are you a journalist or blogger covering Indian e-commerce or tech retail? We'd love to talk.
              </p>
              <a
                href="mailto:sagarcomputersatara@gmail.com?subject=Press Enquiry"
                className={sfButtonClasses({ variant: 'outline', className: 'mt-6 self-start' })}
              >
                Contact Press Team
              </a>
            </ExtrudedCard>
          </RevealItem>
        </RevealGroup>
      </InfoSection>

      <InfoCta
        title="About LaptopWorld"
        footnote={
          <span className="inline-flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            <span className="inline-flex items-center gap-1.5">
              <MapPinIcon aria-hidden="true" className="h-4 w-4 text-sf-accent" />
              Viswa Naka, Satara, Maharashtra 415001
            </span>
            <span className="inline-flex items-center gap-1.5">
              <PhoneIcon aria-hidden="true" className="h-4 w-4 text-sf-accent" />
              +91 8007486058
            </span>
            <a
              href="mailto:sagarcomputersatara@gmail.com"
              className="inline-flex items-center gap-1.5 font-medium text-sf-accent hover:underline"
            >
              <EnvelopeIcon aria-hidden="true" className="h-4 w-4" />
              sagarcomputersatara@gmail.com
            </a>
          </span>
        }
      >
        <p className="text-sm sm:text-base">
          LaptopWorld is a multi-vendor laptop marketplace based in Satara, Maharashtra. Founded with the mission of
          making premium computing accessible to every Indian household and business, LaptopWorld connects customers with
          50+ verified vendors offering 500+ products across 100+ cities. The platform is known for transparent pricing,
          quality-first vendor partnerships, and exceptional customer service.
        </p>
      </InfoCta>
    </>
  );
};

export default Press;
