import React, { createContext, useCallback, useContext, useLayoutEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MoonIcon, SunIcon } from '@heroicons/react/24/outline';
import { clsx } from 'clsx';

export type Theme = 'dark' | 'light';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const STORAGE_KEY = 'lw-theme';
const ThemeContext = createContext<ThemeContextValue | null>(null);

const readStoredTheme = (): Theme => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    // Storage can be unavailable (private mode, blocked site data); fall back to dark.
  }
  return 'dark';
};

/**
 * Applies the storefront theme to <html> while mounted and removes it on unmount,
 * so navigating into admin/vendor screens leaves their styling untouched.
 */
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(readStoredTheme);

  useLayoutEffect(() => {
    const root = document.documentElement;
    root.classList.remove('sf-boot');
    root.classList.add('sf-theme');
    root.classList.toggle('dark', theme === 'dark');
    return () => {
      root.classList.remove('sf-theme', 'dark');
    };
  }, [theme]);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Non-critical preference; ignore storage failures.
    }
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, setTheme, toggleTheme: () => setTheme(theme === 'dark' ? 'light' : 'dark') }),
    [theme, setTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

const fallbackTheme: ThemeContextValue = { theme: 'light', setTheme: () => {}, toggleTheme: () => {} };

/** Outside the storefront shell (admin/vendor) this reports the plain light theme. */
export const useTheme = (): ThemeContextValue => useContext(ThemeContext) ?? fallbackTheme;

export const ThemeToggle: React.FC<{ className?: string }> = ({ className }) => {
  const { theme, toggleTheme } = useTheme();
  const next = theme === 'dark' ? 'light' : 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}
      className={clsx(
        'relative inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full text-sf-muted transition-colors hover:bg-sf-surface-2 hover:text-sf-ink',
        className
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ opacity: 0, rotate: -90, scale: 0.6 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 90, scale: 0.6 }}
          transition={{ duration: 0.25 }}
          className="flex"
        >
          {theme === 'dark' ? <MoonIcon className="h-5 w-5" /> : <SunIcon className="h-5 w-5" />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
};
