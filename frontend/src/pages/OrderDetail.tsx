import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeftIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import { useGetOrderQuery } from '@/store/api/ordersApi';
import { formatPrice, formatDate } from '@/utils/formatters';
import { generateOrderPDF } from '@/utils/pdfGenerator';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Button from '@/components/common/Button';
import Badge from '@/components/common/Badge';

const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading, error } = useGetOrderQuery(id!);

  const handleDownloadPDF = async () => {
    if (order) {
      try {
        await generateOrderPDF(order);
      } catch (error) {
        console.error('Failed to generate PDF:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order not found</h2>
          <p className="text-gray-600 mb-4">The order you're looking for doesn't exist.</p>
          <Link to="/orders">
            <Button>Back to Orders</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/orders"
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to Orders
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Order #{order.order_id}</h1>
              <p className="mt-2 text-sm text-gray-600">
                Placed on {formatDate(order.created_at)}
              </p>
            </div>
            <Button
              onClick={handleDownloadPDF}
              leftIcon={<DocumentArrowDownIcon className="h-5 w-5" />}
            >
              Download PDF
            </Button>
          </div>
        </div>

        <div className="space-y-8">
          {/* Order Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
          >
            <h2 className="text-lg font-medium text-gray-900 mb-4">Order Status</h2>
            <div className="flex items-center space-x-4">
              <Badge
                variant={
                  order.status === 'delivered' ? 'success' :
                  order.status === 'cancelled' ? 'error' :
                  order.status === 'shipped' ? 'info' : 'default'
                }
              >
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Badge>
              <Badge
                variant={
                  order.payment_status === 'paid' ? 'success' :
                  order.payment_status === 'failed' ? 'error' : 'warning'
                }
              >
                Payment {order.payment_status}
              </Badge>
            </div>
          </motion.div>

          {/* Shipping Address */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
          >
            <h2 className="text-lg font-medium text-gray-900 mb-4">Shipping Address</h2>
            <div className="text-sm text-gray-600">
              <p className="font-medium text-gray-900">{order.shipping_name}</p>
              <p className="mt-1">{order.shipping_address}</p>
              <p>{order.shipping_city}, {order.shipping_state} {order.shipping_pincode}</p>
              <p className="mt-1">Phone: {order.shipping_phone}</p>
            </div>
          </motion.div>

          {/* Order Items */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
          >
            <h2 className="text-lg font-medium text-gray-900 mb-6">Order Items</h2>
            
            <div className="space-y-6">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center space-x-4 pb-6 border-b border-gray-200 last:border-b-0 last:pb-0">
                  <div className="flex-shrink-0">
                    <div >
                       <img className="h-20 w-20 bg-gray-100 rounded-xl" src={item.product_image as any} />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-medium text-gray-900">
                      {item.product_name}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Price: {formatPrice(item.product_price)}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      Quantity: {item.quantity}
                    </p>
                  </div>
                  <div className="text-base font-medium text-gray-900">
                    {formatPrice(item.total_price)}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
          >
            <h2 className="text-lg font-medium text-gray-900 mb-6">Order Summary</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">{formatPrice(order.total_amount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax</span>
                <span className="font-medium">{formatPrice(order.tax_amount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">{formatPrice(order.shipping_charges)}</span>
              </div>
              {parseFloat(order.discount_amount) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Discount</span>
                  <span className="font-medium text-green-600">-{formatPrice(order.discount_amount)}</span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>{formatPrice(order.final_amount)}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;