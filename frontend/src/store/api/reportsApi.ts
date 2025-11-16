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

export interface ReportLog {
  id: number;
  report_type: 'product' | 'order' | 'vendor' | 'sales';
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
  // Period filter (takes priority over custom dates)
  period?: PeriodFilter | '';
  
  // Custom date range (only used if period is not set)
  date_from?: string;
  date_to?: string;
  
  // Product filters
  category?: string;
  brand?: string;
  vendor?: string;
  is_low_stock?: string;
  
  // Order filters
  status?: string;
  payment_status?: string;
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
  tagTypes: ['ProductReport', 'OrderReport', 'VendorReport', 'ReportLogs'],
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
  useGetReportLogsQuery,
} = reportsApi;