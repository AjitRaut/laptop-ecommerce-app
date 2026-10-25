import React, { useRef } from 'react';
import { useReducedMotion } from 'framer-motion';
import { clsx } from 'clsx';
import { useFinePointer } from './hooks';

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  /** Classes for the element that actually rotates (put rounded corners here). */
  innerClassName?: string;
  /** Maximum rotation in degrees on each axis. */
  maxTilt?: number;
  glare?: boolean;
  shadow?: boolean;
}

/**
 * Pointer-driven perspective tilt. Pointer position is written to CSS variables
 * (no React re-renders); only `transform`/`opacity` animate. Disabled on touch
 * devices and when the user prefers reduced motion, where the card stays flat.
 * Children can opt into depth with the `sf-depth-1..3` classes.
 */
const TiltCard: React.FC<TiltCardProps> = ({
  children,
  className,
  innerClassName,
  maxTilt = 7,
  glare = true,
  shadow = true,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const frame = useRef(0);
  const finePointer = useFinePointer();
  const reduceMotion = useReducedMotion();
  const enabled = finePointer && !reduceMotion;

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!enabled || event.pointerType !== 'mouse') return;
    const element = ref.current;
    if (!element) return;
    const rect = element.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      element.dataset.tilting = 'true';
      element.style.setProperty('--sf-rx', `${(-y * maxTilt * 2).toFixed(2)}deg`);
      element.style.setProperty('--sf-ry', `${(x * maxTilt * 2).toFixed(2)}deg`);
      element.style.setProperty('--sf-tx', (x * 2).toFixed(3));
      element.style.setProperty('--sf-ty', (y * 2).toFixed(3));
      element.style.setProperty('--sf-px', `${((x + 0.5) * 100).toFixed(1)}%`);
      element.style.setProperty('--sf-py', `${((y + 0.5) * 100).toFixed(1)}%`);
    });
  };

  const handlePointerLeave = () => {
    const element = ref.current;
    if (!element) return;
    cancelAnimationFrame(frame.current);
    element.dataset.tilting = 'false';
    ['--sf-rx', '--sf-ry', '--sf-tx', '--sf-ty', '--sf-px', '--sf-py'].forEach((prop) =>
      element.style.removeProperty(prop)
    );
  };

  return (
    <div
      ref={ref}
      data-tilt={enabled}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={clsx('sf-tilt-root relative', className)}
    >
      {enabled && shadow && <span aria-hidden="true" className="sf-tilt-shadow" />}
      <div className={clsx('sf-tilt', innerClassName)}>
        {children}
        {enabled && glare && (
          <span aria-hidden="true" className="sf-tilt-glare">
            <span />
          </span>
        )}
      </div>
    </div>
  );
};

export default TiltCard;
