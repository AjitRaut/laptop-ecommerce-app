import React from 'react';
import { Helmet } from 'react-helmet-async';
import { MotionConfig, motion } from 'framer-motion';
import { ThemeProvider } from './theme';
import { CartFlyProvider } from './CartFly';

// Preloaded (not applied) in index.html; applied only here so admin/vendor
// screens keep their current system font.
export const FONT_STYLESHEET =
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap';

/** Very light gradient-mesh + grid backdrop. Pure CSS; only transforms animate. */
const AmbientBackground: React.FC = () => (
  <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
    <div className="sf-grid-bg absolute inset-0" />
    <div className="absolute -left-[15vw] -top-[35vh] h-[80vh] w-[70vw] animate-sf-drift rounded-full bg-[radial-gradient(closest-side,var(--sf-mesh-a),transparent)]" />
    <div className="absolute -right-[20vw] -top-[25vh] h-[70vh] w-[60vw] animate-sf-drift rounded-full bg-[radial-gradient(closest-side,var(--sf-mesh-b),transparent)] [animation-delay:-6s]" />
    <div className="absolute left-[25vw] top-[45vh] h-[60vh] w-[55vw] animate-sf-drift rounded-full bg-[radial-gradient(closest-side,var(--sf-mesh-c),transparent)] [animation-delay:-12s]" />
  </div>
);

/** Providers + chrome shared by every customer-facing screen (Layout and auth pages). */
const StorefrontShell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider>
    <MotionConfig reducedMotion="user">
      <CartFlyProvider>
        <Helmet>
          <link rel="stylesheet" href={FONT_STYLESHEET} />
        </Helmet>
        <div className="relative isolate flex min-h-screen flex-col bg-sf-bg font-body text-sf-ink antialiased">
          <AmbientBackground />
          {children}
        </div>
      </CartFlyProvider>
    </MotionConfig>
  </ThemeProvider>
);

const pageEase = [0.22, 1, 0.36, 1] as const;

/** Route-level transition: fade with a slight depth zoom. */
export const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 14, scale: 0.985 }}
    animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: pageEase } }}
    exit={{ opacity: 0, y: -6, scale: 0.995, transition: { duration: 0.16, ease: 'easeIn' } }}
    style={{ transformOrigin: '50% 0%' }}
  >
    {children}
  </motion.div>
);

export const SkipLink: React.FC = () => (
  <a
    href="#main"
    className="sr-only z-[70] rounded-full bg-sf-gradient px-4 py-2 text-sm font-medium text-sf-on-accent focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
  >
    Skip to content
  </a>
);

export default StorefrontShell;
