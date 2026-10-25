import React, { useRef, useState } from 'react';
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'framer-motion';
import { ArrowsRightLeftIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import ProductImage from './ProductImage';

interface ImageStageProps {
  images: string[];
  alt: string;
  label?: string;
  /** Receives the stage element so add-to-cart can fly from it. */
  stageRef?: React.Ref<HTMLDivElement>;
}

const SWIPE_THRESHOLD = 70;
const MAX_DRAG_ROTATION = 50;

/**
 * Turntable-style product stage: drag (mouse or touch) to spin the image in 3D;
 * past a threshold it turns to the next/previous image. Arrow keys and the
 * thumbnails do the same. With reduced motion it simply cross-fades.
 */
const ImageStage: React.FC<ImageStageProps> = ({ images, alt, label, stageRef }) => {
  const [index, setIndex] = useState(0);
  const rotateY = useMotionValue(0);
  const shadowScale = useTransform(rotateY, [-90, 0, 90], [0.55, 1, 0.55]);
  const reduceMotion = useReducedMotion();
  const drag = useRef<{ startX: number; pointerId: number } | null>(null);
  const multiple = images.length > 1;

  const spinTo = async (nextIndex: number, direction: 1 | -1) => {
    const target = (nextIndex + images.length) % images.length;
    if (reduceMotion || !multiple) {
      setIndex(target);
      animate(rotateY, 0, { type: 'spring', stiffness: 260, damping: 22 });
      return;
    }
    await animate(rotateY, -90 * direction, { duration: 0.22, ease: 'easeIn' });
    setIndex(target);
    rotateY.set(90 * direction);
    animate(rotateY, 0, { type: 'spring', stiffness: 220, damping: 24 });
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    // Capturing a press that began on a nav button would swallow its click.
    if (reduceMotion || (event.target as HTMLElement).closest('button')) return;
    drag.current = { startX: event.clientX, pointerId: event.pointerId };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current || drag.current.pointerId !== event.pointerId) return;
    const dx = event.clientX - drag.current.startX;
    rotateY.set(Math.max(-MAX_DRAG_ROTATION, Math.min(MAX_DRAG_ROTATION, dx * 0.4)));
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    const dx = event.clientX - drag.current.startX;
    drag.current = null;
    if (multiple && Math.abs(dx) > SWIPE_THRESHOLD) {
      void spinTo(index + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
    } else {
      animate(rotateY, 0, { type: 'spring', stiffness: 260, damping: 18 });
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      void spinTo(index + 1, 1);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      void spinTo(index - 1, -1);
    }
  };

  return (
    <div>
      <div
        role="group"
        aria-roledescription="carousel"
        aria-label={`${alt} images`}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={clsx(
          'relative select-none overflow-hidden rounded-sf-xl border border-sf-line bg-sf-surface/60 shadow-sf-float [touch-action:pan-y]',
          !reduceMotion && 'cursor-grab active:cursor-grabbing'
        )}
      >
        <div aria-hidden="true" className="sf-grid-bg absolute inset-0 opacity-70" />
        <div aria-hidden="true" className="absolute inset-x-10 top-10 h-1/2 rounded-full bg-sf-gradient opacity-20 blur-3xl" />

        <div className="relative flex aspect-square items-center justify-center p-[8%] [perspective:1200px]">
          <motion.div
            ref={stageRef}
            style={{ rotateY }}
            className="relative w-full max-w-[460px] [transform-style:preserve-3d]"
          >
            <ProductImage
              key={images[index]}
              src={images[index]}
              alt={`${alt}, image ${index + 1} of ${images.length}`}
              label={label}
              eager
              className="aspect-square w-full rounded-sf-lg shadow-sf-float"
              imgClassName="p-[10%]"
            />
          </motion.div>
          {/* Ground shadow narrows as the image turns edge-on */}
          <motion.div
            aria-hidden="true"
            style={{ scaleX: shadowScale }}
            className="absolute bottom-[5%] left-1/2 h-6 w-1/2 -translate-x-1/2 rounded-[50%] bg-black/40 blur-xl"
          />
        </div>

        {multiple && (
          <>
            <button
              type="button"
              onClick={() => void spinTo(index - 1, -1)}
              aria-label="Previous image"
              className="sf-glass absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-sf-ink"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => void spinTo(index + 1, 1)}
              aria-label="Next image"
              className="sf-glass absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-sf-ink"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </>
        )}

        {!reduceMotion && (
          <p className="sf-glass pointer-events-none absolute bottom-4 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full px-3 py-1 text-xs text-sf-muted">
            <ArrowsRightLeftIcon className="h-3.5 w-3.5" />
            Drag to {multiple ? 'turn' : 'rotate'}
          </p>
        )}
        <p className="sr-only" aria-live="polite">
          Image {index + 1} of {images.length}
        </p>
      </div>

      {multiple && (
        <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-5">
          {images.map((image, imageIndex) => (
            <button
              key={`${image}-${imageIndex}`}
              type="button"
              onClick={() => void spinTo(imageIndex, imageIndex > index ? 1 : -1)}
              aria-label={`Show image ${imageIndex + 1}`}
              aria-current={imageIndex === index ? 'true' : undefined}
              className={clsx(
                'overflow-hidden rounded-sf transition-shadow',
                imageIndex === index ? 'ring-2 ring-sf-accent-strong shadow-sf-glow' : 'ring-1 ring-sf-line hover:ring-sf-line-strong'
              )}
            >
              <ProductImage src={image} alt="" label={label} className="aspect-square w-full" imgClassName="p-2" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageStage;
