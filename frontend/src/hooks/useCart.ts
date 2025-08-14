import { useGetCartQuery } from '@/store/api/ordersApi';
import { useAuth } from './useAuth';

export const useCart = () => {
  const { isAuthenticated } = useAuth();
  const { data: cart, isLoading, error } = useGetCartQuery(undefined, {
    skip: !isAuthenticated,
  });

  return {
    cart,
    isLoading,
    error,
    itemCount: cart?.total_items || 0,
    total: cart?.total_amount || '0',
  };
};
