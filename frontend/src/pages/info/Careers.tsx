import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  HomeModernIcon,
  HeartIcon,
  BookOpenIcon,
  ClockIcon,
  PaperAirplaneIcon,
  ComputerDesktopIcon,
  ChevronDownIcon,
  MapPinIcon,
  BriefcaseIcon,
} from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import SEO from '@/components/common/SEO';
import GlassPanel from '@/components/storefront/GlassPanel';
import SectionHeading from '@/components/storefront/SectionHeading';
import StatusPill from '@/components/storefront/StatusPill';
import { ExtrudedCard } from '@/components/storefront/Extruded';
import { RevealGroup, RevealItem } from '@/components/storefront/Reveal';
import { sfButtonClasses } from '@/components/storefront/SfButton';
import { Accent, InfoCta, InfoHero, InfoSection, slugify } from '@/components/storefront/InfoPage';

const openings = [
  {
    title: 'Frontend Developer',
    type: 'Full-time',
    location: 'Satara, MH / Remote',
    department: 'Engineering',
    description:
      'Build beautiful, performant React interfaces for our e-commerce platform. You will work closely with design and backend teams.',
  },
  {
    title: 'Backend Developer (Django)',
    type: 'Full-time',
    location: 'Satara, MH / Remote',
    department: 'Engineering',
    description:
      'Design and maintain our REST APIs, manage database performance, and build scalable backend systems using Django REST Framework.',
  },
  {
    title: 'Customer Support Executive',
    type: 'Full-time',
    location: 'Satara, MH',
    department: 'Support',
    description:
      'Assist customers with product queries, order issues, and returns. You are the voice of LaptopWorld and the first line of customer happiness.',
  },
  {
    title: 'Vendor Relationship Manager',
    type: 'Full-time',
    location: 'Satara, MH',
    department: 'Operations',
    description:
      'Onboard new vendors, maintain relationships, ensure product quality standards, and help vendors grow their sales on our platform.',
  },
  {
    title: 'Digital Marketing Executive',
    type: 'Full-time',
    location: 'Remote',
    department: 'Marketing',
    description:
      `Run performance marketing campaigns, manage SEO, social media, and content strategy to grow LaptopWorlds reach across India.`,
  },
];

const perks = [
  { label: 'Remote-Friendly', icon: HomeModernIcon },
  { label: 'Health Insurance', icon: HeartIcon },
  { label: 'Learning Budget', icon: BookOpenIcon },
  { label: 'Flexible Hours', icon: ClockIcon },
  { label: 'Team Retreats', icon: PaperAirplaneIcon },
  { label: 'Device Allowance', icon: ComputerDesktopIcon },
];

const Careers: React.FC = () => {
  const [openJob, setOpenJob] = useState<number | null>(null);

  return (
    <>
      <SEO
        title="Careers"
        description="Join the LaptopWorld team. We're hiring engineers, support staff, and more. Build the future of laptop retail in India."
        keywords="LaptopWorld careers, jobs Satara, tech jobs Maharashtra, e-commerce jobs India"
      />

      <InfoHero
        eyebrow="Careers"
        title={
          <>
            Work at <Accent>LaptopWorld</Accent>
          </>
        }
        subtitle="We're a small, fast-moving team building India's most trusted laptop marketplace. If you care about craft, customers, and impact — you'll fit right in."
      />

      {/* Perks */}
      <InfoSection className="pt-4 sm:pt-6" labelledBy="careers-perks">
        <SectionHeading align="center" eyebrow="Perks" title={<span id="careers-perks">Why Join Us?</span>} />
        <RevealGroup as="ul" className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
          {perks.map((perk) => (
            <RevealItem as="li" key={perk.label} className="h-full">
              <ExtrudedCard faceClassName="flex flex-col items-center p-5 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-sf bg-sf-gradient text-sf-on-accent shadow-sf-glow transition-transform duration-500 group-hover:-translate-y-0.5">
                  <perk.icon aria-hidden="true" className="h-6 w-6" />
                </span>
                <p className="mt-3 text-sm font-medium text-sf-ink">{perk.label}</p>
              </ExtrudedCard>
            </RevealItem>
          ))}
        </RevealGroup>
      </InfoSection>

      {/* Open Roles */}
      <InfoSection narrow className="pt-0 sm:pt-4" labelledBy="careers-openings">
        <SectionHeading
          eyebrow="Open roles"
          title={<span id="careers-openings">Open Positions</span>}
          description={
            <>
              Don't see a role that fits? Email us at{' '}
              <a href="mailto:sagarcomputersatara@gmail.com" className="break-all font-medium text-sf-accent hover:underline sm:break-normal">
                sagarcomputersatara@gmail.com
              </a>{' '}
              with your resume.
            </>
          }
        />

        <RevealGroup as="ul" className="mt-10 space-y-4">
          {openings.map((job, idx) => {
            const open = openJob === idx;
            const panelId = `job-${slugify(job.title)}`;
            return (
              <RevealItem as="li" key={job.title}>
                <GlassPanel padded={false} className={clsx('overflow-hidden transition-colors', open && 'border-sf-accent/40')}>
                  <h3>
                    <button
                      type="button"
                      aria-expanded={open}
                      aria-controls={panelId}
                      onClick={() => setOpenJob(open ? null : idx)}
                      className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left sm:px-6"
                    >
                      <span>
                        <span className="block font-display text-lg font-semibold text-sf-ink">{job.title}</span>
                        <span className="mt-2 flex flex-wrap gap-2">
                          <StatusPill tone="accent">
                            <BriefcaseIcon aria-hidden="true" className="h-3.5 w-3.5" />
                            {job.department}
                          </StatusPill>
                          <StatusPill tone="neutral">{job.type}</StatusPill>
                          <StatusPill tone="violet">
                            <MapPinIcon aria-hidden="true" className="h-3.5 w-3.5" />
                            {job.location}
                          </StatusPill>
                        </span>
                      </span>
                      <span
                        className={clsx(
                          'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-sf-surface-2 text-sf-muted ring-1 ring-sf-line transition-transform duration-300',
                          open && 'rotate-180 text-sf-accent'
                        )}
                      >
                        <ChevronDownIcon aria-hidden="true" className="h-5 w-5" />
                      </span>
                    </button>
                  </h3>
                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div
                        id={panelId}
                        role="region"
                        aria-label={job.title}
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="border-t border-sf-line px-5 pb-6 sm:px-6"
                      >
                        <p className="mt-4 leading-relaxed text-sf-muted">{job.description}</p>
                        <a
                          href={`mailto:sagarcomputersatara@gmail.com?subject=Application for ${job.title}`}
                          className={sfButtonClasses({ variant: 'primary', size: 'sm', className: 'mt-5' })}
                        >
                          Apply for this Role
                        </a>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </GlassPanel>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </InfoSection>

      <InfoCta
        title="Don't See the Right Role?"
        actions={
          <a
            href="mailto:sagarcomputersatara@gmail.com?subject=Open Application – LaptopWorld"
            className={sfButtonClasses({ variant: 'primary', size: 'lg' })}
          >
            Send Open Application
          </a>
        }
      >
        We're always looking for talented people. Send us your profile and we'll be in touch.
      </InfoCta>
    </>
  );
};

export default Careers;
