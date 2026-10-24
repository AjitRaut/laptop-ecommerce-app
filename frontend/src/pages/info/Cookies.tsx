import React from 'react';
import SEO from '@/components/common/SEO';

const cookieTypes = [
  { name: 'Essential Cookies', desc: 'Required for the site to function — login sessions, cart data. Cannot be disabled.', canDisable: false },
  { name: 'Analytics Cookies', desc: 'Help us understand how visitors use our site so we can improve it.', canDisable: true },
  { name: 'Preference Cookies', desc: 'Remember your settings like language or region.', canDisable: true },
  { name: 'Marketing Cookies', desc: 'Used to show you relevant ads on other platforms. We do not use these currently.', canDisable: true },
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

export const Cookies: React.FC = () => (
  <>
    <SEO title="Cookie Policy" description="LaptopWorld's cookie policy — what cookies we use and how to control them." keywords="LaptopWorld cookies policy" />
    <LegalLayout
      title="Cookie Policy"
      subtitle="We use cookies to give you the best experience. Here's what that means."
      updated="January 1, 2025"
    >
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">What Are Cookies?</h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          Cookies are small text files stored on your device when you visit a website. They help sites remember your preferences and understand how you use them.
        </p>
      </div>
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Types of Cookies We Use</h2>
        <div className="space-y-4">
          {cookieTypes.map((c) => (
            <div key={c.name} className="flex items-start justify-between gap-4 p-4 bg-gray-50 rounded-xl">
              <div>
                <h3 className="font-medium text-gray-900 text-sm">{c.name}</h3>
                <p className="text-xs text-gray-500 mt-1">{c.desc}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap ${c.canDisable ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                {c.canDisable ? 'Optional' : 'Required'}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">How to Control Cookies</h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          You can control cookies through your browser settings. Disabling essential cookies may affect site functionality. Most browsers allow you to block or delete cookies in their privacy or security settings.
        </p>
      </div>
    </LegalLayout>
  </>
);

export default Cookies;