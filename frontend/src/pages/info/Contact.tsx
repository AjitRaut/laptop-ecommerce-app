import React, { useState } from 'react';
import { EnvelopeIcon, PhoneIcon, MapPinIcon, CheckCircleIcon, ClockIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import SEO from '@/components/common/SEO';
import GlassPanel from '@/components/storefront/GlassPanel';
import SectionHeading from '@/components/storefront/SectionHeading';
import { ExtrudedCard, IsoCube } from '@/components/storefront/Extruded';
import { Reveal, RevealGroup, RevealItem } from '@/components/storefront/Reveal';
import { SfButton } from '@/components/storefront/SfButton';
import { SelectField, TextAreaField, TextField } from '@/components/storefront/Field';
import { Accent, InfoHero, InfoSection } from '@/components/storefront/InfoPage';

const contactMethods = [
  {
    icon: EnvelopeIcon,
    label: 'Email Us',
    value: 'sagarcomputersatara@gmail.com',
    href: 'mailto:sagarcomputersatara@gmail.com',
  },
  {
    icon: PhoneIcon,
    label: 'Call Us',
    value: '+91 8007486058',
    href: 'tel:+918007486058',
  },
  {
    icon: MapPinIcon,
    label: 'Visit Us',
    value: 'Viswa Naka, Satara, Maharashtra 415001',
    href: 'https://maps.google.com/?q=Satara,Maharashtra',
  },
];

const hours = [
  { days: 'Monday – Saturday', time: '9:00 AM – 7:00 PM IST' },
  { days: 'Sunday', time: '10:00 AM – 4:00 PM IST' },
];

const Contact: React.FC = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const mailto = `mailto:sagarcomputersatara@gmail.com?subject=${encodeURIComponent(form.subject || 'Contact Form')}&body=${encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`)}`;
    window.location.href = mailto;
    setSubmitted(true);
  };

  return (
    <>
      <SEO
        title="Contact Us"
        description="Get in touch with LaptopWorld. We're here to help with product queries, orders, and support."
        keywords="contact LaptopWorld, laptop support India, Satara laptop store contact"
      />

      <InfoHero
        eyebrow="Contact"
        title={
          <>
            Get in <Accent>Touch</Accent>
          </>
        }
        subtitle="Have a question about a product, an order, or anything else? Our team is ready to help."
      />

      {/* Contact Methods */}
      <section aria-label="Ways to reach us" className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <RevealGroup as="ul" className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {contactMethods.map((m) => {
            const external = m.href.startsWith('http');
            return (
              <RevealItem as="li" key={m.label} className="h-full">
                <a
                  href={m.href}
                  {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className="group block h-full rounded-sf-xl"
                >
                  <ExtrudedCard faceClassName="flex flex-col items-center p-6 text-center">
                    <IsoCube icon={m.icon} size={44} />
                    <h2 className="mt-5 font-display text-lg font-semibold text-sf-ink transition-colors group-hover:text-sf-accent">
                      {m.label}
                    </h2>
                    <p className="mt-1 break-all text-sm text-sf-muted sm:break-normal">{m.value}</p>
                  </ExtrudedCard>
                </a>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </section>

      {/* Contact Form + Hours */}
      <InfoSection labelledBy="contact-form-heading">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <SectionHeading
              eyebrow="Message us"
              title={<span id="contact-form-heading">Send Us a Message</span>}
              description="Fill out the form below and we'll get back to you within 24 hours."
            />

            <Reveal className="mt-8">
              {submitted ? (
                <GlassPanel glow className="p-8 text-center sm:p-10" role="status">
                  <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sf-success/10 text-sf-success ring-1 ring-sf-success/25">
                    <CheckCircleIcon aria-hidden="true" className="h-9 w-9" />
                  </span>
                  <h3 className="mt-5 font-display text-xl font-semibold text-sf-ink">Message Sent!</h3>
                  <p className="mt-2 text-sf-muted">
                    Your email client should have opened. If not, email us directly at{' '}
                    <a href="mailto:sagarcomputersatara@gmail.com" className="break-all font-medium text-sf-accent hover:underline sm:break-normal">
                      sagarcomputersatara@gmail.com
                    </a>
                  </p>
                </GlassPanel>
              ) : (
                <GlassPanel glow className="p-5 sm:p-8">
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <TextField
                        label="Your Name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Rahul Sharma"
                      />
                      <TextField
                        label="Email Address"
                        name="email"
                        type="email"
                        autoComplete="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="rahul@example.com"
                      />
                    </div>
                    <SelectField label="Subject" name="subject" value={form.subject} onChange={handleChange}>
                      <option value="">Select a topic</option>
                      <option>Product Inquiry</option>
                      <option>Order Issue</option>
                      <option>Return / Refund</option>
                      <option>Vendor Partnership</option>
                      <option>Other</option>
                    </SelectField>
                    <TextAreaField
                      label="Message"
                      name="message"
                      rows={5}
                      value={form.message}
                      onChange={handleChange}
                      placeholder="Tell us how we can help..."
                      className="resize-none"
                    />
                    <SfButton type="submit" size="lg" fullWidth leftIcon={<PaperAirplaneIcon className="h-5 w-5" />}>
                      Send Message
                    </SfButton>
                  </form>
                </GlassPanel>
              )}
            </Reveal>
          </div>

          {/* Business Hours */}
          <aside className="lg:col-span-5 lg:pt-28" aria-labelledby="contact-hours">
            <Reveal delay={0.1}>
              <GlassPanel className="p-6 sm:p-8">
                <h2 id="contact-hours" className="flex items-center gap-3 font-display text-xl font-semibold text-sf-ink">
                  <span className="flex h-10 w-10 items-center justify-center rounded-sf bg-sf-gradient text-sf-on-accent shadow-sf-glow">
                    <ClockIcon aria-hidden="true" className="h-5 w-5" />
                  </span>
                  Business Hours
                </h2>
                <dl className="mt-6 divide-y divide-sf-line">
                  {hours.map((row) => (
                    <div key={row.days} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
                      <dt className="text-sm font-medium text-sf-ink">{row.days}</dt>
                      <dd className="text-sm tabular-nums text-sf-muted">{row.time}</dd>
                    </div>
                  ))}
                </dl>
              </GlassPanel>
            </Reveal>
          </aside>
        </div>
      </InfoSection>
    </>
  );
};

export default Contact;
