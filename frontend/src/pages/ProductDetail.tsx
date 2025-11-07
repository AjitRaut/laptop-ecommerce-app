import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  StarIcon,
  HeartIcon,
  ShoppingCartIcon,
  ShareIcon,
  CheckIcon,
  TruckIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid, StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { useGetProductQuery } from '@/store/api/productsApi';
import { useAddToCartMutation, useAddToWishlistMutation } from '@/store/api/ordersApi';
import { useAuth } from '@/hooks/useAuth';
import { formatPrice } from '@/utils/formatters';
import { clsx } from 'clsx';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Button from '@/components/common/Button';
import Badge from '@/components/common/Badge';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const { data: product, isLoading, error } = useGetProductQuery(Number(id));
  const [addToCart, { isLoading: isAddingToCart }] = useAddToCartMutation();
  const [addToWishlist, { isLoading: isAddingToWishlist }] = useAddToWishlistMutation();

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return;
    }

    try {
      await addToCart({ product_id: Number(id), quantity }).unwrap();
      toast.success('Added to cart!');
    } catch (error) {
      toast.error('Failed to add to cart');
    }
  };

  const handleAddToWishlist = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to wishlist');
      return;
    }

    try {
      await addToWishlist(Number(id)).unwrap();
      toast.success('Added to wishlist!');
    } catch (error) {
      toast.error('Failed to add to wishlist');
    }
  };

  const handleShare = async () => {
    if (navigator.share && product) {
      try {
        await navigator.share({
          title: product.name,
          text: product.short_description || product.description,
          url: window.location.href,
        });
      } catch (error) {
        // Fallback to clipboard
        navigator.clipboard.writeText(window.location.href);
        toast.success('Product link copied to clipboard');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Product link copied to clipboard');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product not found</h2>
          <p className="text-gray-600 mb-4">The product you're looking for doesn't exist.</p>
          <Link to="/products">
            <Button>Browse Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  const images = product.images && product.images.length > 0 
    ? product.images.map(img => img.image)
    : [product.primary_image || '/api/placeholder/600/600'];

  const features = [
    { icon: TruckIcon, text: 'Free shipping on orders over ₹10,000' },
    { icon: ShieldCheckIcon, text: `${product.warranty_months} months warranty` },
    { icon: CheckIcon, text: '30-day return policy' },
  ];

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex mb-8" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-4">
            <li>
              <Link to="/" className="text-gray-400 hover:text-gray-500">
                Home
              </Link>
            </li>
            <li>
              <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </li>
            <li>
              <Link to="/products" className="text-gray-400 hover:text-gray-500">
                Products
              </Link>
            </li>
            <li>
              <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </li>
            <li>
              <span className="text-gray-500 font-medium">{product.name}</span>
            </li>
          </ol>
        </nav>

        <div className="lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start">
          {/* Image gallery */}
          <div className="flex flex-col-reverse">
            {/* Image selector */}
            <div className="mx-auto mt-6 w-full max-w-2xl sm:block lg:max-w-none">
              <div className="grid grid-cols-4 gap-6">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={clsx(
                      'relative h-24 bg-white rounded-md flex items-center justify-center text-sm font-medium uppercase text-gray-900 cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring focus:ring-offset-4 focus:ring-blue-500',
                      selectedImageIndex === index ? 'ring-2 ring-blue-500' : 'ring-1 ring-gray-300'
                    )}
                  >
                    <img
                      src={image}
                      alt=""
                      className="h-full w-full object-cover object-center rounded-md"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Main image */}
            <div className="aspect-square w-full overflow-hidden rounded-2xl bg-gray-100">
              <motion.img
                key={selectedImageIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                src={images[selectedImageIndex]}
                alt={product.name}
                className="h-full w-full object-cover object-center"
              />
            </div>
          </div>

          {/* Product info */}
          <div className="mt-10 px-4 sm:mt-16 sm:px-0 lg:mt-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Product badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                {product.is_featured && <Badge variant="warning">Featured</Badge>}
                {parseFloat(product.discount_percentage) > 0 && (
                  <Badge variant="error">{product.discount_percentage}% OFF</Badge>
                )}
                {!product.is_in_stock && <Badge variant="default">Out of Stock</Badge>}
                {product.is_low_stock && product.is_in_stock && (
                  <Badge variant="warning">Low Stock</Badge>
                )}
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                {product.name}
              </h1>

              <div className="mt-3">
                {/* <p className="text-lg text-gray-600">{product.brand?.name}</p> */}
              </div>

              {/* Reviews */}
              <div className="mt-6">
                <div className="flex items-center">
                  <div className="flex items-center">
                    {[0, 1, 2, 3, 4].map((rating) => (
                      <StarIconSolid
                        key={rating}
                        className={clsx(
                          rating < 4 ? 'text-yellow-400' : 'text-gray-200',
                          'h-5 w-5 flex-shrink-0'
                        )}
                      />
                    ))}
                  </div>
                  <p className="ml-3 text-sm text-gray-500">4.0 out of 5 stars</p>
                  <a href="#reviews" className="ml-3 text-sm font-medium text-blue-600 hover:text-blue-500">
                    117 reviews
                  </a>
                </div>
              </div>

              {/* Price */}
              <div className="mt-6">
                <div className="flex items-baseline">
                  <p className="text-3xl font-bold text-gray-900">
                    {formatPrice(product.discounted_price)}
                  </p>
                  {parseFloat(product.discount_percentage) > 0 && (
                    <p className="ml-4 text-xl font-medium text-gray-500 line-through">
                      {formatPrice(product.price)}
                    </p>
                  )}
                </div>
                {parseFloat(product.discount_percentage) > 0 && (
                  <p className="mt-2 text-sm text-green-600 font-medium">
                    You save {formatPrice((parseFloat(product.price) - parseFloat(product.discounted_price)).toString())}
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="mt-6">
                <h3 className="sr-only">Description</h3>
                <div className="text-base text-gray-900 space-y-6">
                  <p>{product.description}</p>
                </div>
              </div>

              {/* Specifications */}
              {product.specifications && product.specifications.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-medium text-gray-900">Specifications</h3>
                  <div className="mt-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {product.specifications.map((spec) => (
                        <div key={spec.id} className="border-t border-gray-200 pt-4">
                          <dt className="font-medium text-gray-900">{spec.spec_name}</dt>
                          <dd className="mt-2 text-sm text-gray-500">{spec.spec_value}</dd>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Features */}
              <div className="mt-8">
                <div className="space-y-4">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <feature.icon className="h-5 w-5 text-green-500 mr-3" />
                      <span className="text-sm text-gray-600">{feature.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add to cart form */}
              <div className="mt-10">
                <div className="flex items-center space-x-4 mb-6">
                  <label htmlFor="quantity" className="text-sm font-medium text-gray-900">
                    Quantity
                  </label>
                  <select
                    id="quantity"
                    name="quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="rounded-md border border-gray-300 py-1.5 pl-3 pr-8 text-base focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <option key={num} value={num}>
                        {num}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex space-x-4">
                  <Button
                    onClick={handleAddToCart}
                    loading={isAddingToCart}
                    disabled={!product.is_in_stock}
                    size="lg"
                    className="flex-1"
                    leftIcon={<ShoppingCartIcon className="h-5 w-5" />}
                  >
                    {product.is_in_stock ? 'Add to Cart' : 'Out of Stock'}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleAddToWishlist}
                    loading={isAddingToWishlist}
                    size="lg"
                    leftIcon={<HeartIcon className="h-5 w-5" />}
                  >
                    Wishlist
                  </Button>
                </div>

                <div className="mt-4">
                  <Button
                    variant="ghost"
                    onClick={handleShare}
                    size="sm"
                    leftIcon={<ShareIcon className="h-4 w-4" />}
                  >
                    Share this product
                  </Button>
                </div>
              </div>

              {/* Product meta */}
              <div className="mt-8 border-t border-gray-200 pt-8">
                <div className="grid grid-cols-1 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">SKU:</span>
                    <span className="font-medium">{product.sku}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category:</span>
                    <Link
                      to={`/products?category=${product.category}`}
                      className="font-medium text-blue-600 hover:text-blue-500"
                    >
                      {product.category_name}
                    </Link>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Brand:</span>
                    <Link
                      to={`/products?brand=${product.brand}`}
                      className="font-medium text-blue-600 hover:text-blue-500"
                    >
                      {product.brand_name}
                    </Link>
                  </div>
                  {product.weight && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Weight:</span>
                      <span className="font-medium">{product.weight} kg</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-24">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Related Products</h2>
          <p className="mt-2 text-sm text-gray-600">
            Other products you might be interested in
          </p>
          {/* Related products would be loaded here */}
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* Placeholder for related products */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;