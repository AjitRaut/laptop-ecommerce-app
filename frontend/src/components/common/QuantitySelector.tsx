import React from 'react';
import { MinusIcon, PlusIcon } from '@heroicons/react/24/outline';
import { clsx } from 'clsx';

interface QuantitySelectorProps {
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  /** Accessible name, e.g. "Quantity for Dell XPS 13". */
  label?: string;
}

const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  quantity,
  onQuantityChange,
  min = 1,
  max = 10,
  disabled = false,
  size = 'md',
  label = 'Quantity',
}) => {
  const handleDecrease = () => {
    if (quantity > min) {
      onQuantityChange(quantity - 1);
    }
  };

  const handleIncrease = () => {
    if (quantity < max) {
      onQuantityChange(quantity + 1);
    }
  };

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  };

  const stepButton = clsx(
    sizeClasses[size],
    'flex items-center justify-center rounded-full text-sf-muted transition-colors hover:bg-sf-surface-2 hover:text-sf-ink disabled:pointer-events-none disabled:opacity-40'
  );

  return (
    <div role="group" aria-label={label} className="sf-glass inline-flex items-center gap-1 rounded-full p-1">
      <button
        type="button"
        onClick={handleDecrease}
        disabled={disabled || quantity <= min}
        aria-label="Decrease quantity"
        className={stepButton}
      >
        <MinusIcon className="h-4 w-4" />
      </button>

      <span
        aria-live="polite"
        className={clsx(
          'min-w-[2.5rem] text-center font-display font-semibold tabular-nums text-sf-ink',
          size === 'sm' ? 'text-sm' : 'text-base'
        )}
      >
        {quantity}
      </span>

      <button
        type="button"
        onClick={handleIncrease}
        disabled={disabled || quantity >= max}
        aria-label="Increase quantity"
        className={stepButton}
      >
        <PlusIcon className="h-4 w-4" />
      </button>
    </div>
  );
};

export default QuantitySelector;
