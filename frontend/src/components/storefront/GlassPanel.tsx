import React from 'react';
import { clsx } from 'clsx';

interface GlassPanelProps extends React.HTMLAttributes<HTMLElement> {
  as?: 'div' | 'section' | 'aside' | 'article' | 'nav';
  /** Adds the signature gradient hairline border. */
  glow?: boolean;
  padded?: boolean;
}

/** Frosted-glass surface used for cards, summaries and side panels. */
const GlassPanel: React.FC<GlassPanelProps> = ({
  as: Component = 'div',
  glow = false,
  padded = true,
  className,
  children,
  ...props
}) => (
  <Component
    className={clsx(
      'sf-glass rounded-sf-lg shadow-sf-card',
      glow && 'sf-gradient-border',
      padded && 'p-5 sm:p-6',
      className
    )}
    {...props}
  >
    {children}
  </Component>
);

export default GlassPanel;
