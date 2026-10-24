import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '@/components/common/SEO';

const categories = ['All', 'Buying Guides', 'Tips & Tricks', 'News', 'Reviews'];

const posts = [
  {
    slug: 'best-laptops-students-2025',
    category: 'Buying Guides',
    title: 'Best Laptops for Students in 2025',
    excerpt:
      'Tight budget, long battery life, and enough power for assignments — here are our top picks for students across every price range.',
    author: 'LaptopWorld Team',
    date: 'April 12, 2025',
    readTime: '6 min read',
    emoji: '🎓',
  },
  {
    slug: 'gaming-laptop-vs-workstation',
    category: 'Buying Guides',
    title: 'Gaming Laptop vs Workstation: Which One Do You Actually Need?',
    excerpt:
      'Both are powerful, both are expensive — but they serve very different purposes. We break down the key differences so you don\'t overspend.',
    author: 'LaptopWorld Team',
    date: 'March 28, 2025',
    readTime: '8 min read',
    emoji: '🎮',
  },
  {
    slug: 'extend-laptop-battery-life',
    category: 'Tips & Tricks',
    title: '10 Proven Ways to Extend Your Laptop Battery Life',
    excerpt:
      'Stop carrying your charger everywhere. These simple settings tweaks and habits can add hours to your laptop\'s battery life.',
    author: 'LaptopWorld Team',
    date: 'March 10, 2025',
    readTime: '5 min read',
    emoji: '🔋',
  },
  {
    slug: 'laptopworld-launches-pan-india',
    category: 'News',
    title: 'LaptopWorld Now Delivers to 100+ Cities Across India',
    excerpt:
      'We\'re excited to announce pan-India delivery expansion, bringing our curated laptop selection to customers in every corner of the country.',
    author: 'LaptopWorld Team',
    date: 'February 20, 2025',
    readTime: '3 min read',
    emoji: '🚀',
  },
  {
    slug: 'clean-laptop-properly',
    category: 'Tips & Tricks',
    title: 'How to Properly Clean Your Laptop Without Damaging It',
    excerpt:
      'Dust, smudges, and crumbs — your laptop takes a beating. Here\'s the safe, step-by-step way to clean it without voiding your warranty.',
    author: 'LaptopWorld Team',
    date: 'February 5, 2025',
    readTime: '4 min read',
    emoji: '🧹',
  },
  {
    slug: 'ssd-vs-hdd-laptops',
    category: 'Reviews',
    title: 'SSD vs HDD in 2025: Is There Still a Debate?',
    excerpt:
      'Spoiler: SSDs win. But understanding why — and which SSD matters — can save you thousands when buying your next laptop.',
    author: 'LaptopWorld Team',
    date: 'January 18, 2025',
    readTime: '5 min read',
    emoji: '💾',
  },
];

const Blog: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = activeCategory === 'All'
    ? posts
    : posts.filter((p) => p.category === activeCategory);

  const [featured, ...rest] = filtered;

  return (
    <>
      <SEO
        title="Blog"
        description="Laptop buying guides, tips, reviews, and news from the LaptopWorld team."
        keywords="laptop buying guide, laptop tips India, best laptops 2025, LaptopWorld blog"
      />

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 text-white">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 text-center">
          <h1 className="text-4xl font-bold sm:text-5xl mb-4">
            The LaptopWorld{' '}
            <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
              Blog
            </span>
          </h1>
          <p className="mt-4 text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
            Buying guides, tips, reviews, and news to help you get the most out of your laptop.
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="bg-white border-b border-gray-200 sticky top-16 z-30">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex gap-2 overflow-x-auto py-4 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  activeCategory === cat
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">

          {/* Featured Post */}
          {featured && (
            <div className="card p-8 mb-10 lg:flex lg:gap-10 lg:items-center">
              <div className="text-7xl mb-6 lg:mb-0 lg:flex-shrink-0 text-center lg:text-left">
                {featured.emoji}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                    {featured.category}
                  </span>
                  <span className="text-xs text-gray-400">Featured</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3 leading-snug">
                  {featured.title}
                </h2>
                <p className="text-gray-500 text-sm leading-relaxed mb-4">{featured.excerpt}</p>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-400">
                    {featured.date} · {featured.readTime}
                  </div>
                  <span className="text-sm font-medium text-blue-600 hover:underline cursor-pointer">
                    Read more →
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Rest of posts */}
          {rest.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {rest.map((post) => (
                <div key={post.slug} className="card p-6 flex flex-col">
                  <div className="text-4xl mb-4">{post.emoji}</div>
                  <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full self-start mb-3">
                    {post.category}
                  </span>
                  <h3 className="font-semibold text-gray-900 mb-2 leading-snug flex-1">
                    {post.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed mb-4">{post.excerpt}</p>
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                    <span className="text-xs text-gray-400">{post.date} · {post.readTime}</span>
                    <span className="text-sm font-medium text-blue-600 hover:underline cursor-pointer">
                      Read →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {filtered.length === 0 && (
            <div className="text-center py-20 text-gray-400">
              <div className="text-5xl mb-4">📭</div>
              <p className="text-lg font-medium">No posts in this category yet.</p>
              <p className="text-sm mt-1">Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-14">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Stay in the Loop</h2>
          <p className="text-blue-100 mb-6 max-w-md mx-auto">
            Get our latest guides and deals delivered straight to your inbox. No spam, ever.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-2.5 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button className="px-6 py-2.5 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </>
  );
};

export default Blog;