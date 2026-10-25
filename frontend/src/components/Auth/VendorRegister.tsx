import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import BASE_URL from '@/config/apiConfig';
import SEO from '../common/SEO';
import AuthShell from '../storefront/AuthShell';
import { TextField } from '../storefront/Field';
import { SfButton } from '../storefront/SfButton';
import { apiErrorMessage } from '../storefront/utils';

interface VendorRegisterData {
  email: string;
  username: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
  business_name: string;
  gst_number: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

const FormSection: React.FC<{ legend: string; children: React.ReactNode }> = ({ legend, children }) => (
  <fieldset className="border-t border-sf-line pt-6 first:border-t-0 first:pt-0">
    <legend className="float-left mb-4 w-full font-display text-lg font-semibold text-sf-ink">{legend}</legend>
    <div className="clear-left grid grid-cols-1 gap-5 md:grid-cols-2">{children}</div>
  </fieldset>
);

const VendorRegister: React.FC = () => {
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, watch, formState: { errors } } = useForm<VendorRegisterData>();

  const onSubmit = async (data: VendorRegisterData) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${BASE_URL}vendor/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result: unknown = await response.json();

      if (response.ok) {
        toast.success('Registration successful! Awaiting admin approval.');
        navigate('/login');
      } else {
        toast.error(apiErrorMessage({ data: result }, 'Registration failed'));
      }
    } catch (error) {
      toast.error('Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      wide
      title="Become a Vendor"
      subtitle="Join our marketplace and start selling"
      footer={
        <p>
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-sf-accent hover:underline">
            Sign in
          </Link>
        </p>
      }
    >
      <SEO title="Become a Vendor" description="Register as a LaptopWorld vendor and sell laptops and accessories across India." />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <FormSection legend="Account Information">
          <TextField
            label="Email"
            type="email"
            autoComplete="email"
            error={errors.email?.message}
            {...register('email', { required: 'Email is required' })}
          />
          <TextField
            label="Username"
            autoComplete="username"
            error={errors.username?.message}
            {...register('username', { required: 'Username is required' })}
          />
          <TextField
            label="Password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            error={errors.password?.message}
            {...register('password', {
              required: 'Password is required',
              minLength: { value: 6, message: 'Min 6 characters' },
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
          <TextField
            label="Confirm Password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            error={errors.password_confirm?.message}
            {...register('password_confirm', {
              required: 'Please confirm password',
              validate: (val: string) => watch('password') === val || 'Passwords do not match',
            })}
          />
        </FormSection>

        <FormSection legend="Personal Information">
          <TextField
            label="First Name"
            autoComplete="given-name"
            error={errors.first_name?.message}
            {...register('first_name', { required: 'First name is required' })}
          />
          <TextField
            label="Last Name"
            autoComplete="family-name"
            error={errors.last_name?.message}
            {...register('last_name', { required: 'Last name is required' })}
          />
          <TextField
            label="Phone"
            type="tel"
            autoComplete="tel"
            error={errors.phone?.message}
            {...register('phone', { required: 'Phone is required' })}
          />
        </FormSection>

        <FormSection legend="Business Information">
          <TextField
            label="Business Name"
            autoComplete="organization"
            error={errors.business_name?.message}
            {...register('business_name', { required: 'Business name is required' })}
          />
          <TextField
            label="GST Number"
            error={errors.gst_number?.message}
            {...register('gst_number', { required: 'GST number is required' })}
          />
        </FormSection>

        <FormSection legend="Address (Optional)">
          <TextField label="Address" autoComplete="street-address" wrapperClassName="md:col-span-2" {...register('address')} />
          <TextField label="City" autoComplete="address-level2" {...register('city')} />
          <TextField label="State" autoComplete="address-level1" {...register('state')} />
          <TextField label="Pincode" autoComplete="postal-code" {...register('pincode')} />
        </FormSection>

        <SfButton type="submit" loading={isLoading} fullWidth size="lg">
          Register as Vendor
        </SfButton>
      </form>
    </AuthShell>
  );
};

export default VendorRegister;
