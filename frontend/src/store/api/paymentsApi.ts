import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../store";
import BASE_URL from "@/config/apiConfig";

export const paymentsApi = createApi({
  reducerPath: "paymentsApi",
  baseQuery: fetchBaseQuery({
    // baseUrl: `${BASE_URL}payments/`,
    baseUrl:"http://localhost:8000/api/payments/",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState as any).auth.token;
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    createPaymentIntent: builder.mutation<any, string>({
      query: (order_id) => ({
        url: "create-payment-intent/",
        method: "POST",
        body: { order_id },
      }),
    }),
    confirmPayment: builder.mutation<
      any,
      { payment_intent_id: string; order_id: string }
    >({
      query: ({ payment_intent_id, order_id }) => ({
        url: "confirm-payment/",
        method: "POST",
        body: { payment_intent_id, order_id },
      }),
    }),
    createRazorpayOrder: builder.mutation<any, string>({
      query: (order_id) => ({
        url: "razorpay/create/",
        method: "POST",
        body: { order_id },
      }),
    }),
    verifyRazorpayPayment: builder.mutation<any, any>({
      query: (paymentData) => ({
        url: "razorpay/verify/",
        method: "POST",
        body: paymentData,
      }),
    }),
  }),
});

export const {
  useCreatePaymentIntentMutation,
  useConfirmPaymentMutation,
  useCreateRazorpayOrderMutation,
  useVerifyRazorpayPaymentMutation,
} = paymentsApi;
