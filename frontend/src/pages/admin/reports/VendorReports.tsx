import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BuildingStorefrontIcon,
  ShoppingBagIcon,
  CurrencyRupeeIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  useGetVendorPerformanceQuery,
  useGetSalesByVendorQuery,
  useLazyExportVendorReportQuery,
} from '@/store/api/reportsApi';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ReportFilters from '@/components/reports/ReportFilters';
import ExportButton from '@/components/reports/ExportButton';
import { formatPrice } from '@/utils/formatters';

const VendorReports: React.FC = () => {
  const [filters, setFilters] = useState<Record<string, string>>({});
  
  const { data: performanceData, isLoading: performanceLoading } = useGetVendorPerformanceQuery();
  const { data: salesData, isLoading: salesLoading } = useGetSalesByVendorQuery(filters);
  const [exportReport] = useLazyExportVendorReportQuery();

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  if (performanceLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Calculate totals
  const totalVendors = performanceData?.length || 0;
  const totalProducts = performanceData?.reduce((sum, v) => sum + v.total_products, 0) || 0;
  const totalSales = performanceData?.reduce((sum, v) => sum + v.total_sales, 0) || 0;
  const totalCommission = performanceData?.reduce((sum, v) => sum + v.vendor_commission, 0) || 0;

  // Prepare chart data
  const chartData = performanceData?.slice(0, 10).map(vendor => ({
    name: vendor.vendor_name,
    sales: vendor.total_sales,
    commission: vendor.vendor_commission,
    products: vendor.total_products,
  })) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vendor Reports</h1>
          <p className="text-gray-600 mt-2">Vendor performance and sales analytics</p>
        </div>
        <ExportButton
          onExport={exportReport}
          fileName="vendor_report"
          label="Export Vendors"
        />
      </div>

      {/* Filters */}
      <ReportFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        showDateFilters={true}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
              <BuildingStorefrontIcon className="h-6 w-6 text-white" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{totalVendors}</h3>
          <p className="text-sm text-gray-600">Total Vendors</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-green-500 to-teal-500 flex items-center justify-center">
              <ShoppingBagIcon className="h-6 w-6 text-white" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{totalProducts}</h3>
          <p className="text-sm text-gray-600">Total Products</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
              <CurrencyRupeeIcon className="h-6 w-6 text-white" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{formatPrice(totalSales)}</h3>
          <p className="text-sm text-gray-600">Total Sales</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
              <ChartBarIcon className="h-6 w-6 text-white" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{formatPrice(totalCommission)}</h3>
          <p className="text-sm text-gray-600">Total Commission</p>
        </motion.div>
      </div>

      {/* Top Vendors Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl shadow-lg p-6 mb-8"
      >
        <h2 className="text-xl font-bold text-gray-900 mb-6">Top Vendors by Sales</h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
            <YAxis />
            <Tooltip formatter={(value) => formatPrice(Number(value))} />
            <Legend />
            <Bar dataKey="sales" fill="#3b82f6" name="Sales" />
            <Bar dataKey="commission" fill="#10b981" name="Commission" />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Sales by Vendor Table */}
      {salesLoading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-8"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6">Sales by Vendor</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Vendor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Orders
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Items Sold
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Total Sales
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Commission Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Vendor Commission
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Admin Revenue
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {salesData?.map((vendor) => (
                  <tr key={vendor.vendor_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {vendor.vendor_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {vendor.vendor_email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {vendor.total_orders}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {vendor.total_items_sold}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatPrice(vendor.total_sales)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {vendor.commission_rate}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      {formatPrice(vendor.vendor_commission)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                      {formatPrice(vendor.admin_revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Vendor Performance Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-2xl shadow-lg p-6"
      >
        <h2 className="text-xl font-bold text-gray-900 mb-6">Vendor Performance</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Vendor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Total Products
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Active Products
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Total Orders
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Pending Orders
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Total Sales
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Joined Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {performanceData?.map((vendor) => (
                <tr key={vendor.vendor_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {vendor.vendor_name}
                      </div>
                      <div className="text-xs text-gray-500">{vendor.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {vendor.total_products}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {vendor.active_products}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {vendor.total_orders}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {vendor.pending_orders}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatPrice(vendor.total_sales)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(vendor.joined_date).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default VendorReports;