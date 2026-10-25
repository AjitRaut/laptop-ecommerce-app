import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import {
  EyeIcon,
  EyeSlashIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';
import { useRegisterMutation } from '@/store/api/authApi';
import { useAppDispatch } from '@/hooks/useTypedSelector';
import { useAuth } from '@/hooks/useAuth';
import { setCredentials } from '@/store/slices/authSlice';
import { validatePassword } from '@/utils/validators';
import type { RegisterData } from '@/types';
import SEO from '../common/SEO';
import AuthShell from '../storefront/AuthShell';
import { TextField, CheckboxField } from '../storefront/Field';
import { SfButton } from '../storefront/SfButton';
import { apiErrorMessage, apiFieldErrors } from '../storefront/utils';

const toggleClass =
  'flex h-9 w-9 items-center justify-center rounded-full text-sf-subtle transition-colors hover:bg-sf-surface-2 hover:text-sf-ink';

const Register: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAuth();
  const [register, { isLoading }] = useRegisterMutation();

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
    watch,
    setError,
  } = useForm<RegisterData>();

  const password = watch('password');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data: RegisterData) => {
    // Client-side password validation
    const passwordValidation = validatePassword(data.password);
    if (!passwordValidation.isValid) {
      passwordValidation.errors.forEach((error) => {
        toast.error(error);
      });
      return;
    }

    try {
      const result = await register(data).unwrap();
      dispatch(setCredentials(result));
      toast.success('Account created successfully!');
      navigate('/', { replace: true });
    } catch (error: unknown) {
      const fieldErrors = Object.entries(apiFieldErrors(error));
      if (fieldErrors.length > 0) {
        fieldErrors.forEach(([field, message]) => {
          setError(field as keyof RegisterData, {
            type: 'server',
            message,
          });
        });
      } else {
        toast.error(apiErrorMessage(error, 'Registration failed'));
      }
    }
  };

  return (
    <AuthShell
      title="Create account"
      subtitle="Join us and start shopping"
      footer={
        <p>
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-sf-accent hover:underline">
            Sign in
          </Link>
        </p>
      }
    >
      <SEO title="Create Account" description="Create your LaptopWorld account to shop premium laptops and accessories." />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <TextField
            label="First name"
            type="text"
            autoComplete="given-name"
            error={errors.first_name?.message}
            {...registerField('first_name', {
              required: 'First name is required',
              minLength: {
                value: 2,
                message: 'First name must be at least 2 characters',
              },
            })}
          />

          <TextField
            label="Last name"
            type="text"
            autoComplete="family-name"
            error={errors.last_name?.message}
            {...registerField('last_name', {
              required: 'Last name is required',
              minLength: {
                value: 2,
                message: 'Last name must be at least 2 characters',
              },
            })}
          />
        </div>

        <TextField
          label="Username"
          type="text"
          autoComplete="username"
          leftIcon={<UserIcon />}
          error={errors.username?.message}
          {...registerField('username', {
            required: 'Username is required',
            minLength: {
              value: 3,
              message: 'Username must be at least 3 characters',
            },
            pattern: {
              value: /^[a-zA-Z0-9_]+$/,
              message: 'Username can only contain letters, numbers, and underscores',
            },
          })}
        />

        <TextField
          label="Email address"
          type="email"
          autoComplete="email"
          leftIcon={<EnvelopeIcon />}
          error={errors.email?.message}
          {...registerField('email', {
            required: 'Email is required',
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: 'Invalid email address',
            },
          })}
        />

        <TextField
          label="Phone number"
          type="tel"
          autoComplete="tel"
          leftIcon={<PhoneIcon />}
          error={errors.phone?.message}
          {...registerField('phone', {
            pattern: {
              value: /^[6-9]\d{9}$/,
              message: 'Invalid phone number',
            },
          })}
        />

        <TextField
          label="Password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          leftIcon={<LockClosedIcon />}
          error={errors.password?.message}
          {...registerField('password', {
            required: 'Password is required',
            minLength: {
              value: 8,
              message: 'Password must be at least 8 characters',
            },
          })}
          rightSlot={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword}
              className={toggleClass}
            >
              {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
            </button>
          }
        />

        <TextField
          label="Confirm password"
          type={showConfirmPassword ? 'text' : 'password'}
          autoComplete="new-password"
          leftIcon={<LockClosedIcon />}
          error={errors.password_confirm?.message}
          {...registerField('password_confirm', {
            required: 'Please confirm your password',
            validate: (value) => value === password || 'Passwords do not match',
          })}
          rightSlot={
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showConfirmPassword}
              className={toggleClass}
            >
              {showConfirmPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
            </button>
          }
        />

        <CheckboxField
          id="terms"
          name="terms"
          required
          label={
            <>
              I agree to the{' '}
              <Link to="/terms" className="font-medium text-sf-accent hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="font-medium text-sf-accent hover:underline">
                Privacy Policy
              </Link>
            </>
          }
        />

        <SfButton type="submit" loading={isLoading} fullWidth size="lg">
          Create account
        </SfButton>
      </form>
    </AuthShell>
  );
};

export default Register;
