import { useAppSelector } from './useTypedSelector';

export const useAuth = () => {
  const { user, token, isAuthenticated } = useAppSelector((state) => state.auth);
  
  return {
    user,
    token,
    isAuthenticated,
    isAdmin: user?.user_type === 'admin',
    isCustomer: user?.user_type === 'customer',
  };
};