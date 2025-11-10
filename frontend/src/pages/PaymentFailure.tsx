import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { XCircleIcon } from '@heroicons/react/24/solid';
import Button from '@/components/common/Button';

const PaymentFailure: React.FC = () => {
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
            className="mx-auto h-16 w-16 text-red-500 mb-6"
          >
            <XCircleIcon />
          </motion.div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h1>
          <p className="text-gray-600 mb-6">
            We couldn't process your payment. Please try again or use a different payment method.
          </p>

          <div className="space-y-3">
            <Link to="/checkout">
              <Button fullWidth>Try Again</Button>
            </Link>
            <Link to="/cart">
              <Button variant="outline" fullWidth>Back to Cart</Button>
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

export default PaymentFailure;