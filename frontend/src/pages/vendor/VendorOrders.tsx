import React, { useState } from 'react';
import { EyeIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { useGetVendorOrdersQuery, useUpdateOrderItemStatusMutation } from '@/store/api/vendorApi';
import Button from '@/components/common/Button';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Badge from '@/components/common/Badge';
import { formatPrice } from '@/utils/formatters';

const VendorOrders: React.FC = () => {
  const { data, isLoading } = useGetVendorOrdersQuery();
  const [updateStatus] = useUpdateOrderItemStatusMutation();
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  // ✅ Unwrap paginated response — API returns { count, next, previous, results: [...] }
  const orders = data?.results ?? [];

  const handleStatusUpdate = async (itemId: number, status: string) => {
    try {
      await updateStatus({ itemId, vendor_status: status }).unwrap();
      toast.success('Status updated!');
    } catch {
      toast.error('Failed to update status');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
        {/* ✅ Use data.count for the total, falls back to orders.length */}
        <p className="text-gray-600 mt-2">{data?.count ?? orders.length} orders</p>
      </div>

      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order.order_id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Order Header */}
            <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-sm text-gray-600">Order ID</p>
                  <p className="font-semibold text-gray-900">#{order.order_id.slice(0, 8)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Customer</p>
                  <p className="font-medium text-gray-900">{order.customer_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date</p>
                  <p className="font-medium text-gray-900">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-gray-600">Amount</p>
                  {/* ✅ Use final_amount (includes tax/fees) — falls back to total_amount */}
                  <p className="text-lg font-bold text-gray-900">
                    {formatPrice(order.final_amount ?? order.total_amount)}
                  </p>
                </div>
                <Badge variant={
                  order.status === 'delivered' ? 'success' :
                  order.status === 'shipped'   ? 'info' :
                  order.status === 'confirmed' ? 'info' :
                  'warning'
                }>
                  {order.status}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setExpandedOrder(expandedOrder === order.order_id ? null : order.order_id)
                  }
                  leftIcon={<EyeIcon className="h-4 w-4" />}
                >
                  {expandedOrder === order.order_id ? 'Hide' : 'View'}
                </Button>
              </div>
            </div>

            {/* Order Items (Expandable) */}
            {expandedOrder === order.order_id && (
              <div className="p-6 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">Order Items</h3>
                <div className="space-y-4">
                  {order.items?.map((item: any) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={item.product_image || '/api/placeholder/60/60'}
                          alt={item.product_name}
                          className="h-16 w-16 rounded-lg object-cover"
                        />
                        <div>
                          <p className="font-medium text-gray-900">{item.product_name}</p>
                          <p className="text-sm text-gray-600">
                            Qty: {item.quantity} × {formatPrice(item.product_price)}
                          </p>
                          <p className="text-sm font-medium text-gray-900 mt-1">
                            Total: {formatPrice(item.total_price)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={
                          item.vendor_status === 'shipped'  ? 'success' :
                          item.vendor_status === 'accepted' ? 'info' :
                          'warning'
                        }>
                          {item.vendor_status || 'pending'}
                        </Badge>
                        <div className="flex gap-2">
                          {(!item.vendor_status || item.vendor_status === 'pending') && (
                            <Button
                              size="sm"
                              onClick={() => handleStatusUpdate(item.id, 'accepted')}
                            >
                              Accept
                            </Button>
                          )}
                          {item.vendor_status === 'accepted' && (
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => handleStatusUpdate(item.id, 'shipped')}
                            >
                              Mark Shipped
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Shipping Address */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Shipping Address</h4>
                  <p className="text-sm text-gray-700">
                    {order.shipping_name}<br />
                    {order.shipping_address}<br />
                    {order.shipping_city}, {order.shipping_state} - {order.shipping_pincode}<br />
                    Phone: {order.shipping_phone}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {orders.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl">
          <p className="text-gray-500">No orders yet</p>
        </div>
      )}
    </div>
  );
};

export default VendorOrders;