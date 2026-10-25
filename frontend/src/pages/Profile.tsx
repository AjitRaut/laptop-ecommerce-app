import React from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { CheckBadgeIcon, ClipboardDocumentListIcon, HeartIcon, ShoppingBagIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import { useGetProfileQuery, useUpdateProfileMutation } from '@/store/api/authApi';
import { useAppDispatch } from '@/hooks/useTypedSelector';
import { updateUser } from '@/store/slices/authSlice';
import { INDIAN_STATES } from '@/utils/constants';
import type { User } from '@/types';
import SEO from '@/components/common/SEO';
import GlassPanel from '@/components/storefront/GlassPanel';
import StatusPill from '@/components/storefront/StatusPill';
import { SfButton } from '@/components/storefront/SfButton';
import { SelectField, TextAreaField, TextField } from '@/components/storefront/Field';
import { Skeleton } from '@/components/storefront/Skeleton';
import { apiErrorMessage, container, initials } from '@/components/storefront/utils';

const quickLinks = [
  { label: 'My Orders', href: '/orders', icon: ClipboardDocumentListIcon },
  { label: 'Wishlist', href: '/wishlist', icon: HeartIcon },
  { label: 'Cart', href: '/cart', icon: ShoppingBagIcon },
];

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
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Failed to update profile'));
    }
  };

  if (isLoading) {
    return (
      <div className={clsx(container, 'pt-10')}>
        <Skeleton className="h-44 w-full rounded-sf-xl" />
        <Skeleton className="mt-6 h-96 w-full rounded-sf-lg" />
      </div>
    );
  }

  const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(' ');
  const memberSince = user?.created_at
    ? new Intl.DateTimeFormat('en-IN', { month: 'long', year: 'numeric' }).format(new Date(user.created_at))
    : null;

  return (
    <div className={clsx(container, 'pt-8 sm:pt-12')}>
      <SEO title="My Profile" />

      {/* Profile hero */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        aria-labelledby="profile-heading"
        className="sf-gradient-border relative isolate overflow-hidden rounded-sf-xl bg-sf-surface/70 p-6 shadow-sf-float sm:p-8"
      >
        <div aria-hidden="true" className="absolute -right-16 -top-24 -z-10 h-72 w-72 rounded-full bg-[radial-gradient(closest-side,var(--sf-mesh-b),transparent)]" />
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="relative flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full bg-sf-gradient font-display text-2xl font-semibold text-sf-on-accent shadow-sf-glow ring-4 ring-sf-surface">
            {initials(fullName || user?.email || 'U')}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-display text-xs font-semibold uppercase tracking-[0.22em] text-sf-accent">My Profile</p>
            <h1 id="profile-heading" className="mt-1 truncate font-display text-3xl font-semibold tracking-tight text-sf-ink">
              {fullName || 'Your account'}
            </h1>
            <p className="truncate text-sf-muted">{user?.email}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <StatusPill tone={user?.is_verified ? 'success' : 'warning'} dot>
                {user?.is_verified ? 'Verified' : 'Unverified'}
              </StatusPill>
              {memberSince && <span className="text-xs text-sf-subtle">Member since {memberSince}</span>}
            </div>
          </div>
        </div>
      </motion.section>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Form */}
        <GlassPanel as="section" aria-labelledby="profile-details" className="lg:col-span-8">
          <h2 id="profile-details" className="font-display text-xl font-semibold text-sf-ink">
            Account details
          </h2>
          <p className="mt-1 text-sm text-sf-muted">Manage your account information and preferences</p>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-6">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <TextField
                label="First Name"
                type="text"
                autoComplete="given-name"
                error={errors.first_name?.message}
                {...register('first_name', {
                  required: 'First name is required',
                })}
              />

              <TextField
                label="Last Name"
                type="text"
                autoComplete="family-name"
                error={errors.last_name?.message}
                {...register('last_name', {
                  required: 'Last name is required',
                })}
              />

              <TextField
                wrapperClassName="sm:col-span-2"
                label="Username"
                type="text"
                autoComplete="username"
                error={errors.username?.message}
                {...register('username', {
                  required: 'Username is required',
                })}
              />

              <TextField
                wrapperClassName="sm:col-span-2"
                label="Phone Number"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                error={errors.phone?.message}
                {...register('phone', {
                  pattern: {
                    value: /^[6-9]\d{9}$/,
                    message: 'Invalid phone number',
                  },
                })}
              />

              <TextAreaField
                wrapperClassName="sm:col-span-2"
                label="Address"
                rows={3}
                autoComplete="street-address"
                {...register('address')}
              />

              <TextField label="City" type="text" autoComplete="address-level2" error={errors.city?.message} {...register('city')} />

              <SelectField label="State" autoComplete="address-level1" {...register('state')}>
                <option value="">Select a state</option>
                {INDIAN_STATES.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </SelectField>

              <TextField
                label="PIN Code"
                type="text"
                inputMode="numeric"
                autoComplete="postal-code"
                error={errors.pincode?.message}
                {...register('pincode', {
                  pattern: {
                    value: /^[1-9][0-9]{5}$/,
                    message: 'Invalid PIN code',
                  },
                })}
              />
            </div>

            <div className="mt-8 flex justify-end">
              <SfButton type="submit" loading={isUpdating} size="lg">
                Save Changes
              </SfButton>
            </div>
          </form>
        </GlassPanel>

        {/* Quick links */}
        <aside className="space-y-4 lg:col-span-4">
          <GlassPanel>
            <h2 className="font-display text-lg font-semibold text-sf-ink">Shortcuts</h2>
            <ul className="mt-4 space-y-1">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="group flex items-center gap-3 rounded-sf px-3 py-3 text-sm text-sf-muted transition-colors hover:bg-sf-surface-2 hover:text-sf-ink"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-sf-sm bg-sf-surface-2 text-sf-accent ring-1 ring-sf-line">
                      <link.icon className="h-5 w-5" />
                    </span>
                    <span className="flex-1 font-medium">{link.label}</span>
                    <ChevronRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </li>
              ))}
            </ul>
          </GlassPanel>
          {user?.is_verified && (
            <p className="flex items-center gap-2 px-2 text-xs text-sf-subtle">
              <CheckBadgeIcon className="h-4 w-4 text-sf-success" /> Your email address is verified.
            </p>
          )}
        </aside>
      </div>
    </div>
  );
};

export default Profile;
