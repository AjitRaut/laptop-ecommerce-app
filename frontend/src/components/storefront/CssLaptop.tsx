import React from 'react';
import { clsx } from 'clsx';

interface CssLaptopProps {
  className?: string;
  /** Text shown on the screen. */
  label?: string;
  size?: 'sm' | 'lg';
  /** Gentle idle float (CSS animation, disabled for reduced motion globally). */
  float?: boolean;
}

/**
 * A lightweight, CSS-only laptop. Used as the hero fallback on touch devices /
 * reduced motion / no WebGL, and as the product image placeholder.
 */
const CssLaptop: React.FC<CssLaptopProps> = ({ className, label = 'LaptopWorld', size = 'lg', float = false }) => (
  <div aria-hidden="true" className={clsx('relative mx-auto w-full', float && 'animate-sf-float', className)}>
    {/* Lid */}
    <div
      className={clsx(
        'relative mx-auto w-[82%] bg-sf-device shadow-sf-float ring-1 ring-white/10',
        size === 'lg' ? 'rounded-t-[1.1rem] p-[2.2%]' : 'rounded-t-lg p-[3%]'
      )}
    >
      <div className="relative aspect-[16/10] overflow-hidden rounded-[0.35rem] bg-sf-gradient">
        <div className="absolute -left-1/4 -top-1/3 h-[120%] w-[90%] rounded-full bg-sf-cyan/40 blur-2xl" />
        <div className="absolute -bottom-1/3 -right-1/4 h-[110%] w-[80%] rounded-full bg-sf-violet-strong/70 blur-2xl" />
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/25" />
        <span
          className={clsx(
            'absolute inset-0 flex items-center justify-center font-display font-semibold tracking-tight text-white/90',
            size === 'lg' ? 'text-[clamp(0.9rem,2.4vw,1.6rem)]' : 'text-[0.7rem]'
          )}
        >
          {label}
        </span>
      </div>
      {/* Camera */}
      <span className="absolute left-1/2 top-[0.9%] h-[0.35rem] w-[0.35rem] -translate-x-1/2 rounded-full bg-white/15" />
    </div>
    {/* Base */}
    <div
      className={clsx(
        'relative mx-auto w-full bg-gradient-to-b from-sf-alu-from to-sf-alu-to',
        size === 'lg' ? 'h-[0.9rem] rounded-b-[1.2rem] rounded-t-sm' : 'h-[0.4rem] rounded-b-lg rounded-t-[2px]'
      )}
    >
      <span className="absolute left-1/2 top-0 h-[40%] w-[14%] -translate-x-1/2 rounded-b-md bg-sf-alu-to/80" />
    </div>
    {/* Ground shadow */}
    <div className="mx-auto mt-2 h-4 w-[86%] rounded-[50%] bg-black/30 blur-md dark:bg-black/60" />
  </div>
);

export default CssLaptop;
