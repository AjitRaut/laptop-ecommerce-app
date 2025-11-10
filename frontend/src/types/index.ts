import { PaginatedResponse } from "./api";

export interface User {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
 user_type: 'admin' | 'customer' | 'vendor';
  is_verified: boolean;
  created_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

export interface AuthResponse {
  user: User;
  tokens: {
    access: string;
    refresh: string;
  };
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  image?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Brand {
  id: number;
  name: string;
  logo?: string;
  is_active: boolean;
  created_at: string;
}

export interface ProductImage {
  id: number;
  product: number;
  image: string;
  alt_text?: string;
  is_primary: boolean;
  created_at: string;
}

export interface ProductSpecification {
  id: number;
  product: number;
  spec_name: string;
  spec_value: string;
  created_at: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  short_description?: string;
  category: number;
  brand: string;
  category_name: string;
  brand_name: string;
  product_type: "laptop" | "accessory";
  sku: string;
  price: string;
  discount_percentage: string;
  discounted_price: string;
  stock_quantity: number;
  min_stock_level: number;
  is_active: boolean;
  is_featured: boolean;
  is_in_stock: boolean;
  is_low_stock: boolean;
  weight?: string;
  warranty_months: number;
  primary_image?: string;
  images?: ProductImage[];
  specifications?: ProductSpecification[];
  created_at: string;
  updated_at: string;
}

export interface ProductFilters {
  page?: number | string;
  search?: string;
  category?: string;
  brand?: string;
  min_price?: string;
  max_price?: string;
  ordering?: string;
}

export interface ProductsResponse {
  count: number;
  next?: string;
  previous?: string;
  results: Product[];
}

export interface CartItem {
  id: number;
  cart: number;
  product: Product;
  quantity: number;
  added_at: string;
  total_price: string;
}

export interface Cart {
  id: number;
  user: number;
  items: CartItem[];
  total_items: number;
  total_amount: string;
  created_at: string;
  updated_at: string;
}

export interface WishlistItem {
  id: number;
  wishlist: number;
  product: Product;
  added_at: string;
}

export interface Wishlist {
  id: number;
  user: number;
  items: WishlistItem[];
  created_at: string;
}

export interface OrderItem {
  id: number;
  order: number;
  product: number;
  product_name: string;
  product_image: string;
  product_price: string;
  quantity: number;
  total_price: string;
}

export interface Order {
  id: number;
  order_id: string;
  user: number;
  total_amount: string;
  tax_amount: string;
  shipping_charges: string;
  discount_amount: string;
  final_amount: string;
  status:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "refunded";
  payment_status: "pending" | "paid" | "failed" | "refunded";
  payment_method?: string;
  payment_transaction_id?: string;
  shipping_name: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_pincode: string;
  notes?: string;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface OrderCreateData {
  shipping_name: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_pincode: string;
  notes?: string;
}

export interface Payment {
  id: number;
  payment_id: string;
  order: number;
  amount: string;
  payment_method: "stripe" | "razorpay" | "paypal" | "cod";
  transaction_id?: string;
  gateway_response?: any;
  status: "pending" | "success" | "failed" | "refunded";
  created_at: string;
  updated_at: string;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

export type CategoriesResponse = PaginatedResponse<Category>;
export type BrandsResponse = PaginatedResponse<Brand>;
