import React from 'react';
import SEO from '@/components/common/SEO';

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

const tagColors: Record<string, string> = {
  Milestone: 'bg-green-100 text-green-700',
  Expansion: 'bg-blue-100 text-blue-700',
  Growth: 'bg-purple-100 text-purple-700',
  Launch: 'bg-orange-100 text-orange-700',
};

const Press: React.FC = () => {
  return (
    <>
      <SEO
        title="Press"
        description="LaptopWorld press releases, company news, and media resources. Based in Satara, Maharashtra."
        keywords="LaptopWorld press, laptop marketplace India news, LaptopWorld media"
      />

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 text-white">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 text-center">
          <h1 className="text-4xl font-bold sm:text-5xl mb-4">
            Press &{' '}
            <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
              Newsroom
            </span>
          </h1>
          <p className="mt-4 text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
            The latest news, announcements, and milestones from LaptopWorld.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl font-bold gradient-text">{s.value}</p>
                <p className="mt-1 text-sm text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Press Releases */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Press Releases</h2>
          <div className="space-y-5">
            {pressReleases.map((pr) => (
              <div key={pr.title} className="card p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${tagColors[pr.tag]}`}>
                      {pr.tag}
                    </span>
                    <span className="text-xs text-gray-400">{pr.date}</span>
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 text-lg mb-2 leading-snug">{pr.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{pr.summary}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Media Kit & Contact */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Media Kit */}
            <div className="card p-8">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4 text-2xl">
                🗂️
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Media Kit</h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">
                Download our official logos, brand guidelines, product screenshots, and company fact sheet for editorial use.
              </p>
              <a
                href="mailto:sagarcomputersatara@gmail.com?subject=Media Kit Request"
                className="inline-flex px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                Request Media Kit
              </a>
            </div>

            {/* Press Contact */}
            <div className="card p-8">
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4 text-2xl">
                📰
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Press Enquiries</h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">
                Are you a journalist or blogger covering Indian e-commerce or tech retail? We'd love to talk.
              </p>
              <a
                href="mailto:sagarcomputersatara@gmail.com?subject=Press Enquiry"
                className="inline-flex px-5 py-2.5 border-2 border-blue-600 text-blue-600 text-sm font-semibold rounded-lg hover:bg-blue-50 transition-colors"
              >
                Contact Press Team
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* About blurb */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-14">
        <div className="mx-auto max-w-3xl px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">About LaptopWorld</h2>
          <p className="text-blue-100 leading-relaxed text-sm">
            LaptopWorld is a multi-vendor laptop marketplace based in Satara, Maharashtra. Founded with the mission of making premium computing accessible to every Indian household and business, LaptopWorld connects customers with 50+ verified vendors offering 500+ products across 100+ cities. The platform is known for transparent pricing, quality-first vendor partnerships, and exceptional customer service.
          </p>
          <p className="mt-4 text-blue-200 text-sm">
            📍 Viswa Naka, Satara, Maharashtra 415001 &nbsp;|&nbsp; 📞 +91 8007486058 &nbsp;|&nbsp;
            <a href="mailto:sagarcomputersatara@gmail.com" className="underline hover:text-white">
              sagarcomputersatara@gmail.com
            </a>
          </p>
        </div>
      </section>
    </>
  );
};

export default Press;