import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '@/components/common/SEO';

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
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
  },
  {
    title: 'Customer Obsessed',
    description:
      'From browsing to delivery, we obsess over every step of your experience. Your satisfaction is not a metric — it is our mission.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
  },
  {
    title: 'Transparent Pricing',
    description:
      'No hidden fees, no surprise charges. What you see is what you pay. We believe in honest, upfront pricing on every product.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    title: 'Pan-India Reach',
    description:
      'Based in Satara, Maharashtra, we serve customers across India with reliable logistics and fast delivery to your doorstep.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

const team = [
  {
    name: 'Founders',
    role: 'Viswa Naka, Satara',
    description:
      'LaptopWorld was founded with a single vision — to make premium computing accessible to every Indian household and business.',
  },
  {
    name: 'Our Support Team',
    role: 'Customer Happiness',
    description:
      'A dedicated team available to help you choose the right device, resolve queries, and ensure your orders arrive on time.',
  },
  {
    name: 'Our Vendor Network',
    role: 'Quality Partners',
    description:
      'We work with 50+ vetted vendors across India to bring you the widest selection of laptops and accessories at competitive prices.',
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

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 text-white">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
            About{' '}
            <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
              LaptopWorld
            </span>
          </h1>
          <p className="mt-4 text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
            Your trusted destination for premium laptops and accessories. We've been helping
            customers find the perfect device since day one — quality products, honest prices,
            exceptional service.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link to="/products" className="btn-primary px-8 py-3 text-base">
              Browse Products
            </Link>
            <Link
              to="/contact"
              className="px-8 py-3 text-base border-2 border-white text-white rounded-lg hover:bg-white hover:text-blue-700 transition-colors font-medium"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold gradient-text">{stat.value}</p>
                <p className="mt-1 text-sm text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Story</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  LaptopWorld started with a simple observation: buying a laptop in India was
                  unnecessarily complicated. Customers had to visit multiple stores, compare
                  inconsistent prices, and rely on salespeople who didn't always have their best
                  interests at heart.
                </p>
                <p>
                  Founded in Satara, Maharashtra, we set out to build a platform where customers
                  could discover verified products from trusted vendors, compare options side by
                  side, and buy with complete confidence — all from the comfort of their home.
                </p>
                <p>
                  Today, LaptopWorld serves thousands of customers across India, from students
                  buying their first laptop to businesses equipping entire teams. We remain
                  committed to the values we started with: transparency, quality, and service.
                </p>
              </div>
            </div>
            <div className="mt-10 lg:mt-0">
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-100">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 font-bold text-sm">01</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Founded in Satara</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Born out of a real customer problem in Maharashtra's tech retail scene.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-purple-600 font-bold text-sm">02</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Multi-Vendor Platform</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        We onboarded 50+ verified vendors to bring competitive pricing and wider selection.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-green-600 font-bold text-sm">03</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Pan-India Delivery</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Expanded logistics to serve customers in 100+ cities across India.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">What We Stand For</h2>
            <p className="mt-3 text-gray-500 max-w-xl mx-auto">
              These aren't just words on a page — they're the principles that shape every
              decision we make at LaptopWorld.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value) => (
              <div key={value.title} className="card p-6">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                  {value.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{value.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team / People */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">The People Behind LaptopWorld</h2>
            <p className="mt-3 text-gray-500 max-w-xl mx-auto">
              A passionate team dedicated to making your laptop-buying experience seamless.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member) => (
              <div key={member.name} className="card p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900">{member.name}</h3>
                <p className="text-sm text-blue-600 mb-3">{member.role}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Have Questions?</h2>
          <p className="text-blue-100 mb-8 max-w-xl mx-auto">
            Our team is available to help you pick the right product or resolve any concern.
            Reach out — we'd love to hear from you.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/contact"
              className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors shadow-lg"
            >
              Get in Touch
            </Link>
            <a
              href="mailto:sagarcomputersatara@gmail.com"
              className="px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition-colors"
            >
              sagarcomputersatara@gmail.com
            </a>
          </div>
          <p className="mt-6 text-blue-200 text-sm">
            📍 Viswa Naka, Satara, Maharashtra 415001 &nbsp;|&nbsp; 📞 +91 8007486058
          </p>
        </div>
      </section>
    </>
  );
};

export default About;