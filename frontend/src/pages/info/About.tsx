import React from 'react';
import {
  CheckBadgeIcon,
  HeartIcon,
  CalculatorIcon,
  GlobeAsiaAustraliaIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  BuildingStorefrontIcon,
  MapPinIcon,
  PhoneIcon,
  ArrowRightIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';
import SEO from '@/components/common/SEO';
import GlassPanel from '@/components/storefront/GlassPanel';
import SectionHeading from '@/components/storefront/SectionHeading';
import { ExtrudedCard, IsoCube } from '@/components/storefront/Extruded';
import { Reveal, RevealGroup, RevealItem } from '@/components/storefront/Reveal';
import { SfLinkButton, sfButtonClasses } from '@/components/storefront/SfButton';
import { Accent, InfoCta, InfoHero, InfoSection, InfoStats } from '@/components/storefront/InfoPage';

const stats = [
  { label: 'Products Listed', value: '500+' },
  { label: 'Happy Customers', value: '10,000+' },
  { label: 'Trusted Vendors', value: '50+' },
  { label: 'Cities Served', value: '100+' },
];

const values = [
  {
    title: 'Quality First',
    description:
      'Every product on LaptopWorld is verified and curated. We partner only with trusted vendors who meet our quality standards.',
    icon: CheckBadgeIcon,
  },
  {
    title: 'Customer Obsessed',
    description:
      'From browsing to delivery, we obsess over every step of your experience. Your satisfaction is not a metric — it is our mission.',
    icon: HeartIcon,
  },
  {
    title: 'Transparent Pricing',
    description:
      'No hidden fees, no surprise charges. What you see is what you pay. We believe in honest, upfront pricing on every product.',
    icon: CalculatorIcon,
  },
  {
    title: 'Pan-India Reach',
    description:
      'Based in Satara, Maharashtra, we serve customers across India with reliable logistics and fast delivery to your doorstep.',
    icon: GlobeAsiaAustraliaIcon,
  },
];

const team = [
  {
    name: 'Founders',
    role: 'Viswa Naka, Satara',
    description:
      'LaptopWorld was founded with a single vision — to make premium computing accessible to every Indian household and business.',
    icon: BuildingStorefrontIcon,
  },
  {
    name: 'Our Support Team',
    role: 'Customer Happiness',
    description:
      'A dedicated team available to help you choose the right device, resolve queries, and ensure your orders arrive on time.',
    icon: ChatBubbleLeftRightIcon,
  },
  {
    name: 'Our Vendor Network',
    role: 'Quality Partners',
    description:
      'We work with 50+ vetted vendors across India to bring you the widest selection of laptops and accessories at competitive prices.',
    icon: UserGroupIcon,
  },
];

const milestones = [
  {
    title: 'Founded in Satara',
    description: "Born out of a real customer problem in Maharashtra's tech retail scene.",
  },
  {
    title: 'Multi-Vendor Platform',
    description: 'We onboarded 50+ verified vendors to bring competitive pricing and wider selection.',
  },
  {
    title: 'Pan-India Delivery',
    description: 'Expanded logistics to serve customers in 100+ cities across India.',
  },
];

const About: React.FC = () => {
  return (
    <>
      <SEO
        title="About Us"
        description="Learn about LaptopWorld — your trusted destination for premium laptops and accessories. Based in Satara, Maharashtra, serving customers pan-India."
        keywords="about LaptopWorld, laptop store India, Satara laptop shop, premium laptops"
      />

      <InfoHero
        eyebrow="About us"
        title={
          <>
            About <Accent>LaptopWorld</Accent>
          </>
        }
        subtitle="Your trusted destination for premium laptops and accessories. We've been helping customers find the perfect device since day one — quality products, honest prices, exceptional service."
        actions={
          <>
            <SfLinkButton to="/products" size="lg" rightIcon={<ArrowRightIcon className="h-5 w-5" />}>
              Browse Products
            </SfLinkButton>
            <SfLinkButton to="/contact" variant="secondary" size="lg">
              Contact Us
            </SfLinkButton>
          </>
        }
      />

      <InfoStats stats={stats} />

      {/* Our Story */}
      <InfoSection labelledBy="about-story">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <SectionHeading eyebrow="Our story" title={<span id="about-story">Our Story</span>} />
            <div className="mt-6 space-y-4 text-base leading-relaxed text-sf-muted">
              <p>
                LaptopWorld started with a simple observation: buying a laptop in India was unnecessarily complicated.
                Customers had to visit multiple stores, compare inconsistent prices, and rely on salespeople who didn't
                always have their best interests at heart.
              </p>
              <p>
                Founded in Satara, Maharashtra, we set out to build a platform where customers could discover verified
                products from trusted vendors, compare options side by side, and buy with complete confidence — all from
                the comfort of their home.
              </p>
              <p>
                Today, LaptopWorld serves thousands of customers across India, from students buying their first laptop to
                businesses equipping entire teams. We remain committed to the values we started with: transparency,
                quality, and service.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <GlassPanel glow className="p-6 sm:p-8">
              <ol className="relative space-y-8">
                <span aria-hidden="true" className="absolute bottom-3 left-5 top-3 w-px bg-sf-gradient opacity-60" />
                {milestones.map((milestone, index) => (
                  <li key={milestone.title} className="relative flex items-start gap-4">
                    <span className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-sf-gradient font-display text-sm font-semibold text-sf-on-accent shadow-sf-glow">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div className="pt-1">
                      <h3 className="font-display font-semibold text-sf-ink">{milestone.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-sf-muted">{milestone.description}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </GlassPanel>
          </Reveal>
        </div>
      </InfoSection>

      {/* Values */}
      <InfoSection labelledBy="about-values" className="pt-0 sm:pt-4">
        <SectionHeading
          align="center"
          eyebrow="Our values"
          title={<span id="about-values">What We Stand For</span>}
          description="These aren't just words on a page — they're the principles that shape every decision we make at LaptopWorld."
        />
        <RevealGroup className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((value) => (
            <RevealItem key={value.title} className="h-full">
              <ExtrudedCard faceClassName="p-6">
                <IsoCube icon={value.icon} size={44} />
                <h3 className="mt-5 font-display text-lg font-semibold text-sf-ink">{value.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-sf-muted">{value.description}</p>
              </ExtrudedCard>
            </RevealItem>
          ))}
        </RevealGroup>
      </InfoSection>

      {/* Team / People */}
      <InfoSection labelledBy="about-people" className="pt-0 sm:pt-4">
        <SectionHeading
          align="center"
          eyebrow="Our people"
          title={<span id="about-people">The People Behind LaptopWorld</span>}
          description="A passionate team dedicated to making your laptop-buying experience seamless."
        />
        <RevealGroup className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {team.map((member) => (
            <RevealItem key={member.name} className="h-full">
              <GlassPanel className="h-full p-6 text-center sm:p-8">
                <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sf-gradient text-sf-on-accent shadow-sf-glow">
                  <member.icon aria-hidden="true" className="h-8 w-8" />
                </span>
                <h3 className="mt-5 font-display text-lg font-semibold text-sf-ink">{member.name}</h3>
                <p className="mt-1 text-sm font-medium text-sf-accent">{member.role}</p>
                <p className="mt-3 text-sm leading-relaxed text-sf-muted">{member.description}</p>
              </GlassPanel>
            </RevealItem>
          ))}
        </RevealGroup>
      </InfoSection>

      <InfoCta
        title="Have Questions?"
        actions={
          <>
            <SfLinkButton to="/contact" size="lg">
              Get in Touch
            </SfLinkButton>
            <a
              href="mailto:sagarcomputersatara@gmail.com"
              className={sfButtonClasses({ variant: 'secondary', size: 'lg', className: 'max-w-full' })}
            >
              <EnvelopeIcon aria-hidden="true" className="h-5 w-5 flex-shrink-0" />
              <span className="truncate">sagarcomputersatara@gmail.com</span>
            </a>
          </>
        }
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
          </span>
        }
      >
        Our team is available to help you pick the right product or resolve any concern. Reach out — we'd love to hear
        from you.
      </InfoCta>
    </>
  );
};

export default About;
