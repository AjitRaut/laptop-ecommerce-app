import React, { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { clsx } from 'clsx';

interface SectionHeadingProps {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Oversized outline word drifting behind the heading (parallax depth layer). */
  backdrop?: string;
  align?: 'left' | 'center';
  action?: React.ReactNode;
  as?: 'h1' | 'h2';
  className?: string;
}

const SectionHeading: React.FC<SectionHeadingProps> = ({
  eyebrow,
  title,
  description,
  backdrop,
  align = 'left',
  action,
  as: Heading = 'h2',
  className,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const backdropX = useTransform(scrollYProgress, [0, 1], reduceMotion ? ['0%', '0%'] : ['6%', '-6%']);
  const backdropY = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [30, -30]);

  return (
    <div
      ref={ref}
      className={clsx(
        'relative flex flex-col gap-6',
        align === 'center' ? 'items-center text-center' : 'sm:flex-row sm:items-end sm:justify-between',
        className
      )}
    >
      {backdrop && (
        <motion.span
          aria-hidden="true"
          style={{ x: backdropX, y: backdropY }}
          className={clsx(
            'pointer-events-none absolute -top-8 hidden select-none whitespace-nowrap font-display text-[clamp(5rem,11vw,9rem)] font-bold leading-none tracking-tighter text-transparent [-webkit-text-stroke:1px_var(--sf-line-strong)] md:block',
            // framer owns `transform` here, so position with insets rather than translate classes.
            align === 'center' ? 'inset-x-0 text-center' : 'right-0 text-right'
          )}
        >
          {backdrop}
        </motion.span>
      )}
      <div className={clsx('relative max-w-2xl', align === 'center' && 'mx-auto')}>
        {eyebrow && (
          <p className="mb-3 inline-flex items-center gap-2 font-display text-xs font-semibold uppercase tracking-[0.22em] text-sf-accent">
            <span aria-hidden="true" className="h-px w-6 bg-sf-gradient" />
            {eyebrow}
          </p>
        )}
        <Heading className="font-display text-3xl font-semibold tracking-tight text-sf-ink sm:text-4xl lg:text-5xl lg:leading-[1.05]">
          {title}
        </Heading>
        {description && <p className="mt-4 text-base leading-relaxed text-sf-muted sm:text-lg">{description}</p>}
      </div>
      {action && <div className="relative flex-shrink-0">{action}</div>}
    </div>
  );
};

export default SectionHeading;
