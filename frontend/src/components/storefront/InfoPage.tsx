import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { CalendarDaysIcon, ListBulletIcon } from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import GlassPanel from './GlassPanel';
import { ExtrudedCard } from './Extruded';
import { RevealGroup, RevealItem, Reveal } from './Reveal';
import { container } from './utils';

/** "Information We Collect" → "information-we-collect" (used for legal section anchors). */
export const slugify = (text: string): string =>
  text
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

/* ─────────────────────────── Hero ─────────────────────────── */

interface InfoHeroProps {
  eyebrow: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Shown as a "Last updated" pill (legal pages). */
  updated?: string;
  actions?: React.ReactNode;
}

/** Shared banner for every info page: gradient mesh + grid backdrop with gentle parallax. */
export const InfoHero: React.FC<InfoHeroProps> = ({ eyebrow, title, subtitle, updated, actions }) => {
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const orbY = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [0, -120]);
  const textY = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [0, 60]);

  return (
    <section ref={ref} className="relative isolate overflow-hidden">
      <motion.div aria-hidden="true" style={{ y: orbY }} className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-48 left-1/2 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,var(--sf-mesh-a),transparent)]" />
        <div className="absolute -right-32 top-10 h-[24rem] w-[24rem] rounded-full bg-[radial-gradient(closest-side,var(--sf-mesh-b),transparent)]" />
        <div className="absolute -left-32 top-32 h-[20rem] w-[20rem] rounded-full bg-[radial-gradient(closest-side,var(--sf-mesh-c),transparent)]" />
      </motion.div>
      <div className={clsx(container, 'py-16 text-center sm:py-24')}>
        <motion.div style={{ y: textY }} className="mx-auto max-w-3xl">
          <p className="sf-glass inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 font-display text-xs font-semibold uppercase tracking-[0.2em] text-sf-accent">
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-sf-gradient" />
            {eyebrow}
          </p>
          <h1 className="mt-6 font-display text-[clamp(2.4rem,6vw,4.5rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-sf-ink">
            {title}
          </h1>
          {subtitle && <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-sf-muted">{subtitle}</p>}
          {updated && (
            <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-sf-surface-2 px-3.5 py-1.5 text-sm text-sf-muted ring-1 ring-sf-line">
              <CalendarDaysIcon aria-hidden="true" className="h-4 w-4 text-sf-accent" />
              Last updated: {updated}
            </p>
          )}
          {actions && <div className="mt-9 flex flex-wrap items-center justify-center gap-3">{actions}</div>}
        </motion.div>
      </div>
    </section>
  );
};

/** Gradient accent for a word inside an InfoHero title. */
export const Accent: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="sf-gradient-text">{children}</span>
);

/* ─────────────────────────── Building blocks ─────────────────────────── */

export const InfoSection: React.FC<{ children: React.ReactNode; className?: string; narrow?: boolean; id?: string; labelledBy?: string }> = ({
  children,
  className,
  narrow = false,
  id,
  labelledBy,
}) => (
  <section id={id} aria-labelledby={labelledBy} className={clsx(container, 'py-14 sm:py-20', className)}>
    <div className={clsx(narrow && 'mx-auto max-w-3xl')}>{children}</div>
  </section>
);

/** Big-number stat strip (About, Press). */
export const InfoStats: React.FC<{ stats: { value: string; label: string }[] }> = ({ stats }) => (
  <section aria-label="LaptopWorld in numbers" className={container}>
    <RevealGroup as="dl" className="sf-glass grid grid-cols-2 gap-y-8 rounded-sf-xl px-6 py-10 shadow-sf-card md:grid-cols-4">
      {stats.map((stat) => (
        <RevealItem key={stat.label} className="flex flex-col-reverse items-center text-center">
          <dt className="mt-1 text-sm text-sf-muted">{stat.label}</dt>
          <dd className="sf-gradient-text font-display text-4xl font-semibold tracking-tight sm:text-5xl">{stat.value}</dd>
        </RevealItem>
      ))}
    </RevealGroup>
  </section>
);

/** Numbered process steps on extruded cards (Shipping, Returns). */
export const InfoSteps: React.FC<{ steps: { step: string; title: string; desc: string }[] }> = ({ steps }) => (
  <RevealGroup as="ol" className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
    {steps.map((item) => (
      <RevealItem as="li" key={item.step} className="h-full">
        <ExtrudedCard faceClassName="p-6">
          <span aria-hidden="true" className="sf-gradient-text font-display text-4xl font-semibold">
            {item.step}
          </span>
          <h3 className="mt-4 font-display text-lg font-semibold text-sf-ink">{item.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-sf-muted">{item.desc}</p>
        </ExtrudedCard>
      </RevealItem>
    ))}
  </RevealGroup>
);

type CalloutTone = 'accent' | 'warning';

const calloutTones: Record<CalloutTone, string> = {
  accent: 'border-sf-accent/25 bg-sf-accent/10 [&_strong]:text-sf-accent',
  warning: 'border-sf-warning/30 bg-sf-warning/10 [&_strong]:text-sf-warning',
};

/** Tinted note box (delivery note, refund timeline). */
export const InfoCallout: React.FC<{ children: React.ReactNode; tone?: CalloutTone; icon?: React.ReactNode; className?: string }> = ({
  children,
  tone = 'accent',
  icon,
  className,
}) => (
  <div className={clsx('flex gap-3 rounded-sf-lg border p-5 text-sm leading-relaxed text-sf-ink', calloutTones[tone], className)}>
    {icon && <span className="mt-0.5 flex-shrink-0 [&>svg]:h-5 [&>svg]:w-5">{icon}</span>}
    <div>{children}</div>
  </div>
);

/** Closing call-to-action panel used at the bottom of info pages. */
export const InfoCta: React.FC<{ title: string; children?: React.ReactNode; actions?: React.ReactNode; footnote?: React.ReactNode }> = ({
  title,
  children,
  actions,
  footnote,
}) => {
  const id = `cta-${slugify(title)}`;
  return (
    <section aria-labelledby={id} className={clsx(container, 'pt-10')}>
      <Reveal>
        <div className="sf-gradient-border relative isolate overflow-hidden rounded-sf-xl bg-sf-surface/70 px-6 py-12 text-center shadow-sf-float sm:px-12">
          <div aria-hidden="true" className="absolute inset-0 -z-10">
            <div className="absolute -left-20 -top-24 h-72 w-72 rounded-full bg-[radial-gradient(closest-side,var(--sf-mesh-a),transparent)]" />
            <div className="absolute -bottom-24 -right-10 h-80 w-80 rounded-full bg-[radial-gradient(closest-side,var(--sf-mesh-b),transparent)]" />
            <div className="sf-grid-bg absolute inset-0 opacity-60" />
          </div>
          <h2 id={id} className="font-display text-2xl font-semibold tracking-tight text-sf-ink sm:text-4xl">
            {title}
          </h2>
          {children && <div className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-sf-muted">{children}</div>}
          {actions && <div className="mt-8 flex flex-wrap items-center justify-center gap-3">{actions}</div>}
          {footnote && <div className="mt-6 text-sm text-sf-muted">{footnote}</div>}
        </div>
      </Reveal>
    </section>
  );
};

/* ─────────────────────────── Legal template ─────────────────────────── */

export interface LegalSection {
  title: string;
  content: React.ReactNode;
}

interface LegalPageProps {
  title: string;
  subtitle: string;
  updated: string;
  sections: LegalSection[];
  /** Rendered after the last section (e.g. a contact line). */
  footer?: React.ReactNode;
}

/** Tracks which section heading is currently in the reading zone of the viewport. */
const useScrollSpy = (ids: string[]): string => {
  const [active, setActive] = useState(ids[0] ?? '');
  const key = ids.join('|');

  useEffect(() => {
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null);
    if (elements.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-20% 0px -65% 0px', threshold: 0 }
    );
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
    // `key` captures the id list
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return active;
};

/**
 * Legal/policy template: shared hero, sticky "On this page" navigation with
 * scroll-spy, and long-form content in readable prose.
 */
export const LegalPage: React.FC<LegalPageProps> = ({ title, subtitle, updated, sections, footer }) => {
  const items = useMemo(() => sections.map((section) => ({ ...section, id: slugify(section.title) })), [sections]);
  const active = useScrollSpy(items.map((item) => item.id));
  const reduceMotion = useReducedMotion();
  const mobileNav = useRef<HTMLDetailsElement>(null);

  const jumpTo = (event: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    window.history.replaceState(null, '', `#${id}`);
    target.querySelector('h2')?.focus({ preventScroll: true });
    if (mobileNav.current) mobileNav.current.open = false;
  };

  const navList = (variant: 'desktop' | 'mobile') => (
    <ol className={clsx('space-y-1', variant === 'mobile' && 'mt-3')}>
      {items.map((item, index) => {
        const current = active === item.id;
        return (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              onClick={(event) => jumpTo(event, item.id)}
              aria-current={current ? 'location' : undefined}
              className={clsx(
                'group flex items-start gap-3 rounded-sf-sm px-3 py-2 text-sm transition-colors',
                current ? 'bg-sf-accent/10 text-sf-ink' : 'text-sf-muted hover:bg-sf-surface-2 hover:text-sf-ink'
              )}
            >
              <span
                aria-hidden="true"
                className={clsx('font-display text-xs tabular-nums leading-5', current ? 'text-sf-accent' : 'text-sf-subtle')}
              >
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className="leading-5">{item.title}</span>
            </a>
          </li>
        );
      })}
    </ol>
  );

  return (
    <>
      <InfoHero eyebrow="Legal" title={title} subtitle={subtitle} updated={updated} />

      <div className={clsx(container, 'pb-8')}>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
          <aside className="lg:col-span-4 xl:col-span-3">
            {/* Mobile / tablet: collapsible list */}
            <details ref={mobileNav} className="sf-glass group rounded-sf-lg p-4 lg:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-sm font-semibold text-sf-ink [&::-webkit-details-marker]:hidden">
                <span className="inline-flex items-center gap-2">
                  <ListBulletIcon aria-hidden="true" className="h-5 w-5 text-sf-accent" />
                  On this page
                </span>
                <span className="text-xs font-normal text-sf-subtle">{items.length} sections</span>
              </summary>
              <nav aria-label="On this page">{navList('mobile')}</nav>
            </details>

            {/* Desktop: sticky side navigation */}
            <nav aria-label="On this page" className="sticky top-28 hidden lg:block">
              <GlassPanel padded={false} className="p-4">
                <p className="mb-2 px-3 font-display text-xs font-semibold uppercase tracking-[0.2em] text-sf-subtle">
                  On this page
                </p>
                {navList('desktop')}
              </GlassPanel>
            </nav>
          </aside>

          <article className="lg:col-span-8 xl:col-span-9">
            <GlassPanel padded={false} className="px-5 py-8 sm:px-10 sm:py-12">
              <div className="prose sf-prose max-w-none prose-p:leading-relaxed">
                {items.map((item, index) => (
                  <section
                    key={item.id}
                    id={item.id}
                    aria-labelledby={`${item.id}-heading`}
                    className={clsx('scroll-mt-28', index > 0 && 'mt-10 border-t border-sf-line pt-10')}
                  >
                    <h2
                      id={`${item.id}-heading`}
                      tabIndex={-1}
                      className="mb-3 mt-0 flex items-baseline gap-3 font-display text-xl font-semibold tracking-tight text-sf-ink focus:outline-none sm:text-2xl"
                    >
                      <span aria-hidden="true" className="sf-gradient-text text-base tabular-nums">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      {item.title}
                    </h2>
                    {typeof item.content === 'string' ? <p className="my-0">{item.content}</p> : item.content}
                  </section>
                ))}
              </div>
              {footer && <div className="mt-10 border-t border-sf-line pt-6 text-sm text-sf-muted">{footer}</div>}
            </GlassPanel>
          </article>
        </div>
      </div>
    </>
  );
};
