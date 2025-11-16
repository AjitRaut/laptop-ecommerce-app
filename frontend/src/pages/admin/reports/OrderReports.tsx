import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShoppingCartIcon,
  CurrencyRupeeIcon,
  ChartBarIcon,
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
  useGetOrderReportSummaryQuery,
  useLazyExportOrderReportQuery,
} from '@/store/api/reportsApi';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ReportCard from '@/components/reports/ReportCard';
import ReportFilters from '@/components/reports/ReportFilters';
import ExportButton from '@/components/reports/ExportButton';
import { formatPrice } from '@/utils/formatters';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const OrderReports: React.FC = () => {
  const [filters, setFilters] = useState<ReportFiltersType>({});
  
  const { data, isLoading, isFetching } = useGetOrderReportSummaryQuery(filters);
  const [exportReport] = useLazyExportOrderReportQuery();

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
      title: 'Total Orders',
      value: data?.summary.total_orders || 0,
      icon: ShoppingCartIcon,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Total Revenue',
      value: formatPrice(data?.summary.total_revenue || 0),
      icon: CurrencyRupeeIcon,
      color: 'from-green-500 to-teal-500',
    },
    {
      title: 'Average Order Value',
      value: formatPrice(data?.summary.average_order_value || 0),
      icon: ChartBarIcon,
      color: 'from-purple-500 to-pink-500',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Order Reports</h1>
          <p className="text-gray-600 mt-2">Sales and order analytics</p>
        </div>
        <ExportButton
          onExport={handleExport}
          fileName="order_report"
          label="Export Orders"
        />
      </div>

      {/* Filters - Now includes period filter */}
      <ReportFilters
        filters={filters as any}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        showPeriodFilter={true}
        showDateFilters={true}
        showStatusFilter={true}
        showPaymentStatusFilter={true}
      />

      {/* Loading overlay when refetching */}
      {isFetching && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
          <LoadingSpinner size="sm" />
          <span className="text-sm text-blue-800">Updating report...</span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <ReportCard
            key={stat.title}
            {...stat}
            delay={index * 0.1}
          />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Order Status Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6">Order Status Distribution</h2>
          {data?.status_breakdown && data.status_breakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.status_breakdown}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry:any) => `${entry.status} (${entry.count})`}
                >
                  {data.status_breakdown.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No data available for selected period
            </div>
          )}
        </motion.div>

        {/* Payment Status Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6">Payment Status</h2>
          {data?.payment_breakdown && data.payment_breakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.payment_breakdown}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="payment_status" />
                <YAxis />
                <Tooltip formatter={(value) => formatPrice(Number(value))} />
                <Legend />
                <Bar dataKey="count" fill="#3b82f6" name="Orders" />
                <Bar dataKey="total" fill="#10b981" name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No data available for selected period
            </div>
          )}
        </motion.div>
      </div>

      {/* Daily Sales Trend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-2xl shadow-lg p-6 mb-8"
      >
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Daily Sales Trend 
          {filters.period && (
            <span className="text-sm font-normal text-gray-600 ml-2">
              ({filters.period.replace(/_/g, ' ')})
            </span>
          )}
        </h2>
        {data?.daily_sales && data.daily_sales.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={data.daily_sales}>
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
            No sales data available for selected period
          </div>
        )}
      </motion.div>

      {/* Top Selling Products */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-2xl shadow-lg p-6"
      >
        <div className="flex items-center gap-2 mb-6">
          <TrophyIcon className="h-6 w-6 text-yellow-500" />
          <h2 className="text-xl font-bold text-gray-900">Top Selling Products</h2>
        </div>
        {data?.top_products && data.top_products.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Quantity Sold
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Revenue
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.top_products.map((product, index) => (
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
                      {product.quantity_sold}
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
            No products sold in selected period
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default OrderReports;