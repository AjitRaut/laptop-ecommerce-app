import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { productsApi } from "./api/productsApi";
import authReducer from "./slices/authSlice";
import cartReducer from "./slices/cartSlice";
import uiReducer from "./slices/uiSlice";
import { authApi } from "./api/authApi";
import { ordersApi } from "./api/ordersApi";
import { paymentsApi } from "./api/paymentsApi";
import { adminApi } from "./api/adminApi";
import { vendorApi } from "./api/vendorApi";
import { reportsApi } from "./api/reportsApi"; 

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [productsApi.reducerPath]: productsApi.reducer,
    [ordersApi.reducerPath]: ordersApi.reducer,
    [paymentsApi.reducerPath]: paymentsApi.reducer,
    [adminApi.reducerPath]: adminApi.reducer,
    [vendorApi.reducerPath]: vendorApi.reducer,
    [reportsApi.reducerPath]: reportsApi.reducer,
    auth: authReducer,
    cart: cartReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          "persist/PERSIST",
          "persist/REHYDRATE",
          "persist/REGISTER",
        ],
      },
    }).concat(
      authApi.middleware,
      productsApi.middleware,
      ordersApi.middleware,
      paymentsApi.middleware,
      adminApi.middleware,
      vendorApi.middleware,
      reportsApi.middleware, // NEW
    ),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;