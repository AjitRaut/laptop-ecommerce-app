import React from 'react';
import { CheckIcon } from '@heroicons/react/24/solid';
import { clsx } from 'clsx';

const STEPS = ['Cart', 'Address', 'Payment', 'Done'] as const;
export type CheckoutStep = (typeof STEPS)[number];

interface CheckoutStepperProps {
  current: CheckoutStep;
  className?: string;
}

const CheckoutStepper: React.FC<CheckoutStepperProps> = ({ current, className }) => {
  const currentIndex = STEPS.indexOf(current);

  return (
    <nav aria-label="Checkout progress" className={clsx('w-full', className)}>
      <ol className="relative mx-auto flex max-w-xl items-start justify-between">
        {/* Track + progress fill (scaleX only) */}
        <span aria-hidden="true" className="absolute left-[12.5%] right-[12.5%] top-4 h-px bg-sf-line-strong" />
        <span
          aria-hidden="true"
          style={{ transform: `scaleX(${currentIndex / (STEPS.length - 1)})` }}
          className="absolute left-[12.5%] right-[12.5%] top-4 h-px origin-left bg-sf-gradient transition-transform duration-700 ease-sf-out"
        />
        {STEPS.map((step, index) => {
          const complete = index < currentIndex;
          const active = index === currentIndex;
          return (
            <li
              key={step}
              aria-current={active ? 'step' : undefined}
              className="relative flex w-1/4 flex-col items-center gap-2"
            >
              <span
                className={clsx(
                  'flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-colors duration-300',
                  complete && 'bg-sf-gradient text-sf-on-accent',
                  active && 'bg-sf-surface text-sf-accent shadow-sf-glow ring-2 ring-sf-accent-strong',
                  !complete && !active && 'bg-sf-surface-2 text-sf-subtle ring-1 ring-sf-line-strong'
                )}
              >
                {complete ? <CheckIcon className="h-4 w-4" /> : index + 1}
              </span>
              <span className={clsx('text-xs font-medium sm:text-sm', active || complete ? 'text-sf-ink' : 'text-sf-subtle')}>
                {step}
                {complete && <span className="sr-only"> (completed)</span>}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default CheckoutStepper;
