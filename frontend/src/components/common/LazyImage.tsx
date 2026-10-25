import React, { useLayoutEffect, useRef, useState } from 'react';
import { clsx } from 'clsx';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  /** Image shown if `src` fails to load (ignored when `fallback` is given). */
  placeholder?: string;
  /** Element rendered instead of the image when it is missing or fails to load. */
  fallback?: React.ReactNode;
  className?: string;
  containerClassName?: string;
}

/**
 * Native lazy-loaded image with a shimmer skeleton while loading, a fade-in on
 * load, and a graceful fallback on error.
 */
const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  placeholder,
  fallback,
  className,
  containerClassName,
  loading = 'lazy',
  decoding = 'async',
  onLoad,
  onError,
  ...props
}) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [failed, setFailed] = useState(!src);
  const [currentSrc, setCurrentSrc] = useState(src);

  // Reset when the source changes (e.g. switching gallery images).
  useLayoutEffect(() => {
    setCurrentSrc(src);
    setFailed(!src);
    const img = imgRef.current;
    setIsLoaded(Boolean(img && img.complete && img.naturalWidth > 0));
  }, [src]);

  const handleError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    if (!fallback && placeholder && currentSrc !== placeholder) {
      setCurrentSrc(placeholder);
    } else {
      setFailed(true);
    }
    onError?.(event);
  };

  if (failed && fallback) {
    return <div className={clsx('relative overflow-hidden', containerClassName)}>{fallback}</div>;
  }

  return (
    <div className={clsx('relative overflow-hidden', containerClassName)}>
      {!isLoaded && <div aria-hidden="true" className="sf-skeleton absolute inset-0" />}
      <img
        ref={imgRef}
        src={currentSrc}
        alt={alt}
        loading={loading}
        decoding={decoding}
        className={clsx('transition-opacity duration-500', isLoaded ? 'opacity-100' : 'opacity-0', className)}
        onLoad={(event) => {
          setIsLoaded(true);
          onLoad?.(event);
        }}
        onError={handleError}
        {...props}
      />
    </div>
  );
};

export default LazyImage;
