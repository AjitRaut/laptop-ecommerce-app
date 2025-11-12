import React from 'react';
import { FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Button from '@/components/common/Button';

interface FilterOption {
  label: string;
  value: string;
}

interface ReportFiltersProps {
  filters: Record<string, string>;
  onFilterChange: (key: string, value: string) => void;
  onClearFilters: () => void;
  showDateFilters?: boolean;
  showCategoryFilter?: boolean;
  showBrandFilter?: boolean;
  showVendorFilter?: boolean;
  showStatusFilter?: boolean;
  showPaymentStatusFilter?: boolean;
  showLowStockFilter?: boolean;
  categories?: FilterOption[];
  brands?: FilterOption[];
  vendors?: FilterOption[];
}

const ReportFilters: React.FC<ReportFiltersProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  showDateFilters = true,
  showCategoryFilter = false,
  showBrandFilter = false,
  showVendorFilter = false,
  showStatusFilter = false,
  showPaymentStatusFilter = false,
  showLowStockFilter = false,
  categories = [],
  brands = [],
  vendors = [],
}) => {
  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  const orderStatuses = [
    { label: 'Pending', value: 'pending' },
    { label: 'Confirmed', value: 'confirmed' },
    { label: 'Processing', value: 'processing' },
    { label: 'Shipped', value: 'shipped' },
    { label: 'Delivered', value: 'delivered' },
    { label: 'Cancelled', value: 'cancelled' },
  ];

  const paymentStatuses = [
    { label: 'Paid', value: 'paid' },
    { label: 'Pending', value: 'pending' },
    { label: 'Failed', value: 'failed' },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FunnelIcon className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            leftIcon={<XMarkIcon className="h-4 w-4" />}
          >
            Clear All
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Date Filters */}
        {showDateFilters && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From Date
              </label>
              <input
                type="date"
                value={filters.date_from || ''}
                onChange={(e) => onFilterChange('date_from', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                To Date
              </label>
              <input
                type="date"
                value={filters.date_to || ''}
                onChange={(e) => onFilterChange('date_to', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </>
        )}

        {/* Category Filter */}
        {showCategoryFilter && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={filters.category || ''}
              onChange={(e) => onFilterChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Brand Filter */}
        {showBrandFilter && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Brand
            </label>
            <select
              value={filters.brand || ''}
              onChange={(e) => onFilterChange('brand', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Brands</option>
              {brands.map((brand) => (
                <option key={brand.value} value={brand.value}>
                  {brand.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Vendor Filter */}
        {showVendorFilter && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vendor
            </label>
            <select
              value={filters.vendor || ''}
              onChange={(e) => onFilterChange('vendor', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Vendors</option>
              {vendors.map((vendor) => (
                <option key={vendor.value} value={vendor.value}>
                  {vendor.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Order Status Filter */}
        {showStatusFilter && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Order Status
            </label>
            <select
              value={filters.status || ''}
              onChange={(e) => onFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              {orderStatuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Payment Status Filter */}
        {showPaymentStatusFilter && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Status
            </label>
            <select
              value={filters.payment_status || ''}
              onChange={(e) => onFilterChange('payment_status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Payment Statuses</option>
              {paymentStatuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Low Stock Filter */}
        {showLowStockFilter && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stock Status
            </label>
            <select
              value={filters.is_low_stock || ''}
              onChange={(e) => onFilterChange('is_low_stock', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Products</option>
              <option value="true">Low Stock Only</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportFilters;