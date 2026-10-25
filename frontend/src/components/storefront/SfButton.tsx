import React from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { clsx } from 'clsx';

export type SfButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type SfButtonSize = 'sm' | 'md' | 'lg' | 'xl';

interface StyleOptions {
  variant?: SfButtonVariant;
  size?: SfButtonSize;
  fullWidth?: boolean;
  className?: string;
}

const base =
  'relative inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-[background-color,border-color,color,box-shadow,filter] duration-200 disabled:pointer-events-none disabled:opacity-50';

const variants: Record<SfButtonVariant, string> = {
  primary:
    'bg-sf-gradient text-sf-on-accent shadow-sf-glow hover:brightness-110 before:pointer-events-none before:absolute before:inset-px before:rounded-full before:bg-gradient-to-b before:from-white/20 before:to-transparent',
  secondary: 'sf-glass text-sf-ink hover:bg-sf-surface-2',
  outline: 'border border-sf-line-strong bg-transparent text-sf-ink hover:border-sf-accent/60 hover:bg-sf-surface-2/60',
  ghost: 'text-sf-muted hover:bg-sf-surface-2 hover:text-sf-ink',
  danger: 'border border-sf-danger/30 bg-sf-danger/10 text-sf-danger hover:bg-sf-danger/15',
};

const sizes: Record<SfButtonSize, string> = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-11 px-5 text-sm',
  lg: 'h-12 px-6 text-base',
  xl: 'h-14 px-8 text-base',
};

export const sfButtonClasses = ({ variant = 'primary', size = 'md', fullWidth, className }: StyleOptions) =>
  clsx(base, variants[variant], sizes[size], fullWidth && 'w-full', className);

const spring = { type: 'spring', stiffness: 420, damping: 26 } as const;

const Spinner = () => (
  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
  </svg>
);

interface SfButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'>, StyleOptions {
  children?: React.ReactNode;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const SfButton = React.forwardRef<HTMLButtonElement, SfButtonProps>(
  ({ children, variant, size, fullWidth, className, loading = false, disabled, leftIcon, rightIcon, type = 'button', ...props }, ref) => (
    <motion.button
      ref={ref}
      type={type}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.97 }}
      transition={spring}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={sfButtonClasses({ variant, size, fullWidth, className })}
      {...props}
    >
      <span className="relative inline-flex items-center gap-2">
        {loading ? <Spinner /> : leftIcon}
        {children}
        {!loading && rightIcon}
      </span>
    </motion.button>
  )
);
SfButton.displayName = 'SfButton';

const MotionLink = motion(Link);

// framer-motion redefines these handlers with incompatible signatures.
type MotionConflicts = 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart' | 'onAnimationEnd' | 'onAnimationIteration';

interface SfLinkButtonProps extends Omit<LinkProps, MotionConflicts>, StyleOptions {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const SfLinkButton: React.FC<SfLinkButtonProps> = ({
  children,
  variant,
  size,
  fullWidth,
  className,
  leftIcon,
  rightIcon,
  ...props
}) => (
  <MotionLink
    whileHover={{ y: -1 }}
    whileTap={{ scale: 0.97 }}
    transition={spring}
    className={sfButtonClasses({ variant, size, fullWidth, className })}
    {...props}
  >
    <span className="relative inline-flex items-center gap-2">
      {leftIcon}
      {children}
      {rightIcon}
    </span>
  </MotionLink>
);
