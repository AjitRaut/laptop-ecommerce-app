import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import {
  ArrowRightIcon,
  TruckIcon,
  ShieldCheckIcon,
  ChatBubbleLeftRightIcon,
  ArrowPathIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import { useGetBrandsQuery, useGetCategoriesQuery, useGetFeaturedProductsQuery } from '@/store/api/productsApi';
import ProductGrid from '@/components/common/ProductGrid';
import SEO from '@/components/common/SEO';
import HeroLaptop from '@/components/storefront/hero/HeroLaptop';
import CssLaptop from '@/components/storefront/CssLaptop';
import SectionHeading from '@/components/storefront/SectionHeading';
import { SfLinkButton } from '@/components/storefront/SfButton';
import { Reveal, RevealGroup, RevealItem } from '@/components/storefront/Reveal';
import { ExtrudedCard, IsoCube } from '@/components/storefront/Extruded';
import { Skeleton } from '@/components/storefront/Skeleton';
import { categoryBlurb, categoryIcon } from '@/components/storefront/categoryVisuals';
import { container, initials } from '@/components/storefront/utils';

const features = [
  {
    name: 'Free Shipping',
    description: 'Free shipping on orders over ₹10,000. Fast and reliable delivery across India.',
    icon: TruckIcon,
  },
  {
    name: 'Extended Warranty',
    description: 'Comprehensive warranty support and extended coverage on all products.',
    icon: ShieldCheckIcon,
  },
  {
    name: '24/7 Support',
    description: 'Round the clock customer support for all your queries and concerns.',
    icon: ChatBubbleLeftRightIcon,
  },
  {
    name: 'Easy Returns',
    description: '30-day hassle-free returns and exchange policy for your peace of mind.',
    icon: ArrowPathIcon,
  },
];

const homeSchema = {
  '@context': 'https://schema.org',
  '@type': 'Store',
  name: 'LaptopWorld',
  description: 'Premium laptops and accessories',
  email: 'sagarcomputersatara@gmail.com',
  telephone: '+91 8007486058',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Viswa Naka',
    addressLocality: 'Satara',
    addressRegion: 'Maharashtra',
    postalCode: '415001',
    addressCountry: 'IN',
  },
};

const Home: React.FC = () => {
  const { data: featuredProducts, isLoading, error } = useGetFeaturedProductsQuery();
  const { data: categories, isLoading: categoriesLoading } = useGetCategoriesQuery();
  const { data: brands, isLoading: brandsLoading } = useGetBrandsQuery();
  const reduceMotion = useReducedMotion();

  // Hero parallax: text drifts up and fades, background orbs move at their own pace.
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const textY = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [0, 140]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const orbY = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [0, -180]);
  const visualY = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [0, 60]);

  // CTA parallax
  const ctaRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: ctaProgress } = useScroll({ target: ctaRef, offset: ['start end', 'end start'] });
  const ctaLaptopY = useTransform(ctaProgress, [0, 1], reduceMotion ? [0, 0] : [60, -60]);

  return (
    <>
      <SEO
        title="Premium Laptops & Accessories"
        description="Discover the latest laptops and accessories from top brands at LaptopWorld, Satara. Gaming, business and ultrabook laptops with free shipping over ₹10,000."
        keywords="laptops, gaming laptops, business laptops, ultrabooks, laptop accessories, Satara laptop store"
        schema={homeSchema}
      />

      {/* ───────────── Hero ───────────── */}
      <section ref={heroRef} className="relative isolate overflow-hidden">
        <motion.div aria-hidden="true" style={{ y: orbY }} className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-40 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,var(--sf-mesh-a),transparent)]" />
          <div className="absolute right-[-10rem] top-24 h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(closest-side,var(--sf-mesh-b),transparent)]" />
        </motion.div>

        <div className={clsx(container, 'grid grid-cols-1 items-center gap-10 pb-16 pt-10 sm:pt-16 lg:grid-cols-12 lg:gap-6 lg:pb-24 lg:pt-20')}>
          <motion.div style={{ y: textY, opacity: textOpacity }} className="relative lg:col-span-6">
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="sf-glass inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium text-sf-muted"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sf-accent opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-sf-accent" />
              </span>
              Premium Laptops &amp; Accessories · Satara, Maharashtra
            </motion.p>

            {/* Explicit lines: the fallback and display fonts wrap identically, so the
                web-font swap can't reflow the hero (it caused a 0.15 layout shift). */}
            <h1 className="mt-6 font-display text-[clamp(2.75rem,7vw,5.75rem)] font-semibold leading-[0.95] tracking-[-0.045em] text-sf-ink">
              <span className="block whitespace-nowrap">Find your</span>
              <span className="block whitespace-nowrap">perfect</span>
              <span className="sf-gradient-text block whitespace-nowrap">laptop.</span>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="mt-6 max-w-xl text-lg leading-relaxed text-sf-muted"
            >
              Discover the latest laptops and accessories from top brands. Professional laptops, gaming machines, and
              everything in between with unbeatable prices.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="mt-9 flex flex-col gap-3 sm:flex-row"
            >
              <SfLinkButton to="/products" size="xl" rightIcon={<ArrowRightIcon className="h-5 w-5" />}>
                Shop Now
              </SfLinkButton>
              <SfLinkButton to="/products?category=gaming" variant="secondary" size="xl">
                Gaming Laptops
              </SfLinkButton>
            </motion.div>

            <motion.ul
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.35 }}
              className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm text-sf-muted"
            >
              <li className="inline-flex items-center gap-2">
                <TruckIcon className="h-4 w-4 text-sf-accent" /> Free shipping over ₹10,000
              </li>
              <li className="inline-flex items-center gap-2">
                <ArrowPathIcon className="h-4 w-4 text-sf-accent" /> 30-day returns
              </li>
              <li className="inline-flex items-center gap-2">
                <MapPinIcon className="h-4 w-4 text-sf-accent" /> Delivered across India
              </li>
            </motion.ul>
          </motion.div>

          <motion.div style={{ y: visualY }} className="relative lg:col-span-6">
            <HeroLaptop progress={scrollYProgress} className="mx-auto max-w-[620px]" />
          </motion.div>
        </div>
      </section>

      {/* ───────────── Trust strip ───────────── */}
      <section aria-label="Why shop with us" className={container}>
        <RevealGroup
          as="dl"
          className="sf-glass grid grid-cols-1 divide-y divide-sf-line rounded-sf-xl shadow-sf-card sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x"
        >
          {features.map((feature) => (
            // dt/dd must be direct children of this group div, so the icon lives inside the dt.
            <RevealItem key={feature.name} className="relative p-6 pl-[4.75rem]">
              <dt className="font-display text-base font-semibold text-sf-ink">
                <span className="absolute left-6 top-6 flex h-11 w-11 items-center justify-center rounded-sf bg-sf-gradient text-sf-on-accent shadow-sf-glow">
                  <feature.icon aria-hidden="true" className="h-5 w-5" />
                </span>
                {feature.name}
              </dt>
              <dd className="mt-1 text-sm leading-relaxed text-sf-muted">{feature.description}</dd>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      {/* ───────────── Categories ───────────── */}
      <section aria-labelledby="home-categories" className={clsx(container, 'pt-28')}>
        <SectionHeading
          eyebrow="Shop by category"
          title={<span id="home-categories">Built for every kind of work.</span>}
          description="From high-refresh gaming rigs to featherweight ultrabooks, find the machine that fits how you work and play."
          backdrop="Categories"
          action={
            <Link to="/products" className="inline-flex items-center gap-1.5 text-sm font-semibold text-sf-accent hover:gap-2.5 transition-[gap]">
              Browse all categories <ArrowRightIcon className="h-4 w-4" />
            </Link>
          }
        />
        <RevealGroup className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {categoriesLoading
            ? Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-72 rounded-sf-xl" />)
            : categories?.results?.map((category, index) => {
                const Icon = categoryIcon(category.name);
                return (
                  <RevealItem key={category.id} className="h-full">
                    <Link to={`/products?category=${category.id}`} className="group block h-full rounded-sf-xl">
                      <ExtrudedCard faceClassName="flex flex-col p-6">
                        {/* Decorative index drawn via CSS content: not text, so not read or contrast-checked */}
                        <span
                          aria-hidden="true"
                          data-index={String(index + 1).padStart(2, '0')}
                          className="absolute right-6 top-5 font-display text-5xl font-semibold text-sf-line-strong before:content-[attr(data-index)]"
                        />
                        <IsoCube icon={Icon} />
                        <h3 className="mt-6 font-display text-xl font-semibold text-sf-ink">{category.name}</h3>
                        <p className="mt-2 flex-1 text-sm leading-relaxed text-sf-muted">
                          {categoryBlurb(category.name, category.description)}
                        </p>
                        <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-sf-accent">
                          Explore <ArrowRightIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                        </span>
                      </ExtrudedCard>
                    </Link>
                  </RevealItem>
                );
              })}
        </RevealGroup>
      </section>

      {/* ───────────── Featured products ───────────── */}
      <section aria-labelledby="home-featured" className={clsx(container, 'pt-28')}>
        <SectionHeading
          eyebrow="Featured"
          title={<span id="home-featured">This season&apos;s standouts.</span>}
          description="Hand-picked machines and accessories our customers love right now."
          backdrop="Featured"
          action={
            <Link to="/products" className="inline-flex items-center gap-1.5 text-sm font-semibold text-sf-accent hover:gap-2.5 transition-[gap]">
              Browse all products <ArrowRightIcon className="h-4 w-4" />
            </Link>
          }
        />
        <div className="mt-12">
          <ProductGrid
            products={featuredProducts?.slice(0, 8) ?? []}
            isLoading={isLoading}
            error={error}
            skeletonCount={6}
            columns="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            emptyStateProps={{
              title: 'No featured products yet',
              description: 'Check back soon, or browse the full catalogue.',
              action: <SfLinkButton to="/products">Browse products</SfLinkButton>,
            }}
          />
        </div>
      </section>

      {/* ───────────── Brands ───────────── */}
      <section aria-labelledby="home-brands" className={clsx(container, 'pt-28')}>
        <SectionHeading
          eyebrow="Shop by brand"
          title={<span id="home-brands">The names you trust.</span>}
          description="Genuine products from the brands that define modern computing."
          backdrop="Brands"
        />
        <RevealGroup className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
          {brandsLoading
            ? Array.from({ length: 6 }, (_, index) => <Skeleton key={index} className="h-36 rounded-sf-xl" />)
            : brands?.results?.map((brand) => (
                <RevealItem key={brand.id} className="h-full">
                  <Link to={`/products?brand=${brand.id}`} className="group block h-full rounded-sf-xl">
                    <ExtrudedCard faceClassName="relative flex h-36 flex-col items-center justify-center overflow-hidden p-4 text-center">
                      <span
                        aria-hidden="true"
                        data-initials={initials(brand.name)}
                        className="absolute -bottom-4 -right-2 font-display text-7xl font-bold text-sf-surface-2 transition-transform duration-500 before:content-[attr(data-initials)] group-hover:-translate-y-1"
                      />
                      <span className="relative font-display text-xl font-semibold tracking-tight text-sf-ink">{brand.name}</span>
                      <span className="relative mt-1 text-xs text-sf-subtle transition-colors group-hover:text-sf-accent">
                        View products
                      </span>
                    </ExtrudedCard>
                  </Link>
                </RevealItem>
              ))}
        </RevealGroup>
      </section>

      {/* ───────────── CTA ───────────── */}
      <section aria-labelledby="home-cta" className={clsx(container, 'pt-28')}>
        <Reveal>
          <div
            ref={ctaRef}
            className="sf-gradient-border relative isolate overflow-hidden rounded-sf-xl bg-sf-surface/70 px-6 py-14 shadow-sf-float sm:px-12 lg:px-16"
          >
            <div aria-hidden="true" className="absolute inset-0 -z-10">
              <div className="absolute -left-20 -top-24 h-80 w-80 rounded-full bg-[radial-gradient(closest-side,var(--sf-mesh-a),transparent)]" />
              <div className="absolute -bottom-24 right-0 h-96 w-96 rounded-full bg-[radial-gradient(closest-side,var(--sf-mesh-b),transparent)]" />
              <div className="sf-grid-bg absolute inset-0 opacity-60" />
            </div>
            <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <h2 id="home-cta" className="font-display text-3xl font-semibold tracking-tight text-sf-ink sm:text-5xl">
                  Ready to find your <span className="sf-gradient-text">perfect laptop?</span>
                </h2>
                <p className="mt-5 max-w-xl text-lg leading-relaxed text-sf-muted">
                  Browse our extensive collection of premium laptops and accessories from top brands with competitive
                  pricing.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <SfLinkButton to="/products" size="lg" rightIcon={<ArrowRightIcon className="h-5 w-5" />}>
                    Start Shopping
                  </SfLinkButton>
                  <SfLinkButton to="/contact" variant="secondary" size="lg">
                    Talk to us
                  </SfLinkButton>
                </div>
              </div>
              <motion.div style={{ y: ctaLaptopY }} className="hidden lg:col-span-5 lg:block">
                <CssLaptop float className="max-w-sm" />
              </motion.div>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
};

export default Home;
