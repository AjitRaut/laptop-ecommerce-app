import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store';
import type { Cart, Wishlist, Order, OrderCreateData } from '@/types';
import BASE_URL from '@/config/apiConfig';
import { PaginatedResponse } from '@/types/api';

export const ordersApi = createApi({
  reducerPath: 'ordersApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${BASE_URL}orders/`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState as any).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Cart', 'Wishlist', 'Order'],
  endpoints: (builder) => ({
    getCart: builder.query<Cart, void>({
      query: () => 'cart/',
      providesTags: ['Cart'],
    }),
    addToCart: builder.mutation<{ message: string }, { product_id: number; quantity?: number }>({
      query: ({ product_id, quantity = 1 }) => ({
        url: 'cart/add/',
        method: 'POST',
        body: { product_id, quantity },
      }),
      invalidatesTags: ['Cart'],
    }),
    updateCartItem: builder.mutation<{ message: string }, { item_id: number; quantity: number }>({
      query: ({ item_id, quantity }) => ({
        url: `cart/update/${item_id}/`,
        method: 'PUT',
        body: { quantity },
      }),
      invalidatesTags: ['Cart'],
    }),
    removeFromCart: builder.mutation<{ message: string }, number>({
      query: (item_id) => ({
        url: `cart/remove/${item_id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Cart'],
    }),
    getWishlist: builder.query<Wishlist, void>({
      query: () => 'wishlist/',
      providesTags: ['Wishlist'],
    }),
    addToWishlist: builder.mutation<{ message: string }, number>({
      query: (product_id) => ({
        url: 'wishlist/add/',
        method: 'POST',
        body: { product_id },
      }),
      invalidatesTags: ['Wishlist'],
    }),
    getOrders: builder.query<PaginatedResponse<Order>, void>({
      query: () => 'orders/',
      providesTags: ['Order'],
    }),
    getOrder: builder.query<Order, string>({
      query: (orderId) => `orders/${orderId}/`,
      providesTags: (result, error, orderId) => [{ type: 'Order', id: orderId }],
    }),
    createOrder: builder.mutation<{ message: string; order_id: string; final_amount: string }, OrderCreateData>({
      query: (orderData) => ({
        url: 'orders/create/',
        method: 'POST',
        body: orderData,
      }),
      invalidatesTags: ['Order', 'Cart'],
    }),
  }),
});

export const {
  useGetCartQuery,
  useAddToCartMutation,
  useUpdateCartItemMutation,
  useRemoveFromCartMutation,
  useGetWishlistQuery,
  useAddToWishlistMutation,
  useGetOrdersQuery,
  useGetOrderQuery,
  useCreateOrderMutation,
} = ordersApi;
