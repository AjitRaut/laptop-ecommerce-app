import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShoppingBagIcon,
  ShoppingCartIcon,
  BuildingStorefrontIcon,
  ClockIcon,
  DocumentTextIcon,
  CalendarIcon,
  FunnelIcon,
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

  const features = [
    {
      icon: CalendarIcon,
      title: 'Period Filters',
      description: 'Quick access to daily, weekly, monthly, and yearly reports with one click',
      gradient: 'from-blue-50 to-cyan-50',
      border: 'border-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      icon: FunnelIcon,
      title: 'Advanced Filters',
      description: 'Filter by date range, category, vendor, status, and more for detailed analysis',
      gradient: 'from-purple-50 to-pink-50',
      border: 'border-purple-100',
      iconColor: 'text-purple-600',
    },
    {
      icon: DocumentTextIcon,
      title: 'Export Options',
      description: 'Download comprehensive PDF reports with all filters applied for offline analysis',
      gradient: 'from-orange-50 to-red-50',
      border: 'border-orange-100',
      iconColor: 'text-orange-600',
    },
    {
      icon: ClockIcon,
      title: 'Real-time Data',
      description: 'All reports reflect live data with up-to-the-minute accuracy and insights',
      gradient: 'from-green-50 to-teal-50',
      border: 'border-green-100',
      iconColor: 'text-green-600',
    },
  ];

  // Get period filter label from report log
  const getPeriodLabel = (filters: any) => {
    if (!filters || !filters.period) return null;
    
    const periodLabels: Record<string, string> = {
      'today': 'Today',
      'yesterday': 'Yesterday',
      'this_week': 'This Week',
      'last_week': 'Last Week',
      'this_month': 'This Month',
      'last_month': 'Last Month',
      'this_year': 'This Year',
      'last_year': 'Last Year',
      'last_7_days': 'Last 7 Days',
      'last_30_days': 'Last 30 Days',
      'last_90_days': 'Last 90 Days',
    };
    
    return periodLabels[filters.period] || filters.period;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-600 mt-2">
          Comprehensive business intelligence and reporting dashboard with flexible time periods
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

      {/* Features Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            className={`bg-gradient-to-br ${feature.gradient} rounded-2xl p-6 border ${feature.border}`}
          >
            <div className="flex items-center gap-3 mb-3">
              <feature.icon className={`h-6 w-6 ${feature.iconColor}`} />
              <h3 className="font-semibold text-gray-900">{feature.title}</h3>
            </div>
            <p className="text-sm text-gray-600">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* Time Period Options Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl p-6 mb-8 border border-indigo-100"
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
            <CalendarIcon className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Available Time Periods</h3>
            <p className="text-sm text-gray-700 mb-3">
              Filter reports by any of these convenient time periods or use custom date ranges:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                'Today', 'Yesterday', 'This Week', 'Last Week',
                'This Month', 'Last Month', 'This Year', 'Last Year',
                'Last 7 Days', 'Last 30 Days', 'Last 90 Days', 'Custom Range'
              ].map((period) => (
                <div
                  key={period}
                  className="flex items-center gap-2 text-sm text-gray-700 bg-white/50 rounded-lg px-3 py-2"
                >
                  <ClockIcon className="h-4 w-4 text-indigo-500" />
                  <span className="font-medium">{period}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Recent Report History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
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
            {reportLogs.slice(0, 10).map((log) => {
              const periodLabel = getPeriodLabel(log.filters);
              
              return (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
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
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 capitalize">
                        {log.report_type} Report
                        {periodLabel && (
                          <span className="ml-2 text-xs font-normal text-blue-600 bg-blue-50 px-2 py-1 rounded">
                            {periodLabel}
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-gray-500">
                        Generated by {log.generated_by_name}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <p className="text-sm text-gray-600">
                      {new Date(log.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(log.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              );
            })}
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