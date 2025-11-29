import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import BASE_URL from '@/config/apiConfig';
import { RootState } from '../store';

/** ==============================
 *  Types & Interfaces
 *  ============================== */
export interface ProductReportSummary {
  summary: {
    total_products: number;
    active_products: number;
    inactive_products: number;
    low_stock_products: number;
    out_of_stock_products: number;
    total_inventory_value: number;
  };
  category_breakdown: Array<{
    category__name: string;
    count: number;
    total_value: number;
  }>;
  brand_breakdown: Array<{
    brand__name: string;
    count: number;
  }>;
  vendor_breakdown: Array<{
    vendor__business_name: string;
    vendor__id: number;
    count: number;
    total_stock: number;
  }>;
}

export interface ProductStockItem {
  id: number;
  name: string;
  sku: string;
  category: string;
  brand: string;
  vendor: string;
  stock_quantity: number;
  min_stock_level: number;
  is_low_stock: boolean;
  price: number;
  inventory_value: number;
}

export interface OrderReportSummary {
  summary: {
    total_orders: number;
    total_revenue: number;
    average_order_value: number;
  };
  status_breakdown: Array<{
    status: string;
    count: number;
  }>;
  payment_breakdown: Array<{
    payment_status: string;
    count: number;
    total: number;
  }>;
  daily_sales: Array<{
    date: string;
    orders: number;
    revenue: number;
  }>;
  top_products: Array<{
    product__name: string;
    quantity_sold: number;
    revenue: number;
  }>;
}

export interface VendorSalesReport {
  vendor_id: number;
  vendor_name: string;
  vendor_email: string;
  total_orders: number;
  total_items_sold: number;
  total_sales: number;
  commission_rate: number;
  vendor_commission: number;
  admin_revenue: number;
}

export interface VendorPerformance {
  vendor_id: number;
  vendor_name: string;
  email: string;
  phone: string;
  total_products: number;
  active_products: number;
  total_orders: number;
  pending_orders: number;
  total_sales: number;
  commission_rate: number;
  vendor_commission: number;
  joined_date: string;
}

export interface UserReportSummary {
  summary: {
    total_users: number;
    active_users: number;
    inactive_users: number;
    customers: number;
    vendors: number;
    admins: number;
    customers_with_orders: number;
  };
  top_customers: Array<{
    user__id: number;
    user__email: string;
    user__first_name: string;
    user__last_name: string;
    total_orders: number;
    total_spent: number;
  }>;
}

export interface SalesReportSummary {
  summary: {
    total_revenue: number;
    total_orders: number;
    average_order_value: number;
    total_tax_collected: number;
    total_shipping_revenue: number;
    total_discounts_given: number;
    net_revenue: number;
  };
  payment_methods: Array<{
    payment_method: string;
    count: number;
    revenue: number;
  }>;
  daily_revenue: Array<{
    date: string;
    orders: number;
    revenue: number;
  }>;
  monthly_revenue: Array<{
    month: number;
    orders: number;
    revenue: number;
  }>;
  top_revenue_products: Array<{
    product__name: string;
    product__sku: string;
    quantity: number;
    revenue: number;
  }>;
}

export interface CustomerReportSummary {
  summary: {
    total_customers: number;
    active_customers: number;
    verified_customers: number;
    customers_with_orders: number;
    one_time_buyers: number;
    repeat_customers: number;
    loyal_customers: number;
  };
  top_customers: Array<{
    user__id: number;
    user__email: string;
    user__first_name: string;
    user__last_name: string;
    total_orders: number;
    total_spent: number;
    avg_order_value: number;
  }>;
  location_breakdown: Array<{
    city: string;
    state: string;
    count: number;
  }>;
}

export interface CategoryBrandReport {
  category_performance: Array<{
    category_id: number;
    category_name: string;
    total_products: number;
    active_products: number;
    total_stock: number;
    units_sold: number;
    revenue: number;
  }>;
  brand_performance: Array<{
    brand_id: number;
    brand_name: string;
    total_products: number;
    active_products: number;
    units_sold: number;
    revenue: number;
  }>;
}

export interface IndividualVendorReport {
  vendor_info: {
    id: number;
    business_name: string;
    email: string;
    phone: string;
    commission_rate: number;
    joined_date: string;
    is_active: boolean;
  };
  product_summary: {
    total_products: number;
    active_products: number;
    low_stock_products: number;
    category_breakdown: Array<{
      category__name: string;
      count: number;
    }>;
  };
  sales_summary: {
    total_orders: number;
    total_items_sold: number;
    total_sales: number;
    vendor_commission: number;
    admin_share: number;
    status_breakdown: Array<{
      vendor_status: string;
      count: number;
    }>;
  };
  top_products: Array<{
    product__name: string;
    product__sku: string;
    quantity_sold: number;
    revenue: number;
  }>;
  recent_orders: Array<{
    order_id: string;
    product_name: string;
    quantity: number;
    price: number;
    total: number;
    status: string;
    order_date: string;
  }>;
}

export interface ReportLog {
  id: number;
  report_type: 'product' | 'order' | 'vendor' | 'sales' | 'user' | 'customer' | 'analytics';
  generated_by: number;
  generated_by_name: string;
  filters: any;
  file_path: string | null;
  created_at: string;
}

export type PeriodFilter = 
  | 'today' 
  | 'yesterday' 
  | 'this_week' 
  | 'last_week' 
  | 'this_month' 
  | 'last_month' 
  | 'this_year' 
  | 'last_year'
  | 'last_7_days'
  | 'last_30_days'
  | 'last_90_days';

export interface ReportFiltersType {
  period?: PeriodFilter | '';
  date_from?: string;
  date_to?: string;
  category?: string;
  brand?: string;
  vendor?: string;
  is_low_stock?: string;
  status?: string;
  payment_status?: string;
  user_type?: string;
  is_active?: string;
}

/** ==============================
 *  Reports API
 *  ============================== */
export const reportsApi = createApi({
  reducerPath: 'reportsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${BASE_URL}reports/`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) headers.set('authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['ProductReport', 'OrderReport', 'VendorReport', 'UserReport', 'SalesReport', 'CustomerReport', 'CategoryBrandReport', 'ReportLogs'],
  endpoints: (builder) => ({
    // ================= PRODUCT REPORTS =================
    getProductReportSummary: builder.query<ProductReportSummary, ReportFiltersType>({
      query: (filters) => ({
        url: 'products/summary/',
        params: filters,
      }),
      providesTags: ['ProductReport'],
    }),

    getProductStockReport: builder.query<ProductStockItem[], ReportFiltersType>({
      query: (filters) => ({
        url: 'products/stock/',
        params: filters,
      }),
      providesTags: ['ProductReport'],
    }),

    exportProductReport: builder.query<Blob, ReportFiltersType>({
      query: (filters) => ({
        url: 'products/export/pdf/',
        params: filters,
        responseHandler: (response) => response.blob(),
      }),
    }),

    // ================= ORDER REPORTS =================
    getOrderReportSummary: builder.query<OrderReportSummary, ReportFiltersType>({
      query: (filters) => ({
        url: 'orders/summary/',
        params: filters,
      }),
      providesTags: ['OrderReport'],
    }),

    getSalesByVendor: builder.query<VendorSalesReport[], ReportFiltersType>({
      query: (filters) => ({
        url: 'orders/by-vendor/',
        params: filters,
      }),
      providesTags: ['VendorReport'],
    }),

    exportOrderReport: builder.query<Blob, ReportFiltersType>({
      query: (filters) => ({
        url: 'orders/export/pdf/',
        params: filters,
        responseHandler: (response) => response.blob(),
      }),
    }),

    // ================= VENDOR REPORTS =================
    getVendorPerformance: builder.query<VendorPerformance[], ReportFiltersType>({
      query: (filters) => ({
        url: 'vendors/performance/',
        params: filters,
      }),
      providesTags: ['VendorReport'],
    }),

    exportVendorReport: builder.query<Blob, ReportFiltersType>({
      query: (filters) => ({
        url: 'vendors/export/pdf/',
        params: filters,
        responseHandler: (response) => response.blob(),
      }),
    }),

    // ================= USER REPORTS =================
    getUserReportSummary: builder.query<UserReportSummary, ReportFiltersType>({
      query: (filters) => ({
        url: 'users/summary/',
        params: filters,
      }),
      providesTags: ['UserReport'],
    }),

    exportUserReport: builder.query<Blob, ReportFiltersType>({
      query: (filters) => ({
        url: 'users/export/pdf/',
        params: filters,
        responseHandler: (response) => response.blob(),
      }),
    }),

    // ================= SALES REPORTS =================
    getSalesReportSummary: builder.query<SalesReportSummary, ReportFiltersType>({
      query: (filters) => ({
        url: 'sales/summary/',
        params: filters,
      }),
      providesTags: ['SalesReport'],
    }),

    exportSalesReport: builder.query<Blob, ReportFiltersType>({
      query: (filters) => ({
        url: 'sales/export/pdf/',
        params: filters,
        responseHandler: (response) => response.blob(),
      }),
    }),

    // ================= CUSTOMER REPORTS =================
    getCustomerReportSummary: builder.query<CustomerReportSummary, ReportFiltersType>({
      query: (filters) => ({
        url: 'customers/summary/',
        params: filters,
      }),
      providesTags: ['CustomerReport'],
    }),

    exportCustomerReport: builder.query<Blob, ReportFiltersType>({
      query: (filters) => ({
        url: 'customers/export/pdf/',
        params: filters,
        responseHandler: (response) => response.blob(),
      }),
    }),

    // ================= CATEGORY & BRAND REPORTS =================
    getCategoryBrandReport: builder.query<CategoryBrandReport, ReportFiltersType>({
      query: (filters) => ({
        url: 'analytics/category-brand/',
        params: filters,
      }),
      providesTags: ['CategoryBrandReport'],
    }),

    exportCategoryBrandReport: builder.query<Blob, ReportFiltersType>({
      query: (filters) => ({
        url: 'analytics/category-brand/export/pdf/',
        params: filters,
        responseHandler: (response) => response.blob(),
      }),
    }),

    // ================= INDIVIDUAL VENDOR REPORT =================
    getIndividualVendorReport: builder.query<IndividualVendorReport, { vendorId: number; filters?: ReportFiltersType }>({
      query: ({ vendorId, filters }) => ({
        url: `vendors/${vendorId}/`,
        params: filters,
      }),
      providesTags: ['VendorReport'],
    }),

    exportIndividualVendorReport: builder.query<Blob, { vendorId: number; filters?: ReportFiltersType }>({
      query: ({ vendorId, filters }) => ({
        url: `vendors/${vendorId}/export/pdf/`,
        params: filters,
        responseHandler: (response) => response.blob(),
      }),
    }),

    // ================= REPORT LOGS =================
    getReportLogs: builder.query<ReportLog[], void>({
      query: () => 'logs/',
      providesTags: ['ReportLogs'],
    }),
  }),
});

/** ==============================
 *  Hooks Export
 *  ============================== */
export const {
  useGetProductReportSummaryQuery,
  useGetProductStockReportQuery,
  useLazyExportProductReportQuery,
  useGetOrderReportSummaryQuery,
  useGetSalesByVendorQuery,
  useLazyExportOrderReportQuery,
  useGetVendorPerformanceQuery,
  useLazyExportVendorReportQuery,
  useGetUserReportSummaryQuery,
  useLazyExportUserReportQuery,
  useGetSalesReportSummaryQuery,
  useLazyExportSalesReportQuery,
  useGetCustomerReportSummaryQuery,
  useLazyExportCustomerReportQuery,
  useGetCategoryBrandReportQuery,
  useLazyExportCategoryBrandReportQuery,
  useGetIndividualVendorReportQuery,
  useLazyExportIndividualVendorReportQuery,
  useGetReportLogsQuery,
} = reportsApi;