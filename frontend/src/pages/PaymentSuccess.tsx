import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import Button from '@/components/common/Button';

const PaymentSuccess: React.FC = () => {
  const location = useLocation();
  const orderId = location.state?.orderId;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full text-center"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mx-auto h-16 w-16 text-green-500 mb-6"
          >
            <CheckCircleIcon />
          </motion.div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-gray-600 mb-6">
            Your order has been placed successfully. You will receive a confirmation email shortly.
          </p>

          {orderId && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600">Order ID</p>
              <p className="font-mono text-sm font-medium text-gray-900">{orderId}</p>
            </div>
          )}

          <div className="space-y-3">
            {orderId && (
              <Link to={`/orders/${orderId}`}>
                <Button fullWidth>View Order Details</Button>
              </Link>
            )}
            <Link to="/orders">
              <Button variant="outline" fullWidth>View All Orders</Button>
            </Link>
            <Link to="/products">
              <Button variant="ghost" fullWidth>Continue Shopping</Button>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentSuccess;
