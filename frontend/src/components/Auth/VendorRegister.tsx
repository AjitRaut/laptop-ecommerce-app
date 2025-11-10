import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import Button from '../common/Button';
import Input from '../common/input';
import BASE_URL from '@/config/apiConfig';

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
      
      const result = await response.json();
      
      if (response.ok) {
        toast.success('Registration successful! Awaiting admin approval.');
        navigate('/login');
      } else {
        toast.error(result.message || 'Registration failed');
      }
    } catch (error) {
      toast.error('Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg p-3 inline-block mb-4">
              <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Become a Vendor</h2>
            <p className="text-gray-600">Join our marketplace and start selling</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Account Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Email"
                  type="email"
                  error={errors.email?.message}
                  {...register('email', { required: 'Email is required' })}
                />
                <Input
                  label="Username"
                  error={errors.username?.message}
                  {...register('username', { required: 'Username is required' })}
                />
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  error={errors.password?.message}
                  {...register('password', { 
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Min 6 characters' }
                  })}
                  rightIcon={
                    <button type="button" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                    </button>
                  }
                />
                <Input
                  label="Confirm Password"
                  type={showPassword ? 'text' : 'password'}
                  error={errors.password_confirm?.message}
                  {...register('password_confirm', {
                    required: 'Please confirm password',
                    validate: (val: string) => {
                      if (watch('password') != val) return 'Passwords do not match';
                    },
                  })}
                />
              </div>
            </div>

            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  error={errors.first_name?.message}
                  {...register('first_name', { required: 'First name is required' })}
                />
                <Input
                  label="Last Name"
                  error={errors.last_name?.message}
                  {...register('last_name', { required: 'Last name is required' })}
                />
                <Input
                  label="Phone"
                  type="tel"
                  error={errors.phone?.message}
                  {...register('phone', { required: 'Phone is required' })}
                />
              </div>
            </div>

            {/* Business Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Business Name"
                  error={errors.business_name?.message}
                  {...register('business_name', { required: 'Business name is required' })}
                />
                <Input
                  label="GST Number"
                  error={errors.gst_number?.message}
                  {...register('gst_number', { required: 'GST number is required' })}
                />
              </div>
            </div>

            {/* Address (Optional) */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Address (Optional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Address" {...register('address')} className="md:col-span-2" />
                <Input label="City" {...register('city')} />
                <Input label="State" {...register('state')} />
                <Input label="Pincode" {...register('pincode')} />
              </div>
            </div>

            <Button type="submit" loading={isLoading} fullWidth size="lg" className="shadow-lg">
              Register as Vendor
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorRegister;