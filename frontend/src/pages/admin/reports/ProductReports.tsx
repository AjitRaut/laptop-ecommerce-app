import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShoppingBagIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  CurrencyRupeeIcon,
} from '@heroicons/react/24/outline';
import {
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
  useGetProductReportSummaryQuery,
  useGetProductStockReportQuery,
  useLazyExportProductReportQuery,
} from '@/store/api/reportsApi';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ReportCard from '@/components/reports/ReportCard';
import ReportFilters from '@/components/reports/ReportFilters';
import ExportButton from '@/components/reports/ExportButton';
import { formatPrice } from '@/utils/formatters';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const ProductReports: React.FC = () => {
  const [filters, setFilters] = useState<Record<string, string>>({});
  
  const { data: summaryData, isLoading: summaryLoading } = useGetProductReportSummaryQuery(filters);
  const { data: stockData, isLoading: stockLoading } = useGetProductStockReportQuery(filters);
  const [exportReport] = useLazyExportProductReportQuery();

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  if (summaryLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Products',
      value: summaryData?.summary.total_products || 0,
      icon: ShoppingBagIcon,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Active Products',
      value: summaryData?.summary.active_products || 0,
      icon: CheckCircleIcon,
      color: 'from-green-500 to-teal-500',
    },
    {
      title: 'Inactive Products',
      value: summaryData?.summary.inactive_products || 0,
      icon: XCircleIcon,
      color: 'from-gray-500 to-slate-500',
    },
    {
      title: 'Low Stock Alert',
      value: summaryData?.summary.low_stock_products || 0,
      icon: ExclamationTriangleIcon,
      color: 'from-orange-500 to-red-500',
    },
    {
      title: 'Inventory Value',
      value: formatPrice(summaryData?.summary.total_inventory_value || 0),
      icon: CurrencyRupeeIcon,
      color: 'from-purple-500 to-pink-500',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Product Reports</h1>
          <p className="text-gray-600 mt-2">Comprehensive product inventory analysis</p>
        </div>
        <ExportButton
          onExport={exportReport}
          fileName="product_report"
          label="Export Products"
        />
      </div>

      {/* Filters */}
      <ReportFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        showDateFilters={false}
        showCategoryFilter={true}
        showBrandFilter={true}
        showVendorFilter={true}
        showLowStockFilter={true}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
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
        {/* Category Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6">Products by Category</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={summaryData?.category_breakdown || []}
                dataKey="count"
                nameKey="category__name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={(entry:any) => `${entry.category__name} (${entry.count})`}
              >
                {summaryData?.category_breakdown?.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Brand Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6">Products by Brand</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={summaryData?.brand_breakdown || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="brand__name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#3b82f6" name="Products" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Vendor Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-2xl shadow-lg p-6 mb-8"
      >
        <h2 className="text-xl font-bold text-gray-900 mb-6">Products by Vendor</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Vendor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Products
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Total Stock
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {summaryData?.vendor_breakdown?.map((vendor) => (
                <tr key={vendor.vendor__id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {vendor.vendor__business_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {vendor.count}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {vendor.total_stock}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Stock Details Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-2xl shadow-lg p-6"
      >
        <h2 className="text-xl font-bold text-gray-900 mb-6">Stock Details</h2>
        {stockLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    SKU
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Min Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Value
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stockData?.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {product.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {product.sku}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {product.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.stock_quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {product.min_stock_level}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          product.is_low_stock
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {product.is_low_stock ? 'Low Stock' : 'In Stock'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatPrice(product.inventory_value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ProductReports;