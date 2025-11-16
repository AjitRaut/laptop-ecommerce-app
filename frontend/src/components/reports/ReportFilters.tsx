import React from 'react';
import { FunnelIcon, XMarkIcon, CalendarIcon, ClockIcon } from '@heroicons/react/24/outline';
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
  showPeriodFilter?: boolean;
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
  showPeriodFilter = true,
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

  // Period options
  const periodOptions = [
    { label: 'All Time', value: '' },
    { label: 'Today', value: 'today' },
    { label: 'Yesterday', value: 'yesterday' },
    { label: 'This Week', value: 'this_week' },
    { label: 'Last Week', value: 'last_week' },
    { label: 'This Month', value: 'this_month' },
    { label: 'Last Month', value: 'last_month' },
    { label: 'This Year', value: 'this_year' },
    { label: 'Last Year', value: 'last_year' },
    { label: 'Last 7 Days', value: 'last_7_days' },
    { label: 'Last 30 Days', value: 'last_30_days' },
    { label: 'Last 90 Days', value: 'last_90_days' },
  ];

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

  const handlePeriodChange = (value: string) => {
    if (value) {
      // Set period and clear custom date filters
      onFilterChange('period', value);
      onFilterChange('date_from', '');
      onFilterChange('date_to', '');
    } else {
      // Clear period filter
      onFilterChange('period', '');
    }
  };

  const isPeriodActive = filters.period && filters.period !== '';

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
        {/* Period Filter */}
        {showPeriodFilter && (
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <ClockIcon className="h-4 w-4" />
              Time Period
            </label>
            <select
              value={filters.period || ''}
              onChange={(e) => handlePeriodChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {periodOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Date Filters - Only show if period is not active */}
        {showDateFilters && !isPeriodActive && (
          <>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <CalendarIcon className="h-4 w-4" />
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
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <CalendarIcon className="h-4 w-4" />
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

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-2">Active filters:</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(filters).map(([key, value]) => {
              if (!value) return null;
              
              // Get readable label for period
              let displayValue = value;
              if (key === 'period') {
                const option = periodOptions.find(opt => opt.value === value);
                displayValue = option?.label || value;
              }
              
              return (
                <span
                  key={key}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                >
                  <span className="font-medium">{key.replace(/_/g, ' ')}:</span>
                  <span>{displayValue}</span>
                  <button
                    onClick={() => onFilterChange(key, '')}
                    className="ml-1 hover:text-blue-900"
                  >
                    <XMarkIcon className="h-3 w-3" />
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Helper Text */}
      {showPeriodFilter && isPeriodActive && showDateFilters && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <span className="font-medium">📅 Tip:</span> Period filter is active. Custom date range is disabled. Select "All Time" to use custom dates.
          </p>
        </div>
      )}
    </div>
  );
};

export default ReportFilters;