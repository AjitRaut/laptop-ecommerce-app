import React from 'react';
import { MinusIcon, PlusIcon } from '@heroicons/react/24/outline';
import Button from './Button';

interface QuantitySelectorProps {
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  quantity,
  onQuantityChange,
  min = 1,
  max = 10,
  disabled = false,
  size = 'md',
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

  return (
    <div className="flex items-center space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleDecrease}
        disabled={disabled || quantity <= min}
        className={`${sizeClasses[size]} p-0`}
      >
        <MinusIcon className="h-4 w-4" />
      </Button>
      
      <div className={`${sizeClasses[size]} flex items-center justify-center border border-gray-300 rounded-lg bg-white`}>
        <span className="font-medium text-gray-900">{quantity}</span>
      </div>
      
      <Button
        variant="outline"
        size="sm"
        onClick={handleIncrease}
        disabled={disabled || quantity >= max}
        className={`${sizeClasses[size]} p-0`}
      >
        <PlusIcon className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default QuantitySelector;
