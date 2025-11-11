import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store';
import BASE_URL from '@/config/apiConfig';

export interface AdminStats {
  total_products: number;
  total_users: number;
  total_orders: number;
  total_revenue: number;
  orders_today: number;
  orders_this_month: number;
  low_stock_products: number;
  pending_orders: number;
}

export interface AdminVendor {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  business_name: string;
  gst_number: string;
  phone: string;
  is_vendor_approved: boolean;
  vendor_commission_rate: string;
  created_at: string;
  address: string;
  city: string | null;
  state: string | null;
  pincode: string | null;
  is_verified: boolean;
  user_type: string;
}

export interface VendorsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: AdminVendor[];
}

export const adminApi = createApi({
  reducerPath: 'adminApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${BASE_URL}admin/`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['AdminDashboard', 'AdminVendors', 'AdminProducts', 'AdminOrders', 'AdminUsers'],
  endpoints: (builder) => ({
    // Dashboard
    getAdminDashboard: builder.query<{
      stats: AdminStats;
      recent_orders: any[];
      top_products: any[];
    }, void>({
      query: () => 'dashboard/',
      providesTags: ['AdminDashboard'],
    }),

    // Vendors
    getVendors: builder.query<VendorsResponse, void>({
      query: () => 'vendors/',
      providesTags: ['AdminVendors'],
    }),
    
    getPendingVendors: builder.query<{
      count: number;
      vendors: AdminVendor[];
    }, void>({
      query: () => 'vendors/pending/',
      providesTags: ['AdminVendors'],
    }),
    
    getVendorDetail: builder.query<AdminVendor, number>({
      query: (id) => `vendors/${id}/`,
      providesTags: ['AdminVendors'],
    }),
    
    approveVendor: builder.mutation<any, number>({
      query: (vendorId) => ({
        url: `vendors/${vendorId}/approve/`,
        method: 'POST',
      }),
      invalidatesTags: ['AdminVendors', 'AdminDashboard'],
    }),
    
    rejectVendor: builder.mutation<any, number>({
      query: (vendorId) => ({
        url: `vendors/${vendorId}/reject/`,
        method: 'POST',
      }),
      invalidatesTags: ['AdminVendors', 'AdminDashboard'],
    }),

    // Products
    getAdminProducts: builder.query<VendorsResponse, void>({
      query: () => 'products/',
      providesTags: ['AdminProducts'],
    }),

    // Orders
    getAdminOrders: builder.query<VendorsResponse, void>({
      query: () => 'orders/',
      providesTags: ['AdminOrders'],
    }),
    
    getAdminOrderDetail: builder.query<VendorsResponse, string>({
      query: (orderId) => `orders/${orderId}/`,
      providesTags: ['AdminOrders'],
    }),
    
    updateOrderStatus: builder.mutation<any, { orderId: string; status: string }>({
      query: ({ orderId, status }) => ({
        url: `orders/${orderId}/`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['AdminOrders', 'AdminDashboard'],
    }),

    // Users
    getAdminUsers: builder.query<VendorsResponse, void>({
      query: () => 'users/',
      providesTags: ['AdminUsers'],
    }),

    // Analytics
    getAdminAnalytics: builder.query<{
      daily_sales: any[];
      category_sales: any[];
    }, void>({
      query: () => 'analytics/',
    }),
  }),
});

export const {
  useGetAdminDashboardQuery,
  useGetVendorsQuery,
  useGetPendingVendorsQuery,
  useGetVendorDetailQuery,
  useApproveVendorMutation,
  useRejectVendorMutation,
  useGetAdminProductsQuery,
  useGetAdminOrdersQuery,
  useGetAdminOrderDetailQuery,
  useUpdateOrderStatusMutation,
  useGetAdminUsersQuery,
  useGetAdminAnalyticsQuery,
} = adminApi;