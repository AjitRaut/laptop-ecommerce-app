import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShoppingBagIcon,
  ShoppingCartIcon,
  BuildingStorefrontIcon,
  ClockIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { useGetReportLogsQuery } from '@/store/api/reportsApi';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const ReportsOverview: React.FC = () => {
  const { data: reportLogs, isLoading } = useGetReportLogsQuery();

  const reportCards = [
    {
      title: 'Product Reports',
      description: 'View inventory, stock levels, and product analytics',
      icon: ShoppingBagIcon,
      color: 'from-blue-500 to-cyan-500',
      link: '/admin/dashboard/reports/products',
      stats: ['Inventory Value', 'Low Stock Alerts', 'Category Breakdown'],
    },
    {
      title: 'Order Reports',
      description: 'Analyze sales trends, revenue, and order metrics',
      icon: ShoppingCartIcon,
      color: 'from-green-500 to-teal-500',
      link: '/admin/dashboard/reports/orders',
      stats: ['Total Revenue', 'Order Status', 'Top Products'],
    },
    {
      title: 'Vendor Reports',
      description: 'Track vendor performance and commission analytics',
      icon: BuildingStorefrontIcon,
      color: 'from-purple-500 to-pink-500',
      link: '/admin/dashboard/reports/vendors',
      stats: ['Sales by Vendor', 'Commission Breakdown', 'Performance Metrics'],
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-600 mt-2">
          Comprehensive business intelligence and reporting dashboard
        </p>
      </div>

      {/* Report Type Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {reportCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link to={card.link}>
              <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all hover:scale-105 cursor-pointer h-full">
                <div className={`w-14 h-14 rounded-lg bg-gradient-to-r ${card.color} flex items-center justify-center mb-4`}>
                  <card.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{card.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{card.description}</p>
                <div className="space-y-2">
                  {card.stats.map((stat) => (
                    <div key={stat} className="flex items-center gap-2 text-sm text-gray-500">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                      {stat}
                    </div>
                  ))}
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
      >
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100">
          <div className="flex items-center gap-3 mb-3">
            <DocumentTextIcon className="h-6 w-6 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Export Options</h3>
          </div>
          <p className="text-sm text-gray-600">
            Download comprehensive CSV reports for all data types with customizable filters
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl p-6 border border-green-100">
          <div className="flex items-center gap-3 mb-3">
            <ClockIcon className="h-6 w-6 text-green-600" />
            <h3 className="font-semibold text-gray-900">Real-time Data</h3>
          </div>
          <p className="text-sm text-gray-600">
            All reports reflect live data with up-to-the-minute accuracy and insights
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
          <div className="flex items-center gap-3 mb-3">
            <ShoppingBagIcon className="h-6 w-6 text-purple-600" />
            <h3 className="font-semibold text-gray-900">Advanced Filters</h3>
          </div>
          <p className="text-sm text-gray-600">
            Filter by date range, category, vendor, status, and more for detailed analysis
          </p>
        </div>
      </motion.div>

      {/* Recent Report History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl shadow-lg p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Recent Report Activity</h2>
          <span className="text-sm text-gray-500">Last 10 reports</span>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : reportLogs && reportLogs.length > 0 ? (
          <div className="space-y-3">
            {reportLogs.slice(0, 10).map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    log.report_type === 'product' ? 'bg-blue-100 text-blue-600' :
                    log.report_type === 'order' ? 'bg-green-100 text-green-600' :
                    'bg-purple-100 text-purple-600'
                  }`}>
                    {log.report_type === 'product' ? (
                      <ShoppingBagIcon className="h-5 w-5" />
                    ) : log.report_type === 'order' ? (
                      <ShoppingCartIcon className="h-5 w-5" />
                    ) : (
                      <BuildingStorefrontIcon className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 capitalize">
                      {log.report_type} Report
                    </p>
                    <p className="text-sm text-gray-500">
                      Generated by {log.generated_by_name}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">
                    {new Date(log.created_at).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(log.created_at).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <DocumentTextIcon className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <p>No report history yet</p>
            <p className="text-sm">Generate your first report to see activity here</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ReportsOverview;