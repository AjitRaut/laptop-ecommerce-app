import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CurrencyRupeeIcon,
  ShoppingCartIcon,
  ChartBarIcon,
  ReceiptPercentIcon,
  TrophyIcon,
} from '@heroicons/react/24/outline';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  ReportFiltersType,
  useGetSalesReportSummaryQuery,
  useLazyExportSalesReportQuery,
} from '@/store/api/reportsApi';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ReportCard from '@/components/reports/ReportCard';
import ReportFilters from '@/components/reports/ReportFilters';
import ExportButton from '@/components/reports/ExportButton';
import { formatPrice } from '@/utils/formatters';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const SalesReports: React.FC = () => {
  const [filters, setFilters] = useState<ReportFiltersType>({});
  
  const { data, isLoading, isFetching } = useGetSalesReportSummaryQuery(filters);
  const [exportReport] = useLazyExportSalesReportQuery();

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      
      if (value) {
        newFilters[key as keyof ReportFiltersType] = value as any;
      } else {
        delete newFilters[key as keyof ReportFiltersType];
      }
      
      return newFilters;
    });
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  const handleExport = async () => {
    return exportReport(filters);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Revenue',
      value: formatPrice(data?.summary.total_revenue || 0),
      icon: CurrencyRupeeIcon,
      color: 'from-green-500 to-teal-500',
    },
    {
      title: 'Total Orders',
      value: data?.summary.total_orders || 0,
      icon: ShoppingCartIcon,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Average Order Value',
      value: formatPrice(data?.summary.average_order_value || 0),
      icon: ChartBarIcon,
      color: 'from-purple-500 to-pink-500',
    },
    {
      title: 'Tax Collected',
      value: formatPrice(data?.summary.total_tax_collected || 0),
      icon: ReceiptPercentIcon,
      color: 'from-orange-500 to-red-500',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sales & Revenue Reports</h1>
          <p className="text-gray-600 mt-2">Comprehensive revenue and sales analytics</p>
        </div>
        <ExportButton
          onExport={handleExport}
          fileName="sales_report"
          label="Export Sales"
        />
      </div>

      {/* Filters */}
      <ReportFilters
        filters={filters as any}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        showPeriodFilter={true}
        showDateFilters={true}
      />

      {/* Loading overlay */}
      {isFetching && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
          <LoadingSpinner size="sm" />
          <span className="text-sm text-blue-800">Updating report...</span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <ReportCard
            key={stat.title}
            {...stat}
            delay={index * 0.1}
          />
        ))}
      </div>

      {/* Additional Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <h3 className="text-sm font-medium text-gray-600 mb-2">Shipping Revenue</h3>
          <p className="text-2xl font-bold text-gray-900">
            {formatPrice(data?.summary.total_shipping_revenue || 0)}
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <h3 className="text-sm font-medium text-gray-600 mb-2">Discounts Given</h3>
          <p className="text-2xl font-bold text-red-600">
            {formatPrice(data?.summary.total_discounts_given || 0)}
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <h3 className="text-sm font-medium text-gray-600 mb-2">Net Revenue</h3>
          <p className="text-2xl font-bold text-green-600">
            {formatPrice(data?.summary.net_revenue || 0)}
          </p>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Payment Methods */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6">Payment Methods</h2>
          {data?.payment_methods && data.payment_methods.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.payment_methods}
                  dataKey="revenue"
                  nameKey="payment_method"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry: any) => `${entry.payment_method} (${formatPrice(entry.revenue)})`}
                >
                  {data.payment_methods.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatPrice(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No payment data available
            </div>
          )}
        </motion.div>

        {/* Monthly Revenue */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6">Monthly Revenue Trend</h2>
          {data?.monthly_revenue && data.monthly_revenue.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.monthly_revenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatPrice(Number(value))} />
                <Legend />
                <Bar dataKey="revenue" fill="#10b981" name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No monthly data available
            </div>
          )}
        </motion.div>
      </div>

      {/* Daily Revenue Trend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="bg-white rounded-2xl shadow-lg p-6 mb-8"
      >
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Daily Revenue Trend
          {filters.period && (
            <span className="text-sm font-normal text-gray-600 ml-2">
              ({filters.period.replace(/_/g, ' ')})
            </span>
          )}
        </h2>
        {data?.daily_revenue && data.daily_revenue.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={data.daily_revenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip
                formatter={(value, name) => {
                  if (name === 'Revenue') return formatPrice(Number(value));
                  return value;
                }}
              />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="orders"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Orders"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="revenue"
                stroke="#10b981"
                strokeWidth={2}
                name="Revenue"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-80 text-gray-500">
            No daily revenue data available
          </div>
        )}
      </motion.div>

      {/* Top Revenue Products */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
        className="bg-white rounded-2xl shadow-lg p-6"
      >
        <div className="flex items-center gap-2 mb-6">
          <TrophyIcon className="h-6 w-6 text-yellow-500" />
          <h2 className="text-xl font-bold text-gray-900">Top Revenue Products</h2>
        </div>
        {data?.top_revenue_products && data.top_revenue_products.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.top_revenue_products.map((product, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold text-sm">
                        {index + 1}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {product.product__name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {product.product__sku}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {product.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      {formatPrice(product.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex items-center justify-center py-12 text-gray-500">
            No product revenue data available
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default SalesReports;