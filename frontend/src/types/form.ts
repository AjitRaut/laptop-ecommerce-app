export interface CheckoutFormData {
  shipping_name: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_pincode: string;
  notes?: string;
}

export interface SearchFilters {
  search?: string;
  category?: string;
  brand?: string;
  min_price?: number;
  max_price?: number;
  ordering?: string;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showInfo?: boolean;
  totalItems?: number;
  itemsPerPage?: number;
}