import React from 'react';
import { motion } from 'framer-motion';
import ProductCard from './ProductCard';
import LoadingSpinner from './LoadingSpinner';
import EmptyState from './EmptyState';
import type { Product } from '@/types';

interface ProductGridProps {
  products: Product[];
  isLoading: boolean;
  error?: any;
  emptyStateProps?: {
    title: string;
    description: string;
    action?: React.ReactNode;
  };
  className?: string;
}

const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  isLoading,
  error,
  emptyStateProps,
  className = '',
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        title="Error loading products"
        description="We encountered an error while loading products. Please try again."
        action={
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        }
      />
    );
  }

  if (products.length === 0) {
    return (
      <EmptyState
        title={emptyStateProps?.title || "No products found"}
        description={emptyStateProps?.description || "Try adjusting your search criteria."}
        action={emptyStateProps?.action}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${className}`}
    >
      {products.map((product, index) => (
        <motion.div
          key={product.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.05 }}
        >
          <ProductCard product={product} />
        </motion.div>
      ))}
    </motion.div>
  );
};

export default ProductGrid;
