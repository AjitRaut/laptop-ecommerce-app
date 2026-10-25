import React from 'react';
import { clsx } from 'clsx';

type Icon = React.ComponentType<React.SVGProps<SVGSVGElement>>;

/**
 * Card with stacked offset layers behind it, reading as an extruded slab. On
 * hover the face lifts up-left while the layers stay, deepening the extrusion.
 * CSS transforms only, so it works (minus hover) on touch devices too.
 */
export const ExtrudedCard: React.FC<{ children: React.ReactNode; className?: string; faceClassName?: string }> = ({
  children,
  className,
  faceClassName,
}) => (
  <div className={clsx('group relative h-full', className)}>
    {[3, 2, 1].map((layer) => (
      <div
        key={layer}
        aria-hidden="true"
        style={{ transform: `translate3d(${layer * 3}px, ${layer * 3}px, 0)` }}
        className={clsx(
          'absolute inset-0 rounded-sf-xl border border-sf-line',
          layer === 3 ? 'bg-sf-gradient opacity-40' : 'bg-sf-surface-2',
          layer === 2 && 'opacity-80'
        )}
      />
    ))}
    <div
      className={clsx(
        'relative h-full rounded-sf-xl border border-sf-line bg-sf-surface shadow-sf-card transition-[transform,border-color] duration-500 ease-sf-out group-hover:-translate-x-1 group-hover:-translate-y-1 group-hover:border-sf-accent/40',
        faceClassName
      )}
    >
      {children}
    </div>
  </div>
);

/** Small CSS 3D cube (isometric view) that half-spins on hover of its `group` ancestor. */
export const IsoCube: React.FC<{ icon: Icon; size?: number; className?: string }> = ({ icon: IconComponent, size = 52, className }) => {
  const half = size / 2;
  const face = 'absolute inset-0 flex items-center justify-center rounded-[10px] [backface-visibility:hidden]';
  return (
    <div aria-hidden="true" className={clsx('[perspective:700px]', className)} style={{ width: size * 1.7, height: size * 1.7 }}>
      <div
        className="relative mx-auto transition-transform duration-[900ms] ease-sf-out [transform-style:preserve-3d] [transform:translateY(30%)_rotateX(-24deg)_rotateY(-38deg)] group-hover:[transform:translateY(30%)_rotateX(-24deg)_rotateY(-218deg)]"
        style={{ width: size, height: size }}
      >
        <div className={clsx(face, 'bg-sf-gradient text-sf-on-accent')} style={{ transform: `translateZ(${half}px)` }}>
          <IconComponent className="h-1/2 w-1/2" />
        </div>
        <div className={clsx(face, 'bg-sf-gradient text-sf-on-accent')} style={{ transform: `rotateY(180deg) translateZ(${half}px)` }}>
          <IconComponent className="h-1/2 w-1/2" />
        </div>
        <div className={clsx(face, 'bg-sf-violet-strong')} style={{ transform: `rotateY(90deg) translateZ(${half}px)` }} />
        <div className={clsx(face, 'bg-sf-violet-strong')} style={{ transform: `rotateY(-90deg) translateZ(${half}px)` }} />
        <div className={clsx(face, 'bg-sf-accent-strong')} style={{ transform: `rotateX(90deg) translateZ(${half}px)` }}>
          <span className="absolute inset-0 rounded-[10px] bg-white/25" />
        </div>
      </div>
    </div>
  );
};
