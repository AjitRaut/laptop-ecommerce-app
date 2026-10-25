import React from 'react';
import { CheckIcon, XMarkIcon, ArrowUturnLeftIcon } from '@heroicons/react/24/solid';
import { clsx } from 'clsx';
import type { Order } from '@/types';

const STEPS: Order['status'][] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
const LABELS: Record<string, string> = {
  pending: 'Placed',
  confirmed: 'Confirmed',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
};

interface OrderTimelineProps {
  status: Order['status'];
  compact?: boolean;
  className?: string;
}

/** Order progress: placed → confirmed → processing → shipped → delivered. */
const OrderTimeline: React.FC<OrderTimelineProps> = ({ status, compact = false, className }) => {
  if (status === 'cancelled' || status === 'refunded') {
    const Icon = status === 'cancelled' ? XMarkIcon : ArrowUturnLeftIcon;
    return (
      <p className={clsx('inline-flex items-center gap-2 text-sm', status === 'cancelled' ? 'text-sf-danger' : 'text-sf-muted', className)}>
        <span className="flex h-6 w-6 items-center justify-center rounded-full ring-1 ring-current">
          <Icon className="h-3.5 w-3.5" />
        </span>
        This order was {status}.
      </p>
    );
  }

  const current = STEPS.indexOf(status);

  return (
    <ol aria-label="Order progress" className={clsx('relative flex items-start justify-between', className)}>
      <span aria-hidden="true" className="absolute left-[10%] right-[10%] top-3 h-px bg-sf-line-strong" />
      <span
        aria-hidden="true"
        style={{ transform: `scaleX(${Math.max(0, current) / (STEPS.length - 1)})` }}
        className="absolute left-[10%] right-[10%] top-3 h-px origin-left bg-sf-gradient transition-transform duration-700 ease-sf-out"
      />
      {STEPS.map((step, index) => {
        const done = index <= current;
        return (
          <li
            key={step}
            aria-current={index === current ? 'step' : undefined}
            className="relative flex w-1/5 flex-col items-center gap-1.5 text-center"
          >
            <span
              className={clsx(
                'flex h-6 w-6 items-center justify-center rounded-full',
                done ? 'bg-sf-gradient text-sf-on-accent' : 'bg-sf-surface-2 ring-1 ring-sf-line-strong',
                index === current && 'shadow-sf-glow'
              )}
            >
              {done && <CheckIcon className="h-3.5 w-3.5" />}
            </span>
            {!compact && (
              <span className={clsx('text-xs', done ? 'font-medium text-sf-ink' : 'text-sf-subtle')}>{LABELS[step]}</span>
            )}
            {compact && <span className="sr-only">{LABELS[step]}{done ? ' (done)' : ''}</span>}
          </li>
        );
      })}
    </ol>
  );
};

export default OrderTimeline;
