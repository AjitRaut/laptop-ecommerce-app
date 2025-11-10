import React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { UserIcon } from '@heroicons/react/24/outline';
import { useGetProfileQuery, useUpdateProfileMutation } from '@/store/api/authApi';
import { useAppDispatch } from '@/hooks/useTypedSelector';
import { updateUser } from '@/store/slices/authSlice';
import { INDIAN_STATES } from '@/utils/constants';
import type { User } from '@/types';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Input from '@/components/common/input';
import Button from '@/components/common/Button';

const Profile: React.FC = () => {
  const dispatch = useAppDispatch();
  const { data: user, isLoading } = useGetProfileQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<Partial<User>>();

  React.useEffect(() => {
    if (user) {
      reset(user);
    }
  }, [user, reset]);

  const onSubmit = async (data: Partial<User>) => {
    try {
      const updatedUser = await updateProfile(data).unwrap();
      dispatch(updateUser(updatedUser));
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to update profile');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage your account information and preferences
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
        >
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8">
            <div className="flex items-center">
              <div className="h-20 w-20 bg-white/20 rounded-full flex items-center justify-center">
                <UserIcon className="h-10 w-10 text-white" />
              </div>
              <div className="ml-6">
                <h2 className="text-2xl font-bold text-white">
                  {user?.first_name} {user?.last_name}
                </h2>
                <p className="text-blue-100">{user?.email}</p>
                <div className="flex items-center mt-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    user?.is_verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {user?.is_verified ? 'Verified' : 'Unverified'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <div className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <Input
                  label="First Name"
                  type="text"
                  error={errors.first_name?.message}
                  {...register('first_name', {
                    required: 'First name is required',
                  })}
                />

                <Input
                  label="Last Name"
                  type="text"
                  error={errors.last_name?.message}
                  {...register('last_name', {
                    required: 'Last name is required',
                  })}
                />

                <div className="sm:col-span-2">
                  <Input
                    label="Username"
                    type="text"
                    error={errors.username?.message}
                    {...register('username', {
                      required: 'Username is required',
                    })}
                  />
                </div>

                <div className="sm:col-span-2">
                  <Input
                    label="Phone Number"
                    type="tel"
                    error={errors.phone?.message}
                    {...register('phone', {
                      pattern: {
                        value: /^[6-9]\d{9}$/,
                        message: 'Invalid phone number',
                      },
                    })}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <textarea
                    id="address"
                    rows={3}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    {...register('address')}
                  />
                </div>

                <Input
                  label="City"
                  type="text"
                  error={errors.city?.message}
                  {...register('city')}
                />

                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                    State
                  </label>
                  <select
                    id="state"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    {...register('state')}
                  >
                    <option value="">Select a state</option>
                    {INDIAN_STATES.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </div>

                <Input
                  label="PIN Code"
                  type="text"
                  error={errors.pincode?.message}
                  {...register('pincode', {
                    pattern: {
                      value: /^[1-9][0-9]{5}$/,
                      message: 'Invalid PIN code',
                    },
                  })}
                />
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  loading={isUpdating}
                  size="lg"
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
