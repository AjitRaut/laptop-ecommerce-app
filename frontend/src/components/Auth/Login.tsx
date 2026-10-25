import React, { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { EyeIcon, EyeSlashIcon, EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { useLoginMutation } from '@/store/api/authApi';
import { useAppDispatch } from '@/hooks/useTypedSelector';
import { useAuth } from '@/hooks/useAuth';
import { setCredentials } from '@/store/slices/authSlice';
import type { LoginCredentials } from '@/types';
import SEO from '../common/SEO';
import AuthShell from '../storefront/AuthShell';
import { TextField, CheckboxField } from '../storefront/Field';
import { SfButton } from '../storefront/SfButton';
import { apiErrorMessage } from '../storefront/utils';

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAuth();
  const [login, { isLoading }] = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginCredentials>({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || '/';

  useEffect(() => {
    if (isAuthenticated && user) {
      // Redirect based on user type
      if (user.user_type === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (user.user_type === 'vendor') {
        navigate('/vendor/dashboard', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate, from]);

  const onSubmit = async (data: LoginCredentials) => {
    try {
      const result = await login(data).unwrap();
      dispatch(setCredentials(result));
      toast.success('Welcome back!');

      // Redirect based on user type
      if (result.user.user_type === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (result.user.user_type === 'vendor') {
        navigate('/vendor/dashboard', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (error: unknown) {
      toast.error(apiErrorMessage(error, 'Login failed'));
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your account"
      footer={
        <p>
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-sf-accent hover:underline">
            Sign up now
          </Link>
        </p>
      }
    >
      <SEO title="Sign In" description="Sign in to your LaptopWorld account to manage orders, cart and wishlist." />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <TextField
          label="Email address"
          type="email"
          autoComplete="email"
          leftIcon={<EnvelopeIcon />}
          error={errors.email?.message}
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: 'Invalid email address',
            },
          })}
        />

        <TextField
          label="Password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          leftIcon={<LockClosedIcon />}
          error={errors.password?.message}
          {...register('password', {
            required: 'Password is required',
            minLength: {
              value: 6,
              message: 'Password must be at least 6 characters',
            },
          })}
          rightSlot={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword}
              className="flex h-9 w-9 items-center justify-center rounded-full text-sf-subtle transition-colors hover:bg-sf-surface-2 hover:text-sf-ink"
            >
              {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
            </button>
          }
        />

        <CheckboxField id="remember-me" name="remember-me" label="Remember me" />

        <SfButton type="submit" loading={isLoading} fullWidth size="lg">
          Sign in
        </SfButton>
      </form>
    </AuthShell>
  );
};

export default Login;
