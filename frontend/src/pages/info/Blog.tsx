import React, { useState } from 'react';
import {
  ShoppingBagIcon,
  LightBulbIcon,
  NewspaperIcon,
  StarIcon,
  CalendarDaysIcon,
  ClockIcon,
  InboxIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import SEO from '@/components/common/SEO';
import GlassPanel from '@/components/storefront/GlassPanel';
import StatusPill from '@/components/storefront/StatusPill';
import { TextField } from '@/components/storefront/Field';
import { RevealGroup, RevealItem, Reveal } from '@/components/storefront/Reveal';
import { SfButton } from '@/components/storefront/SfButton';
import { Accent, InfoCta, InfoHero, InfoSection } from '@/components/storefront/InfoPage';
import { container, tintFor, type Tint } from '@/components/storefront/utils';

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

type Post = (typeof posts)[number];

const categoryIcons: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  'Buying Guides': ShoppingBagIcon,
  'Tips & Tricks': LightBulbIcon,
  News: NewspaperIcon,
  Reviews: StarIcon,
};

const coverTints: Record<Tint, string> = {
  accent: 'from-sf-accent-strong/80 via-sf-violet-strong/60 to-sf-cyan/40',
  violet: 'from-sf-violet-strong/80 via-sf-accent-strong/50 to-sf-violet/30',
  cyan: 'from-sf-cyan/70 via-sf-accent-strong/60 to-sf-violet-strong/50',
};

/** Gradient "cover art" tile with the category icon (posts have no images). */
const PostCover: React.FC<{ post: Post; index: number; large?: boolean }> = ({ post, index, large = false }) => {
  const Icon = categoryIcons[post.category] ?? NewspaperIcon;
  return (
    <div
      aria-hidden="true"
      className={clsx(
        'relative flex items-center justify-center overflow-hidden rounded-sf bg-gradient-to-br',
        coverTints[tintFor(index)],
        large ? 'aspect-[4/3] w-full lg:aspect-square lg:w-72 lg:flex-shrink-0' : 'aspect-[16/9] w-full'
      )}
    >
      <div className="sf-grid-bg absolute inset-0 opacity-70" />
      <div className="absolute -right-8 -top-10 h-32 w-32 rounded-full bg-sf-on-accent/20 blur-2xl" />
      <span className={clsx('relative flex items-center justify-center rounded-sf-lg bg-sf-on-accent/15 text-sf-on-accent ring-1 ring-sf-on-accent/30 backdrop-blur', large ? 'h-24 w-24' : 'h-14 w-14')}>
        <Icon className={large ? 'h-12 w-12' : 'h-7 w-7'} />
      </span>
    </div>
  );
};

const PostMeta: React.FC<{ post: Post }> = ({ post }) => (
  <span className="inline-flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-sf-subtle">
    <span className="inline-flex items-center gap-1">
      <CalendarDaysIcon aria-hidden="true" className="h-4 w-4" />
      {post.date}
    </span>
    <span className="inline-flex items-center gap-1">
      <ClockIcon aria-hidden="true" className="h-4 w-4" />
      {post.readTime}
    </span>
  </span>
);

const CONTACT_EMAIL = 'sagarcomputersatara@gmail.com';

const Blog: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  const filtered = activeCategory === 'All'
    ? posts
    : posts.filter((p) => p.category === activeCategory);

  const [featured, ...rest] = filtered;

  // No newsletter endpoint exists: open a prefilled email (same approach as the footer).
  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Please enter a valid email address.');
      return;
    }
    setEmailError('');
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Blog newsletter subscription')}&body=${encodeURIComponent(
      `Please subscribe ${email} to the LaptopWorld blog.`
    )}`;
  };

  return (
    <>
      <SEO
        title="Blog"
        description="Laptop buying guides, tips, reviews, and news from the LaptopWorld team."
        keywords="laptop buying guide, laptop tips India, best laptops 2025, LaptopWorld blog"
      />

      <InfoHero
        eyebrow="Blog"
        title={
          <>
            The LaptopWorld <Accent>Blog</Accent>
          </>
        }
        subtitle="Buying guides, tips, reviews, and news to help you get the most out of your laptop."
      />

      {/* Category Filter */}
      <div className="sticky top-[62px] z-30">
        <div className={container}>
          <div
            role="group"
            aria-label="Filter posts by category"
            className="sf-glass flex gap-2 overflow-x-auto rounded-full p-1.5 shadow-sf-card [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                aria-pressed={activeCategory === cat}
                onClick={() => setActiveCategory(cat)}
                className={clsx(
                  'whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors',
                  activeCategory === cat
                    ? 'bg-sf-gradient text-sf-on-accent shadow-sf-glow'
                    : 'text-sf-muted hover:bg-sf-surface-2 hover:text-sf-ink'
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <InfoSection className="pt-10 sm:pt-12" labelledBy="blog-posts">
        <h2 id="blog-posts" className="sr-only">
          {activeCategory === 'All' ? 'All posts' : `${activeCategory} posts`}
        </h2>

        {/* Featured Post */}
        {featured && (
          <Reveal key={`featured-${featured.slug}`}>
            <GlassPanel as="article" glow className="mb-10 flex flex-col gap-8 p-5 sm:p-8 lg:flex-row lg:items-center">
              <PostCover post={featured} index={0} large />
              <div className="flex-1">
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <StatusPill tone="accent">{featured.category}</StatusPill>
                  <StatusPill tone="violet" dot>
                    Featured
                  </StatusPill>
                </div>
                <h3 className="font-display text-2xl font-semibold leading-snug tracking-tight text-sf-ink sm:text-3xl">
                  {featured.title}
                </h3>
                <p className="mt-3 text-base leading-relaxed text-sf-muted">{featured.excerpt}</p>
                <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                  <PostMeta post={featured} />
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-sf-accent">
                    Read more <ArrowRightIcon aria-hidden="true" className="h-4 w-4" />
                  </span>
                </div>
              </div>
            </GlassPanel>
          </Reveal>
        )}

        {/* Rest of posts */}
        {rest.length > 0 && (
          <RevealGroup key={activeCategory} className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((post, index) => (
              <RevealItem key={post.slug} className="h-full">
                <GlassPanel as="article" padded={false} className="flex h-full flex-col p-4 transition-colors hover:border-sf-accent/40">
                  <PostCover post={post} index={index + 1} />
                  <div className="flex flex-1 flex-col px-1 pt-5">
                    <StatusPill tone="neutral" className="self-start">
                      {post.category}
                    </StatusPill>
                    <h3 className="mt-3 flex-1 font-display text-lg font-semibold leading-snug text-sf-ink">{post.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-sf-muted">{post.excerpt}</p>
                    <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-sf-line pt-4">
                      <PostMeta post={post} />
                      <span className="inline-flex items-center gap-1 text-sm font-medium text-sf-accent">
                        Read <ArrowRightIcon aria-hidden="true" className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </GlassPanel>
              </RevealItem>
            ))}
          </RevealGroup>
        )}

        {filtered.length === 0 && (
          <div className="py-20 text-center">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-sf-lg bg-sf-surface-2 text-sf-subtle ring-1 ring-sf-line">
              <InboxIcon aria-hidden="true" className="h-8 w-8" />
            </span>
            <p className="mt-5 font-display text-lg font-semibold text-sf-ink">No posts in this category yet.</p>
            <p className="mt-1 text-sm text-sf-muted">Check back soon!</p>
          </div>
        )}
      </InfoSection>

      {/* Newsletter */}
      <InfoCta title="Stay in the Loop">
        <p>Get our latest guides and deals delivered straight to your inbox. No spam, ever.</p>
        <form onSubmit={handleSubscribe} noValidate className="mx-auto mt-6 flex max-w-md flex-col gap-3 text-left sm:flex-row sm:items-start">
          <TextField
            id="blog-newsletter"
            type="email"
            aria-label="Email address"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={emailError}
            wrapperClassName="flex-1"
          />
          <SfButton type="submit" size="lg" className="flex-shrink-0">
            Subscribe
          </SfButton>
        </form>
      </InfoCta>
    </>
  );
};

export default Blog;
