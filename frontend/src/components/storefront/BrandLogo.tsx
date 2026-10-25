import React, { useId } from 'react';
import { clsx } from 'clsx';

interface BrandMarkProps {
  className?: string;
  title?: string;
}

/**
 * LaptopWorld mark: a gradient tile holding an open laptop whose screen shows a
 * globe with an orbit ring. Colours come from the storefront tokens, so it
 * follows the active theme. (public/favicon.svg is the static twin.)
 */
export const BrandMark: React.FC<BrandMarkProps> = ({ className, title }) => {
  const id = useId().replace(/:/g, '');
  const tile = `lw-tile-${id}`;
  const shine = `lw-shine-${id}`;
  const screen = `lw-screen-${id}`;

  return (
    <svg
      viewBox="0 0 48 48"
      // Glyph strokes/fills use currentColor = the on-accent token.
      className={clsx('flex-shrink-0 text-sf-on-accent', className)}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <defs>
        <linearGradient id={tile} x1="4" y1="2" x2="44" y2="46" gradientUnits="userSpaceOnUse">
          <stop offset="0" style={{ stopColor: 'rgb(var(--sf-cyan))' }} />
          <stop offset="0.45" style={{ stopColor: 'rgb(var(--sf-accent-strong))' }} />
          <stop offset="1" style={{ stopColor: 'rgb(var(--sf-violet-strong))' }} />
        </linearGradient>
        <linearGradient id={shine} x1="24" y1="2" x2="24" y2="26" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.35" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
        <clipPath id={screen}>
          <rect x="12.5" y="11.5" width="23" height="16" rx="2" />
        </clipPath>
      </defs>

      {/* Tile */}
      <rect x="2" y="2" width="44" height="44" rx="13" fill={`url(#${tile})`} />
      <rect x="2" y="2" width="44" height="44" rx="13" fill={`url(#${shine})`} />
      <rect x="2.5" y="2.5" width="43" height="43" rx="12.5" fill="none" stroke="currentColor" strokeOpacity="0.18" />

      {/* Laptop lid */}
      <rect x="11" y="10" width="26" height="19" rx="3" fill="none" stroke="currentColor" strokeWidth="2.2" />
      {/* Globe inside the screen */}
      <g clipPath={`url(#${screen})`} fill="none" stroke="currentColor" strokeLinecap="round">
        <circle cx="24" cy="19.5" r="5.2" strokeWidth="1.8" />
        <path d="M18.8 19.5h10.4M24 14.3c-1.9 1.6-2.7 3.4-2.7 5.2s.8 3.6 2.7 5.2c1.9-1.6 2.7-3.4 2.7-5.2s-.8-3.6-2.7-5.2" strokeWidth="1.3" strokeOpacity="0.85" />
      </g>
      {/* Orbit ring breaking out of the screen */}
      <ellipse
        cx="24"
        cy="19.5"
        rx="12.5"
        ry="4.2"
        transform="rotate(-20 24 19.5)"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeOpacity="0.9"
        strokeDasharray="30 4 40"
      />
      <circle cx="35.4" cy="14.9" r="1.9" fill="currentColor" />
      {/* Base */}
      <path d="M7.5 31.5h33a1 1 0 0 1 .9 1.4l-.6 1.3a2.5 2.5 0 0 1-2.3 1.5H9.5a2.5 2.5 0 0 1-2.3-1.5l-.6-1.3a1 1 0 0 1 .9-1.4z" fill="currentColor" />
      <path d="M20.5 31.5h7l-.6 1.1a1 1 0 0 1-.9.5h-4a1 1 0 0 1-.9-.5z" fill={`url(#${tile})`} />
    </svg>
  );
};

interface BrandLogoProps {
  className?: string;
  /** Hide the wordmark and show only the mark. */
  markOnly?: boolean;
  size?: 'md' | 'lg';
}

/** Mark + live wordmark. Wrap in a link with an accessible name ("LaptopWorld home"). */
const BrandLogo: React.FC<BrandLogoProps> = ({ className, markOnly = false, size = 'md' }) => (
  <span className={clsx('inline-flex items-center gap-2.5', className)}>
    <BrandMark className={size === 'lg' ? 'h-11 w-11' : 'h-9 w-9'} />
    {!markOnly && (
      <span
        className={clsx(
          'font-display font-semibold leading-none tracking-tight text-sf-ink',
          size === 'lg' ? 'text-2xl' : 'text-[1.15rem]'
        )}
      >
        Laptop<span className="sf-gradient-text">World</span>
      </span>
    )}
  </span>
);

export default BrandLogo;
