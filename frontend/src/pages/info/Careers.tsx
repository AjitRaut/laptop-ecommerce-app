import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '@/components/common/SEO';

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
  { label: 'Remote-Friendly', icon: '🏠' },
  { label: 'Health Insurance', icon: '🏥' },
  { label: 'Learning Budget', icon: '📚' },
  { label: 'Flexible Hours', icon: '⏰' },
  { label: 'Team Retreats', icon: '✈️' },
  { label: 'Device Allowance', icon: '💻' },
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

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 text-white">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 text-center">
          <h1 className="text-4xl font-bold sm:text-5xl mb-4">
            Work at{' '}
            <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
              LaptopWorld
            </span>
          </h1>
          <p className="mt-4 text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
            We're a small, fast-moving team building India's most trusted laptop marketplace.
            If you care about craft, customers, and impact — you'll fit right in.
          </p>
        </div>
      </section>

      {/* Perks */}
      <section className="bg-white py-14">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">Why Join Us?</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
            {perks.map((perk) => (
              <div key={perk.label} className="card p-5 text-center">
                <div className="text-3xl mb-2">{perk.icon}</div>
                <p className="text-sm font-medium text-gray-700">{perk.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Roles */}
      <section className="bg-gray-50 py-14">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Open Positions</h2>
          <p className="text-gray-500 mb-8">
            Don't see a role that fits? Email us at{' '}
            <a href="mailto:sagarcomputersatara@gmail.com" className="text-blue-600 hover:underline">
              sagarcomputersatara@gmail.com
            </a>{' '}
            with your resume.
          </p>

          <div className="space-y-4">
            {openings.map((job, idx) => (
              <div key={job.title} className="card overflow-hidden">
                <button
                  className="w-full text-left px-6 py-5 flex items-center justify-between"
                  onClick={() => setOpenJob(openJob === idx ? null : idx)}
                >
                  <div>
                    <h3 className="font-semibold text-gray-900">{job.title}</h3>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                        {job.department}
                      </span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                        {job.type}
                      </span>
                      <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">
                        {job.location}
                      </span>
                    </div>
                  </div>
                  <svg
                    className={`h-5 w-5 text-gray-400 transition-transform ${openJob === idx ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openJob === idx && (
                  <div className="px-6 pb-6 border-t border-gray-100">
                    <p className="text-gray-600 mt-4 leading-relaxed">{job.description}</p>
                    <a
                      href={`mailto:sagarcomputersatara@gmail.com?subject=Application for ${job.title}`}
                      className="btn-primary inline-flex mt-4 text-sm"
                    >
                      Apply for this Role
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-14">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Don't See the Right Role?</h2>
          <p className="text-blue-100 mb-6">
            We're always looking for talented people. Send us your profile and we'll be in touch.
          </p>
          <a
            href="mailto:sagarcomputersatara@gmail.com?subject=Open Application – LaptopWorld"
            className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors shadow-lg inline-block"
          >
            Send Open Application
          </a>
        </div>
      </section>
    </>
  );
};

export default Careers;