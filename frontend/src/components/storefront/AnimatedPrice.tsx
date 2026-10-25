import React, { useLayoutEffect, useRef } from 'react';
import { animate, useReducedMotion } from 'framer-motion';
import { clsx } from 'clsx';
import { formatPrice } from '@/utils/formatters';

interface AnimatedPriceProps {
  value: number;
  className?: string;
  /** Count up from a lower value the first time it renders. */
  countUpOnMount?: boolean;
  format?: (value: number) => string;
}

/**
 * Tweens between price values by writing straight to the DOM node (one React
 * render per value change, not per frame). Screen readers get the final value
 * from a visually hidden copy.
 */
const AnimatedPrice: React.FC<AnimatedPriceProps> = ({
  value,
  className,
  countUpOnMount = false,
  format = formatPrice,
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const previous = useRef<number | null>(null);
  const reduceMotion = useReducedMotion();

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;
    const from = previous.current ?? (countUpOnMount ? value * 0.82 : value);
    previous.current = value;

    if (reduceMotion || from === value) {
      node.textContent = format(value);
      return;
    }

    node.textContent = format(from);
    const controls = animate(from, value, {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (latest) => {
        node.textContent = format(latest);
      },
    });
    return () => controls.stop();
  }, [value, reduceMotion, countUpOnMount, format]);

  return (
    <span className={clsx('tabular-nums', className)}>
      <span ref={ref} aria-hidden="true" />
      <span className="sr-only">{format(value)}</span>
    </span>
  );
};

export default AnimatedPrice;
