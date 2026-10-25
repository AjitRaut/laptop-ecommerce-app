import React from 'react';
import { clsx } from 'clsx';

export type StatusTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'violet';

const tones: Record<StatusTone, string> = {
  neutral: 'bg-sf-surface-2 text-sf-muted ring-sf-line-strong',
  accent: 'bg-sf-accent/10 text-sf-accent ring-sf-accent/25',
  success: 'bg-sf-success/10 text-sf-success ring-sf-success/25',
  warning: 'bg-sf-warning/10 text-sf-warning ring-sf-warning/25',
  danger: 'bg-sf-danger/10 text-sf-danger ring-sf-danger/25',
  violet: 'bg-sf-violet/10 text-sf-violet ring-sf-violet/25',
};

interface StatusPillProps {
  children: React.ReactNode;
  tone?: StatusTone;
  dot?: boolean;
  className?: string;
}

const StatusPill: React.FC<StatusPillProps> = ({ children, tone = 'neutral', dot = false, className }) => (
  <span
    className={clsx(
      'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset',
      tones[tone],
      className
    )}
  >
    {dot && <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current" />}
    {children}
  </span>
);

export const orderStatusTone = (status: string): StatusTone => {
  switch (status) {
    case 'delivered':
      return 'success';
    case 'shipped':
    case 'processing':
      return 'accent';
    case 'confirmed':
      return 'violet';
    case 'cancelled':
      return 'danger';
    case 'pending':
      return 'warning';
    default:
      return 'neutral';
  }
};

export const paymentStatusTone = (status: string): StatusTone => {
  switch (status) {
    case 'paid':
      return 'success';
    case 'failed':
      return 'danger';
    case 'refunded':
      return 'neutral';
    default:
      return 'warning';
  }
};

export const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

export default StatusPill;
