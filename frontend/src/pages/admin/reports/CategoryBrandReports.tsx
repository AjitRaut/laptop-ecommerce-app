import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  TagIcon,
  SparklesIcon,
  ChartBarIcon,
  TrophyIcon,
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
  ReportFiltersType,
  useGetCategoryBrandReportQuery,
  useLazyExportCategoryBrandReportQuery,
} from '@/store/api/reportsApi';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ReportFilters from '@/components/reports/ReportFilters';
import ExportButton from '@/components/reports/ExportButton';
import { formatPrice } from '@/utils/formatters';

const CategoryBrandReports: React.FC = () => {
  const [filters, setFilters] = useState<ReportFiltersType>({});
  
  const { data, isLoading, isFetching } = useGetCategoryBrandReportQuery(filters);
  const [exportReport] = useLazyExportCategoryBrandReportQuery();

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

  // Prepare chart data
  const categoryChartData = data?.category_performance.slice(0, 10).map(cat => ({
    name: cat.category_name,
    products: cat.total_products,
    revenue: cat.revenue,
    units_sold: cat.units_sold,
  })) || [];

  const brandChartData = data?.brand_performance.slice(0, 10).map(brand => ({
    name: brand.brand_name,
    products: brand.total_products,
    revenue: brand.revenue,
    units_sold: brand.units_sold,
  })) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Category & Brand Analytics</h1>
          <p className="text-gray-600 mt-2">Performance analysis by category and brand</p>
        </div>
        <ExportButton
          onExport={handleExport}
          fileName="category_brand_report"
          label="Export Report"
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

      {/* Category Performance Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl shadow-lg p-6 mb-8"
      >
        <div className="flex items-center gap-2 mb-6">
          <TagIcon className="h-6 w-6 text-blue-500" />
          <h2 className="text-xl font-bold text-gray-900">Top Categories by Revenue</h2>
        </div>
        {categoryChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={categoryChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip formatter={(value, name) => {
                if (name === 'Revenue') return formatPrice(Number(value));
                return value;
              }} />
              <Legend />
              <Bar dataKey="revenue" fill="#3b82f6" name="Revenue" />
              <Bar dataKey="units_sold" fill="#10b981" name="Units Sold" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-96 text-gray-500">
            No category data available
          </div>
        )}
      </motion.div>

      {/* Category Performance Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl shadow-lg p-6 mb-8"
      >
        <div className="flex items-center gap-2 mb-6">
          <ChartBarIcon className="h-6 w-6 text-indigo-500" />
          <h2 className="text-xl font-bold text-gray-900">Category Performance Details</h2>
        </div>
        {data?.category_performance && data.category_performance.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Products</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Active</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Units Sold</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.category_performance.map((category, index) => (
                  <tr key={category.category_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {category.category_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {category.total_products}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {category.active_products}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {category.total_stock}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {category.units_sold}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      {formatPrice(category.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex items-center justify-center py-12 text-gray-500">
            No category data available
          </div>
        )}
      </motion.div>

      {/* Brand Performance Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl shadow-lg p-6 mb-8"
      >
        <div className="flex items-center gap-2 mb-6">
          <SparklesIcon className="h-6 w-6 text-purple-500" />
          <h2 className="text-xl font-bold text-gray-900">Top Brands by Revenue</h2>
        </div>
        {brandChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={brandChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip formatter={(value, name) => {
                if (name === 'Revenue') return formatPrice(Number(value));
                return value;
              }} />
              <Legend />
              <Bar dataKey="revenue" fill="#8b5cf6" name="Revenue" />
              <Bar dataKey="units_sold" fill="#ec4899" name="Units Sold" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-96 text-gray-500">
            No brand data available
          </div>
        )}
      </motion.div>

      {/* Brand Performance Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-2xl shadow-lg p-6"
      >
        <div className="flex items-center gap-2 mb-6">
          <TrophyIcon className="h-6 w-6 text-yellow-500" />
          <h2 className="text-xl font-bold text-gray-900">Brand Performance Details</h2>
        </div>
        {data?.brand_performance && data.brand_performance.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Brand</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Products</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Active</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Units Sold</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.brand_performance.map((brand, index) => (
                  <tr key={brand.brand_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold text-sm">
                        {index + 1}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {brand.brand_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {brand.total_products}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {brand.active_products}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {brand.units_sold}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      {formatPrice(brand.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex items-center justify-center py-12 text-gray-500">
            No brand data available
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default CategoryBrandReports;