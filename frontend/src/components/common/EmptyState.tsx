import React from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import EmptyIllustration, { type IllustrationKind } from '../storefront/EmptyIllustration';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  /** 3D-style illustration; takes precedence over `icon`. */
  illustration?: IllustrationKind;
  action?: React.ReactNode;
  className?: string;
  /** Use `h1` when the empty state is the whole page. */
  headingLevel?: 'h1' | 'h2' | 'h3';
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  illustration,
  action,
  className,
  headingLevel: Heading = 'h2',
}) => (
  <div className={clsx('flex flex-col items-center px-4 py-12 text-center', className)}>
    {illustration ? (
      <EmptyIllustration kind={illustration} className="mb-6" />
    ) : (
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-sf-surface-2 text-sf-subtle ring-1 ring-sf-line [&>svg]:h-7 [&>svg]:w-7">
        {icon || <ExclamationTriangleIcon />}
      </div>
    )}
    <Heading className="font-display text-2xl font-semibold tracking-tight text-sf-ink sm:text-3xl">{title}</Heading>
    <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-sf-muted">{description}</p>
    {action && <div className="mt-8 flex flex-wrap items-center justify-center gap-3">{action}</div>}
  </div>
);

export default EmptyState;
