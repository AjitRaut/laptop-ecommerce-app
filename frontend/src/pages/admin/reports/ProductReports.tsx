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
  
  const { data: summaryData, isLoading: summaryLoading, isFetching: summaryFetching } = useGetProductReportSummaryQuery(filters);
  const { data: stockData, isLoading: stockLoading, isFetching: stockFetching } = useGetProductStockReportQuery(filters);
  const [exportReport] = useLazyExportProductReportQuery();

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      
      if (value) {
        newFilters[key] = value;
      } else {
        delete newFilters[key];
      }
      
      return newFilters;
    });
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  const handleExport = async () => {
    return exportReport(filters as any);
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

  const isFetching = summaryFetching || stockFetching;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Product Reports</h1>
          <p className="text-gray-600 mt-2">
            Comprehensive product inventory analysis
            {filters.period && (
              <span className="ml-2 text-sm font-medium text-blue-600">
                ({filters.period.replace(/_/g, ' ')})
              </span>
            )}
          </p>
        </div>
        <ExportButton
          onExport={handleExport}
          fileName="product_report"
          label="Export PDF"
          fileType="pdf"
        />
      </div>

      {/* Filters */}
      <ReportFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        showPeriodFilter={true}
        showDateFilters={true}
        showCategoryFilter={true}
        showBrandFilter={true}
        showVendorFilter={true}
        showLowStockFilter={true}
      />

      {/* Loading overlay when refetching */}
      {isFetching && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
          <LoadingSpinner size="sm" />
          <span className="text-sm text-blue-800">Updating report...</span>
        </div>
      )}

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
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Products by Category
            {filters.period && (
              <span className="text-sm font-normal text-gray-600 ml-2">
                (added {filters.period.replace(/_/g, ' ')})
              </span>
            )}
          </h2>
          {summaryData?.category_breakdown && summaryData.category_breakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={summaryData.category_breakdown}
                  dataKey="count"
                  nameKey="category__name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry:any) => `${entry.category__name} (${entry.count})`}
                >
                  {summaryData.category_breakdown.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <div className="text-center">
                <ShoppingBagIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No category data available for selected period</p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Brand Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Products by Brand
            {filters.period && (
              <span className="text-sm font-normal text-gray-600 ml-2">
                (added {filters.period.replace(/_/g, ' ')})
              </span>
            )}
          </h2>
          {summaryData?.brand_breakdown && summaryData.brand_breakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={summaryData.brand_breakdown}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="brand__name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#3b82f6" name="Products" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <div className="text-center">
                <ShoppingBagIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No brand data available for selected period</p>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Vendor Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-2xl shadow-lg p-6 mb-8"
      >
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Products by Vendor
          {filters.period && (
            <span className="text-sm font-normal text-gray-600 ml-2">
              (added {filters.period.replace(/_/g, ' ')})
            </span>
          )}
        </h2>
        {summaryData?.vendor_breakdown && summaryData.vendor_breakdown.length > 0 ? (
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
                {summaryData.vendor_breakdown.map((vendor) => (
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
        ) : (
          <div className="flex items-center justify-center py-12 text-gray-500">
            <div className="text-center">
              <ShoppingBagIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No vendor data available for selected period</p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Stock Details Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-2xl shadow-lg p-6"
      >
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Stock Details
          {filters.period && (
            <span className="text-sm font-normal text-gray-600 ml-2">
              (products added {filters.period.replace(/_/g, ' ')})
            </span>
          )}
        </h2>
        {stockLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : stockData && stockData.length > 0 ? (
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
                {stockData.map((product) => (
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
        ) : (
          <div className="flex items-center justify-center py-12 text-gray-500">
            <div className="text-center">
              <ShoppingBagIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No products found for selected filters</p>
              <p className="text-sm mt-2">Try adjusting your filters or select a different period</p>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ProductReports;