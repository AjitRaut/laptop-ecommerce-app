// src/utils/errorHandler.ts
import { toast } from 'react-hot-toast';

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  status?: number;
}

export const handleApiError = (error: any): void => {
  if (error?.data?.message) {
    toast.error(error.data.message);
  } else if (error?.data?.errors) {
    // Handle validation errors
    const firstError = Object.values(error.data.errors)[0];
    if (Array.isArray(firstError) && firstError.length > 0) {
      toast.error(firstError[0]);
    }
  } else if (error?.message) {
    toast.error(error.message);
  } else {
    toast.error('An unexpected error occurred');
  }
};

export const getErrorMessage = (error: any): string => {
  if (error?.data?.message) return error.data.message;
  if (error?.data?.errors) {
    const firstError = Object.values(error.data.errors)[0];
    if (Array.isArray(firstError) && firstError.length > 0) {
      return firstError[0];
    }
  }
  if (error?.message) return error.message;
  return 'An unexpected error occurred';
};


// src/components/Common/
