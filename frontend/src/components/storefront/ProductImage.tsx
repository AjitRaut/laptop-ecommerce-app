import React from 'react';
import { clsx } from 'clsx';
import LazyImage from '@/components/common/LazyImage';
import CssLaptop from './CssLaptop';

interface ProductImageProps {
  src?: string | null;
  alt: string;
  /** Shown on the placeholder's screen when there is no photo. */
  label?: string;
  className?: string;
  imgClassName?: string;
  eager?: boolean;
}

/**
 * Product photos are small, white-background JPEGs (often shared between
 * products). They sit on a lit "studio plate" with multiply blending so the
 * white drops out in both themes; missing/broken photos get a CSS laptop.
 */
const ProductImage: React.FC<ProductImageProps> = ({ src, alt, label, className, imgClassName, eager = false }) => {
  const placeholder = (
    <div className="flex h-full w-full items-center justify-center p-[12%]">
      <CssLaptop size="sm" label={label} />
    </div>
  );

  return (
    <div className={clsx('relative overflow-hidden bg-sf-plate', className)}>
      {src ? (
        <LazyImage
          src={src}
          alt={alt}
          loading={eager ? 'eager' : 'lazy'}
          fallback={placeholder}
          containerClassName="h-full w-full"
          className={clsx('h-full w-full object-contain mix-blend-multiply', imgClassName)}
        />
      ) : (
        placeholder
      )}
      {/* Soft top light + floor shadow for depth */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white/40 to-transparent" />
    </div>
  );
};

export default ProductImage;
