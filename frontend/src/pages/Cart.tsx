import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { TrashIcon, PlusIcon, MinusIcon } from '@heroicons/react/24/outline';
import { useGetCartQuery, useUpdateCartItemMutation, useRemoveFromCartMutation } from '@/store/api/ordersApi';
import { formatPrice } from '@/utils/formatters';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';
import Button from '@/components/common/Button';

const Cart: React.FC = () => {
  const { data: cart, isLoading } = useGetCartQuery();
  const [updateCartItem, { isLoading: isUpdating }] = useUpdateCartItemMutation();
  const [removeFromCart, { isLoading: isRemoving }] = useRemoveFromCartMutation();

  const handleUpdateQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;

    try {
      await updateCartItem({ item_id: itemId, quantity: newQuantity }).unwrap();
      toast.success('Cart updated');
    } catch (error) {
      toast.error('Failed to update cart');
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    try {
      await removeFromCart(itemId).unwrap();
      toast.success('Item removed from cart');
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  const calculateSubtotal = () => {
    if (!cart?.items) return 0;
    return cart.items.reduce((total, item) => total + parseFloat(item.total_price), 0);
  };

  const subtotal = calculateSubtotal();
  const tax = subtotal * 0.18; // 18% tax
  const shipping = subtotal > 10000 ? 0 : 100; // Free shipping over ₹10,000
  const total = subtotal + tax + shipping;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!cart?.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <EmptyState
            title="Your cart is empty"
            description="Looks like you haven't added any items to your cart yet."
            icon={
              <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5-6m0 0h15.5m0 0L21 5H5.4" />
              </svg>
            }
            action={
              <Link to="/products">
                <Button size="lg">
                  Continue Shopping
                </Button>
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
            <p className="mt-2 text-sm text-gray-600">
              {cart.items.length} {cart.items.length === 1 ? 'item' : 'items'} in your cart
            </p>
          </div>

          <div className="lg:grid lg:grid-cols-12 lg:gap-x-8">
            {/* Cart Items */}
            <div className="lg:col-span-8">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="divide-y divide-gray-200">
                  {cart.items.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className="p-6 sm:p-8"
                    >
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <img
                            src={item.product.primary_image || '/api/placeholder/100/100'}
                            alt={item.product.name}
                            className="h-20 w-20 rounded-xl object-cover"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-lg font-medium text-gray-900">
                                <Link
                                  to={`/products/${item.product.id}`}
                                  className="hover:text-blue-600 transition-colors"
                                >
                                  {item.product.name}
                                </Link>
                              </h3>
                              <p className="mt-1 text-sm text-gray-500">
                                {item.product.brand_name}
                              </p>
                              <p className="mt-2 text-lg font-semibold text-gray-900">
                                {formatPrice(item.product.discounted_price)}
                              </p>
                            </div>

                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              disabled={isRemoving}
                              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                              title="Remove item"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </div>

                          <div className="mt-4 flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <span className="text-sm text-gray-600">Quantity:</span>
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                  disabled={item.quantity <= 1 || isUpdating}
                                  className="p-1 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <MinusIcon className="h-4 w-4" />
                                </button>
                                <span className="w-8 text-center font-medium">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                  disabled={isUpdating}
                                  className="p-1 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <PlusIcon className="h-4 w-4" />
                                </button>
                              </div>
                            </div>

                            <div className="text-right">
                              <p className="text-lg font-semibold text-gray-900">
                                {formatPrice(item.total_price)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Continue Shopping */}
              <div className="mt-6">
                <Link to="/products">
                  <Button variant="outline">
                    ← Continue Shopping
                  </Button>
                </Link>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-4 mt-8 lg:mt-0">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-8">
                <h2 className="text-lg font-medium text-gray-900 mb-6">Order Summary</h2>

                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">{formatPrice(subtotal.toString())}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax (18%)</span>
                    <span className="font-medium">{formatPrice(tax.toString())}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    {shipping === 0 ? (
                      <span className="font-medium text-green-600">Free</span>
                    ) : (
                      <span className="font-medium">{formatPrice(shipping.toString())}</span>
                    )}
                  </div>

                  {subtotal < 10000 && (
                    <div className="text-sm text-gray-500 bg-blue-50 p-3 rounded-lg">
                      Add {formatPrice((10000 - subtotal).toString())} more for free shipping!
                    </div>
                  )}

                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span>{formatPrice(total.toString())}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <Link to="/checkout">
                    <Button size="lg" fullWidth>
                      Proceed to Checkout
                    </Button>
                  </Link>
                </div>

                {/* Security badges */}
                <div className="mt-6 flex items-center justify-center space-x-4 text-xs text-gray-500">
                  <div className="flex items-center">
                    <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 1l9 4v6c0 5.55-3.84 10.74-9 12-5.16-1.26-9-6.45-9-12V5l9-4z"/>
                    </svg>
                    Secure checkout
                  </div>
                  <div className="flex items-center">
                    <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    SSL encrypted
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;