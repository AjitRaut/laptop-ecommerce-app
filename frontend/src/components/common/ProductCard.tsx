import React from 'react';
import { Link } from 'react-router-dom';
import { HeartIcon, ShoppingCartIcon, EyeIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { useAddToCartMutation, useAddToWishlistMutation } from '@/store/api/ordersApi';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-hot-toast';
import Button from './Button';
import Badge from './Badge';
import { formatPrice } from '@/utils/formatters';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  inWishlist?: boolean;
  className?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, inWishlist = false, className }) => {
  const { isAuthenticated } = useAuth();
  const [addToCart, { isLoading: isAddingToCart }] = useAddToCartMutation();
  const [addToWishlist, { isLoading: isAddingToWishlist }] = useAddToWishlistMutation();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return;
    }

    try {
      await addToCart({ product_id: product.id, quantity: 1 }).unwrap();
      toast.success('Added to cart!');
    } catch (error) {
      toast.error('Failed to add to cart');
    }
  };

  const handleAddToWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.error('Please login to add items to wishlist');
      return;
    }

    try {
      await addToWishlist(product.id).unwrap();
      toast.success('Added to wishlist!');
    } catch (error) {
      toast.error('Failed to add to wishlist');
    }
  };

  return (
    <div className={`group relative bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-xl transition-all duration-300 overflow-hidden ${className}`}>
      <Link to={`/products/${product.id}`} className="block">
        {/* Product Image */}
        <div className="aspect-square w-full overflow-hidden bg-gray-100 rounded-t-2xl relative">
          <img
            src={product.primary_image || '/api/placeholder/400/400'}
            alt={product.name}
            className="h-full w-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
          />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.is_featured && (
              <Badge variant="warning" size="sm">Featured</Badge>
            )}
            {parseFloat(product.discount_percentage) > 0 && (
              <Badge variant="error" size="sm">
                {product.discount_percentage}% OFF
              </Badge>
            )}
            {!product.is_in_stock && (
              <Badge variant="default" size="sm">Out of Stock</Badge>
            )}
          </div>

          {/* Quick Actions */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={handleAddToWishlist}
              disabled={isAddingToWishlist || inWishlist}
              className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-colors"
              title={inWishlist ? 'In Wishlist' : 'Add to Wishlist'}
            >
              {inWishlist ? (
                <HeartIconSolid className="h-5 w-5 text-red-500" />
              ) : (
                <HeartIcon className="h-5 w-5 text-gray-600 hover:text-red-500" />
              )}
            </button>
            <Link
              to={`/products/${product.id}`}
              className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-colors"
              title="Quick View"
            >
              <EyeIcon className="h-5 w-5 text-gray-600 hover:text-blue-500" />
            </Link>
          </div>

          {/* Add to Cart Button - Shows on Hover */}
          <div className="absolute bottom-3 left-3 right-3 transform translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
            <Button
              onClick={handleAddToCart}
              loading={isAddingToCart}
              disabled={!product.is_in_stock}
              size="sm"
              fullWidth
              leftIcon={<ShoppingCartIcon className="h-4 w-4" />}
              className="shadow-lg backdrop-blur-sm text-gray-900 border border-gray-200"
            >
              {product.is_in_stock ? 'Add to Cart' : 'Out of Stock'}
            </Button>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4">
          <div className="mb-2">
            <p className="text-sm text-gray-500 mb-1">{product.brand_name}</p>
            <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
              {product.name}
            </h3>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl font-bold text-gray-900">
              {formatPrice(product.discounted_price)}
            </span>
            {parseFloat(product.discount_percentage) > 0 && (
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          {/* Features */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>{product.warranty_months} month warranty</span>
            {product.is_low_stock && product.is_in_stock && (
              <span className="text-orange-600 font-medium">Low Stock</span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;