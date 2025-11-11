import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store';
import BASE_URL from '@/config/apiConfig';

export interface VendorStats {
  total_products: number;
  active_products: number;
  low_stock_products: number;
  total_orders: number;
  pending_orders: number;
  total_revenue: number;
  commission_rate: number;
}

export interface VendorProduct {
  id: number;
  name: string;
  price: string;
  stock_quantity: number;
  is_active: boolean;
  category_name: string;
  brand_name: string;
  primary_image?: string;
}

export interface VendorOrder {
  order_id: string;
  customer_name: string;
  customer_email: string;
  total_amount: string;
  status: string;
  created_at: string;
  items: any[];
}

// Add a paginated response interface
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Update VendorProduct interface to match the actual API response
export interface VendorProduct {
  id: number;
  name: string;
  price: string;
  stock_quantity: number;
  is_active: boolean;
  category_name: string;
  brand_name: string;
  primary_image?: string;
  // Add other fields from the API response
  brand: number;
  category: number;
  created_at: string;
  description: string;
  discount_percentage: string;
  discounted_price: number;
  images: Array<{
    id: number;
    image: string;
    alt_text: string;
    created_at: string;
    is_primary: boolean;
    product: number;
  }>;
  is_featured: boolean;
  is_in_stock: boolean;
  is_low_stock: boolean;
  min_stock_level: number;
  product_type: string;
  short_description: string;
  sku: string;
  specifications: any[];
  updated_at: string;
  vendor: number;
  warranty_months: number;
  weight: string;
}



export const vendorApi = createApi({
  reducerPath: 'vendorApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${BASE_URL}vendor/`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['VendorDashboard', 'VendorProducts', 'VendorOrders', 'VendorProfile'],
  endpoints: (builder) => ({
    // Dashboard
    getVendorDashboard: builder.query<{
      stats: VendorStats;
      recent_orders: VendorOrder[];
      top_products: any[];
    }, void>({
      query: () => 'dashboard/',
      providesTags: ['VendorDashboard'],
    }),

    // Products
    getVendorProducts: builder.query<PaginatedResponse<VendorProduct>, void>({
      query: () => 'products/',
      providesTags: ['VendorProducts'],
    }),
    
    getVendorProduct: builder.query<any, number>({
      query: (id) => `products/${id}/`,
      providesTags: ['VendorProducts'],
    }),
    
    createVendorProduct: builder.mutation<any, any>({
      query: (data) => ({
        url: 'products/create/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['VendorProducts', 'VendorDashboard'],
    }),
    
    updateVendorProduct: builder.mutation<any, { id: number; data: any }>({
      query: ({ id, data }) => ({
        url: `products/${id}/`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['VendorProducts', 'VendorDashboard'],
    }),
    
    deleteVendorProduct: builder.mutation<any, number>({
      query: (id) => ({
        url: `products/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['VendorProducts', 'VendorDashboard'],
    }),
    
    updateProductStock: builder.mutation<any, { productId: number; stock_quantity: number }>({
      query: ({ productId, stock_quantity }) => ({
        url: `products/${productId}/stock/`,
        method: 'PATCH',
        body: { stock_quantity },
      }),
      invalidatesTags: ['VendorProducts'],
    }),

    // Orders
    getVendorOrders: builder.query<VendorOrder[], void>({
      query: () => 'orders/',
      providesTags: ['VendorOrders'],
    }),
    
    getVendorOrderDetail: builder.query<VendorOrder, string>({
      query: (orderId) => `orders/${orderId}/`,
      providesTags: ['VendorOrders'],
    }),
    
    updateOrderItemStatus: builder.mutation<any, { itemId: number; vendor_status: string }>({
      query: ({ itemId, vendor_status }) => ({
        url: `order-items/${itemId}/status/`,
        method: 'PATCH',
        body: { vendor_status },
      }),
      invalidatesTags: ['VendorOrders', 'VendorDashboard'],
    }),

    // Profile
    getVendorProfile: builder.query<any, void>({
      query: () => 'profile/',
      providesTags: ['VendorProfile'],
    }),
    
    updateVendorProfile: builder.mutation<any, any>({
      query: (data) => ({
        url: 'profile/',
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['VendorProfile'],
    }),
  }),
});

export const {
  useGetVendorDashboardQuery,
  useGetVendorProductsQuery,
  useGetVendorProductQuery,
  useCreateVendorProductMutation,
  useUpdateVendorProductMutation,
  useDeleteVendorProductMutation,
  useUpdateProductStockMutation,
  useGetVendorOrdersQuery,
  useGetVendorOrderDetailQuery,
  useUpdateOrderItemStatusMutation,
  useGetVendorProfileQuery,
  useUpdateVendorProfileMutation,
} = vendorApi;