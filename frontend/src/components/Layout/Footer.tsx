import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { EnvelopeIcon, PhoneIcon, MapPinIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import BrandLogo from '../storefront/BrandLogo';
import { container } from '../storefront/utils';

const CONTACT_EMAIL = 'sagarcomputersatara@gmail.com';

const footerLinks = {
  company: [
    { name: 'About Us', href: '/about' },
    { name: 'Careers', href: '/careers' },
    { name: 'Press', href: '/press' },
    { name: 'Blog', href: '/blog' },
  ],
  support: [
    { name: 'Help Center', href: '/help' },
    { name: 'Contact Us', href: '/contact' },
    { name: 'Shipping Info', href: '/shipping' },
    { name: 'Returns', href: '/returns' },
  ],
  legal: [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Cookie Policy', href: '/cookies' },
    { name: 'Disclaimer', href: '/disclaimer' },
  ],
};

const linkColumns = [
  ['Company', footerLinks.company],
  ['Support', footerLinks.support],
  ['Legal', footerLinks.legal],
] as const;

const contact = [
  {
    label: 'Viswa Naka, Satara, Maharashtra 415001',
    href: 'https://maps.google.com/?q=Satara,Maharashtra',
    icon: MapPinIcon,
    external: true,
  },
  { label: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}`, icon: EnvelopeIcon, external: false },
  { label: '+91 8007486058', href: 'tel:+918007486058', icon: PhoneIcon, external: false },
];

const socials = [
  {
    name: 'Twitter',
    path: 'M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z',
  },
  {
    name: 'Pinterest',
    path: 'M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.097.118.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.741-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z',
  },
  {
    name: 'Instagram',
    path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z',
  },
];

const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  // There is no newsletter endpoint: open a prefilled email, same approach as the Contact page.
  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
      'Newsletter subscription'
    )}&body=${encodeURIComponent(`Please subscribe ${email} to LaptopWorld updates.`)}`;
  };

  return (
    <footer className="relative mt-24 border-t border-sf-line bg-sf-elevated/80">
      {/* Gradient top hairline + soft glow */}
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sf-accent-strong to-transparent" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-sf-accent-strong/10 to-transparent" />

      <div className={clsx(container, 'relative py-16')}>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          {/* Brand story + contact */}
          <div className="lg:col-span-4">
            <Link to="/" aria-label="LaptopWorld home" className="inline-block rounded-full">
              <BrandLogo size="lg" />
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-sf-muted">
              Your trusted destination for premium laptops and accessories. Quality products, competitive prices and
              exceptional service, from Satara to doorsteps across India.
            </p>
            <ul className="mt-6 space-y-3">
              {contact.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    {...(item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    className="group inline-flex items-start gap-3 text-sm text-sf-muted transition-colors hover:text-sf-ink"
                  >
                    <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-sf-surface-2 text-sf-accent ring-1 ring-sf-line transition-colors group-hover:ring-sf-accent/40">
                      <item.icon className="h-4 w-4" />
                    </span>
                    <span className="break-all pt-1.5 sm:break-normal">{item.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-4">
            {linkColumns.map(([heading, links]) => (
              <nav key={heading} aria-label={heading}>
                <h2 className="font-display text-sm font-semibold text-sf-ink">{heading}</h2>
                <ul className="mt-4 space-y-3">
                  {links.map((link) => (
                    <li key={link.name}>
                      <Link to={link.href} className="text-sm text-sf-muted transition-colors hover:text-sf-ink">
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>

          {/* Newsletter + socials */}
          <div className="lg:col-span-4">
            <div className="sf-glass sf-gradient-border rounded-sf-lg p-6">
              <h2 className="font-display text-lg font-semibold text-sf-ink">Stay updated</h2>
              <p className="mt-2 text-sm text-sf-muted">Get the latest deals and product updates delivered to your inbox.</p>
              <form onSubmit={handleSubscribe} noValidate className="mt-5">
                <label htmlFor="footer-newsletter" className="sr-only">
                  Email address
                </label>
                <div className="relative">
                  <input
                    id="footer-newsletter"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    aria-invalid={error ? true : undefined}
                    aria-describedby={error ? 'footer-newsletter-error' : undefined}
                    className="sf-field h-12 w-full rounded-full border border-sf-line-strong bg-sf-surface/70 pl-5 pr-[8.5rem] text-sm text-sf-ink placeholder:text-sf-subtle focus:border-sf-accent-strong focus:outline-none focus:ring-4 focus:ring-sf-accent-strong/20 focus-visible:outline-none"
                  />
                  <button
                    type="submit"
                    className="absolute right-1.5 top-1.5 inline-flex h-9 items-center gap-1.5 rounded-full bg-sf-gradient px-4 text-sm font-medium text-sf-on-accent shadow-sf-glow transition hover:brightness-110"
                  >
                    Subscribe <ArrowRightIcon className="h-4 w-4" />
                  </button>
                </div>
                {error && (
                  <p id="footer-newsletter-error" role="alert" className="mt-2 text-sm text-sf-danger">
                    {error}
                  </p>
                )}
              </form>
              <div className="mt-6 flex items-center gap-2">
                {socials.map((social) => (
                  <a
                    key={social.name}
                    href="#"
                    aria-label={social.name}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-sf-surface-2 text-sf-muted ring-1 ring-sf-line transition-[transform,color] hover:-translate-y-0.5 hover:text-sf-ink hover:ring-sf-accent/40"
                  >
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d={social.path} />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 flex flex-col gap-4 border-t border-sf-line pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-sf-subtle">&copy; {new Date().getFullYear()} LaptopWorld. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-sm text-sf-subtle">We accept</span>
            {['VISA', 'MC', 'UPI'].map((method) => (
              <span
                key={method}
                className="rounded-md border border-sf-line-strong bg-sf-surface-2 px-2 py-1 text-[11px] font-semibold tracking-wide text-sf-muted"
              >
                {method}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
