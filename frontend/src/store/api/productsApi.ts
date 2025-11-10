import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  Product,
  ProductFilters,
  ProductsResponse,
  Category,
  Brand,
  CategoriesResponse,
  BrandsResponse,
} from "@/types";
import BASE_URL from "@/config/apiConfig";
import { RootState } from "../store";

export const productsApi = createApi({
  reducerPath: "productsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${BASE_URL}products/`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth?.token || localStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Product", "Category", "Brand"],
  endpoints: (builder) => ({
    getProducts: builder.query<ProductsResponse, ProductFilters>({
      query: ({
        page = 1,
        search = "",
        category = "",
        brand = "",
        min_price = "",
        max_price = "",
        ordering = "",
      } = {}) => {
        const params = new URLSearchParams();
        if (page) params.append("page", page.toString());
        if (search) params.append("search", search);
        if (category) params.append("category", category);
        if (brand) params.append("brand", brand);
        if (min_price) params.append("min_price", min_price);
        if (max_price) params.append("max_price", max_price);
        if (ordering) params.append("ordering", ordering);

        return `?${params.toString()}`;
      },
      providesTags: ["Product"],
    }),
    getProduct: builder.query<Product, number>({
      query: (id) => `${id}/`,
      providesTags: (result, error, id) => [{ type: "Product", id }],
    }),
    getFeaturedProducts: builder.query<Product[], void>({
      query: () => "featured/",
      providesTags: ["Product"],
    }),
    getCategories: builder.query<CategoriesResponse, void>({
      query: () => "categories/",
      providesTags: ["Category"],
    }),
    getBrands: builder.query<BrandsResponse, void>({
      query: () => "brands/",
      providesTags: ["Brand"],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductQuery,
  useGetFeaturedProductsQuery,
  useGetCategoriesQuery,
  useGetBrandsQuery,
} = productsApi;
