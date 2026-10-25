import React from 'react';
import SEO from '@/components/common/SEO';
import StatusPill from '@/components/storefront/StatusPill';
import { LegalPage, type LegalSection } from '@/components/storefront/InfoPage';

const cookieTypes = [
  { name: 'Essential Cookies', desc: 'Required for the site to function — login sessions, cart data. Cannot be disabled.', canDisable: false },
  { name: 'Analytics Cookies', desc: 'Help us understand how visitors use our site so we can improve it.', canDisable: true },
  { name: 'Preference Cookies', desc: 'Remember your settings like language or region.', canDisable: true },
  { name: 'Marketing Cookies', desc: 'Used to show you relevant ads on other platforms. We do not use these currently.', canDisable: true },
];

const sections: LegalSection[] = [
  {
    title: 'What Are Cookies?',
    content:
      'Cookies are small text files stored on your device when you visit a website. They help sites remember your preferences and understand how you use them.',
  },
  {
    title: 'Types of Cookies We Use',
    content: (
      <ul className="not-prose grid grid-cols-1 gap-3 sm:grid-cols-2">
        {cookieTypes.map((c) => (
          <li key={c.name} className="flex flex-col gap-3 rounded-sf-lg bg-sf-surface-2/70 p-4 ring-1 ring-sf-line">
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-display text-sm font-semibold text-sf-ink">{c.name}</h3>
              <StatusPill tone={c.canDisable ? 'warning' : 'success'} dot>
                {c.canDisable ? 'Optional' : 'Required'}
              </StatusPill>
            </div>
            <p className="text-sm leading-relaxed text-sf-muted">{c.desc}</p>
          </li>
        ))}
      </ul>
    ),
  },
  {
    title: 'How to Control Cookies',
    content:
      'You can control cookies through your browser settings. Disabling essential cookies may affect site functionality. Most browsers allow you to block or delete cookies in their privacy or security settings.',
  },
];

export const Cookies: React.FC = () => (
  <>
    <SEO title="Cookie Policy" description="LaptopWorld's cookie policy — what cookies we use and how to control them." keywords="LaptopWorld cookies policy" />
    <LegalPage
      title="Cookie Policy"
      subtitle="We use cookies to give you the best experience. Here's what that means."
      updated="January 1, 2025"
      sections={sections}
    />
  </>
);

export default Cookies;
