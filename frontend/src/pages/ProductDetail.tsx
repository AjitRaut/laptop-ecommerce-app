import React, { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  HeartIcon,
  ShoppingBagIcon,
  ShareIcon,
  CheckIcon,
  TruckIcon,
  ShieldCheckIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import { useGetProductQuery, useGetProductsQuery } from '@/store/api/productsApi';
import { useAddToCartMutation, useAddToWishlistMutation } from '@/store/api/ordersApi';
import { useAuth } from '@/hooks/useAuth';
import { formatPrice } from '@/utils/formatters';
import EmptyState from '@/components/common/EmptyState';
import ProductGrid from '@/components/common/ProductGrid';
import QuantitySelector from '@/components/common/QuantitySelector';
import SEO from '@/components/common/SEO';
import ImageStage from '@/components/storefront/ImageStage';
import AnimatedPrice from '@/components/storefront/AnimatedPrice';
import GlassPanel from '@/components/storefront/GlassPanel';
import SectionHeading from '@/components/storefront/SectionHeading';
import StatusPill from '@/components/storefront/StatusPill';
import { SfButton, SfLinkButton } from '@/components/storefront/SfButton';
import { Skeleton } from '@/components/storefront/Skeleton';
import { useCartFly } from '@/components/storefront/CartFly';
import { container, productRelation, toNumber } from '@/components/storefront/utils';

const ProductDetailSkeleton: React.FC = () => (
  <div className={clsx(container, 'pt-8')} role="status" aria-label="Loading product">
    <Skeleton className="h-4 w-64" />
    <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-12">
      <Skeleton className="aspect-square w-full rounded-sf-xl lg:col-span-7" />
      <div className="space-y-5 lg:col-span-5">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-12 w-4/5" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-28 w-full rounded-sf-lg" />
        <Skeleton className="h-12 w-full rounded-full" />
      </div>
    </div>
  </div>
);

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const { flyToCart } = useCartFly();
  const stageRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const [ctaVisible, setCtaVisible] = useState(true);

  const { data: product, isLoading, error } = useGetProductQuery(Number(id));
  const [addToCart, { isLoading: isAddingToCart }] = useAddToCartMutation();
  const [addToWishlist, { isLoading: isAddingToWishlist }] = useAddToWishlistMutation();

  // The detail endpoint nests brand/category objects; list endpoints send ids + *_name.
  const category = productRelation(product?.category, product?.category_name);
  const brand = productRelation(product?.brand, product?.brand_name);

  const { data: related, isLoading: relatedLoading } = useGetProductsQuery(
    { category: category?.id ?? '', page: 1 },
    { skip: !category }
  );
  const relatedProducts = (related?.results ?? []).filter((item) => item.id !== product?.id).slice(0, 4);

  // Mobile: show a sticky add-to-cart bar once the main button scrolls away.
  useEffect(() => {
    const element = ctaRef.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => setCtaVisible(entry.isIntersecting));
    observer.observe(element);
    return () => observer.disconnect();
  }, [product]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return;
    }

    try {
      await addToCart({ product_id: Number(id), quantity }).unwrap();
      flyToCart(stageRef.current, product?.images?.[0]?.image ?? product?.primary_image);
      toast.success('Added to cart!');
    } catch (error) {
      toast.error('Failed to add to cart');
    }
  };

  const handleAddToWishlist = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to wishlist');
      return;
    }

    try {
      await addToWishlist(Number(id)).unwrap();
      toast.success('Added to wishlist!');
    } catch (error) {
      toast.error('Failed to add to wishlist');
    }
  };

  const handleShare = async () => {
    if (navigator.share && product) {
      try {
        await navigator.share({
          title: product.name,
          text: product.short_description || product.description,
          url: window.location.href,
        });
      } catch (error) {
        // Fallback to clipboard
        navigator.clipboard.writeText(window.location.href);
        toast.success('Product link copied to clipboard');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Product link copied to clipboard');
    }
  };

  if (isLoading) {
    return <ProductDetailSkeleton />;
  }

  if (error || !product) {
    return (
      <div className={clsx(container, 'flex min-h-[70vh] items-center justify-center')}>
        <SEO title="Product not found" />
        <EmptyState
          headingLevel="h1"
          illustration="search"
          title="Product not found"
          description="The product you're looking for doesn't exist."
          action={<SfLinkButton to="/products">Browse Products</SfLinkButton>}
        />
      </div>
    );
  }

  const images =
    product.images && product.images.length > 0
      ? product.images.map((img) => img.image)
      : product.primary_image
        ? [product.primary_image]
        : [];

  const price = toNumber(product.discounted_price);
  const originalPrice = toNumber(product.price);
  const discount = toNumber(product.discount_percentage);
  const savings = originalPrice - price;
  const maxQuantity = product.stock_quantity > 0 ? Math.min(10, product.stock_quantity) : 10;

  const features = [
    { icon: TruckIcon, title: 'Free shipping', text: 'On orders over ₹10,000' },
    { icon: ShieldCheckIcon, title: `${product.warranty_months} months`, text: 'Manufacturer warranty' },
    { icon: CheckIcon, title: '30-day returns', text: 'Hassle-free policy' },
  ];

  const stock = !product.is_in_stock
    ? { tone: 'neutral' as const, label: 'Out of stock' }
    : product.is_low_stock
      ? { tone: 'warning' as const, label: `Only ${product.stock_quantity} left` }
      : { tone: 'success' as const, label: 'In stock' };

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.short_description || product.description,
    sku: product.sku,
    image: images,
    brand: brand?.name ? { '@type': 'Brand', name: brand.name } : undefined,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'INR',
      price: price.toFixed(2),
      availability: product.is_in_stock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
  };

  return (
    <div className={clsx(container, 'pt-6 sm:pt-10')}>
      <SEO
        title={product.name}
        description={product.short_description || product.description}
        image={images[0]}
        type="product"
        schema={productSchema}
      />

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-1.5 text-sm text-sf-subtle">
          <li>
            <Link to="/" className="hover:text-sf-ink">
              Home
            </Link>
          </li>
          <ChevronRightIcon aria-hidden="true" className="h-3.5 w-3.5" />
          <li>
            <Link to="/products" className="hover:text-sf-ink">
              Products
            </Link>
          </li>
          {category?.name && (
            <>
              <ChevronRightIcon aria-hidden="true" className="h-3.5 w-3.5" />
              <li>
                <Link to={`/products?category=${category.id}`} className="hover:text-sf-ink">
                  {category.name}
                </Link>
              </li>
            </>
          )}
          <ChevronRightIcon aria-hidden="true" className="h-3.5 w-3.5" />
          <li aria-current="page" className="max-w-[16rem] truncate text-sf-muted">
            {product.name}
          </li>
        </ol>
      </nav>

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
        {/* Gallery */}
        <div className="lg:col-span-7">
          <div className="lg:sticky lg:top-24">
            <ImageStage images={images} alt={product.name} label={brand?.name || product.name} stageRef={stageRef} />
          </div>
        </div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-5"
        >
          <div className="flex flex-wrap gap-2">
            {product.is_featured && <StatusPill tone="violet">Featured</StatusPill>}
            {discount > 0 && <StatusPill tone="accent">{Math.round(discount)}% off</StatusPill>}
            <StatusPill tone={stock.tone} dot>
              {stock.label}
            </StatusPill>
          </div>

          {brand?.name && (
            <Link
              to={`/products?brand=${brand.id}`}
              className="mt-5 inline-block text-sm font-semibold uppercase tracking-[0.16em] text-sf-accent hover:underline"
            >
              {brand.name}
            </Link>
          )}
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-sf-ink sm:text-4xl lg:text-5xl lg:leading-[1.05]">
            {product.name}
          </h1>
          {product.short_description && (
            <p className="mt-4 text-base leading-relaxed text-sf-muted">{product.short_description}</p>
          )}

          {/* Price + purchase */}
          <GlassPanel glow className="mt-8">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <AnimatedPrice
                value={price}
                countUpOnMount
                className="font-display text-4xl font-semibold tracking-tight text-sf-ink"
              />
              {discount > 0 && (
                <span className="text-lg tabular-nums text-sf-subtle line-through">{formatPrice(product.price)}</span>
              )}
            </div>
            {discount > 0 && savings > 0 && (
              <p className="mt-2 text-sm font-medium text-sf-success">
                You save {formatPrice(savings)} ({Math.round(discount)}%)
              </p>
            )}

            <div ref={ctaRef} className="mt-6 flex flex-wrap items-center gap-3">
              <QuantitySelector
                quantity={quantity}
                onQuantityChange={setQuantity}
                max={maxQuantity}
                disabled={!product.is_in_stock}
                label={`Quantity for ${product.name}`}
              />
              <SfButton
                onClick={handleAddToCart}
                loading={isAddingToCart}
                disabled={!product.is_in_stock}
                size="lg"
                className="min-w-[10rem] flex-1"
                leftIcon={<ShoppingBagIcon className="h-5 w-5" />}
              >
                {product.is_in_stock ? 'Add to Cart' : 'Out of Stock'}
              </SfButton>
            </div>
            <div className="mt-3 flex gap-2">
              <SfButton
                variant="outline"
                onClick={handleAddToWishlist}
                loading={isAddingToWishlist}
                className="flex-1"
                leftIcon={<HeartIcon className="h-5 w-5" />}
              >
                Wishlist
              </SfButton>
              <SfButton variant="ghost" onClick={handleShare} leftIcon={<ShareIcon className="h-5 w-5" />}>
                Share
              </SfButton>
            </div>
          </GlassPanel>

          {/* Assurance */}
          <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {features.map((feature) => (
              <li key={feature.title} className="rounded-sf-lg border border-sf-line bg-sf-surface/60 p-4">
                <feature.icon className="h-5 w-5 text-sf-accent" />
                <p className="mt-2 text-sm font-semibold text-sf-ink">{feature.title}</p>
                <p className="text-xs text-sf-subtle">{feature.text}</p>
              </li>
            ))}
          </ul>

          {/* Description */}
          <section aria-labelledby="pd-description" className="mt-10">
            <h2 id="pd-description" className="font-display text-xl font-semibold text-sf-ink">
              Overview
            </h2>
            <p className="mt-3 whitespace-pre-line leading-relaxed text-sf-muted">{product.description}</p>
          </section>

          {/* Meta */}
          <dl className="mt-8 divide-y divide-sf-line rounded-sf-lg border border-sf-line bg-sf-surface/50 text-sm">
            <div className="flex justify-between gap-4 px-4 py-3">
              <dt className="text-sf-subtle">SKU</dt>
              <dd className="font-medium text-sf-ink">{product.sku}</dd>
            </div>
            {category && (
              <div className="flex justify-between gap-4 px-4 py-3">
                <dt className="text-sf-subtle">Category</dt>
                <dd>
                  <Link to={`/products?category=${category.id}`} className="font-medium text-sf-accent hover:underline">
                    {category.name || 'View category'}
                  </Link>
                </dd>
              </div>
            )}
            {brand && (
              <div className="flex justify-between gap-4 px-4 py-3">
                <dt className="text-sf-subtle">Brand</dt>
                <dd>
                  <Link to={`/products?brand=${brand.id}`} className="font-medium text-sf-accent hover:underline">
                    {brand.name || 'View brand'}
                  </Link>
                </dd>
              </div>
            )}
            {product.weight && (
              <div className="flex justify-between gap-4 px-4 py-3">
                <dt className="text-sf-subtle">Weight</dt>
                <dd className="font-medium text-sf-ink">{product.weight} kg</dd>
              </div>
            )}
          </dl>
        </motion.div>
      </div>

      {/* Specifications: cards flip up into place as they scroll in */}
      {product.specifications && product.specifications.length > 0 && (
        <section aria-labelledby="pd-specs" className="pt-24">
          <SectionHeading eyebrow="Specifications" title={<span id="pd-specs">Under the hood.</span>} backdrop="Specs" />
          <dl className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {product.specifications.map((spec, index) => (
              <motion.div
                key={spec.id}
                initial={{ opacity: 0, rotateX: -75, y: 20 }}
                whileInView={{ opacity: 1, rotateX: 0, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.7, delay: (index % 4) * 0.08, ease: [0.22, 1, 0.36, 1] }}
                style={{ transformPerspective: 900, transformOrigin: '50% 0%' }}
                className="sf-card relative overflow-hidden p-5"
              >
                <span aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-sf-gradient" />
                <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-sf-subtle">{spec.spec_name}</dt>
                <dd className="mt-2 font-display text-lg font-semibold text-sf-ink">{spec.spec_value}</dd>
              </motion.div>
            ))}
          </dl>
        </section>
      )}

      {/* Related products */}
      {(relatedLoading || relatedProducts.length > 0) && (
        <section aria-labelledby="pd-related" className="pt-24">
          <SectionHeading
            eyebrow="You may also like"
            title={<span id="pd-related">Related products</span>}
            description="Other products you might be interested in"
          />
          <div className="mt-10">
            <ProductGrid products={relatedProducts} isLoading={relatedLoading} skeletonCount={4} />
          </div>
        </section>
      )}

      {/* Mobile sticky purchase bar */}
      <div
        aria-hidden={ctaVisible}
        className={clsx(
          'sf-glass fixed inset-x-3 bottom-3 z-30 flex items-center gap-3 rounded-full bg-sf-glass-strong p-2 pl-5 shadow-sf-float transition-[transform,opacity] duration-300 lg:hidden',
          ctaVisible ? 'pointer-events-none translate-y-24 opacity-0' : 'translate-y-0 opacity-100'
        )}
      >
        <span className="flex-1 truncate font-display text-lg font-semibold tabular-nums text-sf-ink">
          {formatPrice(product.discounted_price)}
        </span>
        <SfButton
          onClick={handleAddToCart}
          loading={isAddingToCart}
          disabled={!product.is_in_stock}
          tabIndex={ctaVisible ? -1 : 0}
          leftIcon={<ShoppingBagIcon className="h-5 w-5" />}
        >
          {product.is_in_stock ? 'Add to Cart' : 'Out of Stock'}
        </SfButton>
      </div>
    </div>
  );
};

export default ProductDetail;
