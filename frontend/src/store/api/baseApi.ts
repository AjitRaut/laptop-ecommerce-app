import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store';
import BASE_URL from '@/config/apiConfig';

const baseQuery = fetchBaseQuery({
  // baseUrl: BASE_URL,
  baseUrl:"http://localhost:8000/api/",
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState as any).auth.token;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

export const baseApi = createApi({
  baseQuery,
  tagTypes: ['User', 'Product', 'Order', 'Cart', 'Wishlist', 'Category', 'Brand'],
  endpoints: () => ({}),
});