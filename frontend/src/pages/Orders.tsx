import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { EyeIcon, DocumentArrowDownIcon } from "@heroicons/react/24/outline";
import { useGetOrdersQuery } from "@/store/api/ordersApi";
import { formatPrice, formatDate } from "@/utils/formatters";
import { generateOrderPDF } from "@/utils/pdfGenerator";
import { ORDER_STATUS_COLORS, PAYMENT_STATUS_COLORS } from "@/utils/constants";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import EmptyState from "@/components/common/EmptyState";
import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";

const Orders: React.FC = () => {
  const { data: orders, isLoading } = useGetOrdersQuery();

  const handleDownloadPDF = async (order: any) => {
    try {
      await generateOrderPDF(order);
    } catch (error) {
      console.error("Failed to generate PDF:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!orders || orders.results.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <EmptyState
            title="No orders yet"
            description="You haven't placed any orders yet. Start shopping to see your orders here."
            icon={
              <svg
                className="h-12 w-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            }
            action={
              <Link to="/products">
                <Button size="lg">Start Shopping</Button>
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Your Orders</h1>
          <p className="mt-2 text-sm text-gray-600">
            Track and manage your orders
          </p>
        </div>

        <div className="space-y-6">
          {orders?.results?.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
            >
              <div className="p-6">
                {/* Order Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      Order #{order.order_id}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Placed on {formatDate(order.created_at)}
                    </p>
                  </div>
                  <div className="mt-4 sm:mt-0 flex items-center space-x-3">
                    <Badge
                      variant={
                        order.status === "delivered"
                          ? "success"
                          : order.status === "cancelled"
                          ? "error"
                          : order.status === "shipped"
                          ? "info"
                          : "default"
                      }
                    >
                      {order.status.charAt(0).toUpperCase() +
                        order.status.slice(1)}
                    </Badge>
                    <Badge
                      variant={
                        order.payment_status === "paid"
                          ? "success"
                          : order.payment_status === "failed"
                          ? "error"
                          : "warning"
                      }
                    >
                      {order.payment_status.charAt(0).toUpperCase() +
                        order.payment_status.slice(1)}
                    </Badge>
                  </div>
                </div>

                {/* Order Items */}
                <div className="border-t border-gray-200 pt-6">
                  <div className="space-y-4">
                    {order.items.slice(0, 3).map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center space-x-4"
                      >
                        <div className="flex-shrink-0">
                          <div >
                            <img className="h-16 w-16 bg-gray-100 rounded-lg" src={item.product_image as any} />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {item.product_name}
                          </p>
                          <p className="text-sm text-gray-500">
                            Quantity: {item.quantity}
                          </p>
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {formatPrice(item.total_price)}
                        </div>
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <div className="text-sm text-gray-500">
                        and {order.items.length - 3} more items
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="border-t border-gray-200 pt-6 mt-6">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                      Total:{" "}
                      <span className="font-semibold text-gray-900">
                        {formatPrice(order.final_amount)}
                      </span>
                    </div>
                    <div className="flex space-x-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadPDF(order)}
                        leftIcon={<DocumentArrowDownIcon className="h-4 w-4" />}
                      >
                        Download
                      </Button>
                      <Link to={`/orders/${order.order_id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          leftIcon={<EyeIcon className="h-4 w-4" />}
                        >
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Orders;
