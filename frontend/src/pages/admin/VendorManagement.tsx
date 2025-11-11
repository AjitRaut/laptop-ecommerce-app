import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircleIcon, XCircleIcon, EyeIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import Button from '@/components/common/Button';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Badge from '@/components/common/Badge';
import { useApproveVendorMutation, useGetVendorsQuery, useRejectVendorMutation } from '@/store/api/adminApi';

const VendorManagement: React.FC = () => {
  const { data: vendorsResponse, isLoading } = useGetVendorsQuery();
  const [approveVendor] = useApproveVendorMutation();
  const [rejectVendor] = useRejectVendorMutation();
  const [filter, setFilter] = useState<'all' | 'approved' | 'pending'>('all');

  const handleApprove = async (id: number, username: string) => {
    if (confirm(`Approve vendor "${username}"?`)) {
      try {
        await approveVendor(id).unwrap();
        toast.success('Vendor approved!');
      } catch {
        toast.error('Failed to approve');
      }
    }
  };

  const handleReject = async (id: number, username: string) => {
    if (confirm(`Reject vendor "${username}"?`)) {
      try {
        await rejectVendor(id).unwrap();
        toast.success('Vendor rejected!');
      } catch {
        toast.error('Failed to reject');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const vendors = vendorsResponse?.results || [];
  
  const filteredVendors = vendors.filter((v: any) => {
    if (filter === 'approved') return v.is_vendor_approved;
    if (filter === 'pending') return !v.is_vendor_approved;
    return true;
  });

  const pendingCount = vendors.filter((v: any) => !v.is_vendor_approved).length || 0;
  const approvedCount = vendors.filter((v: any) => v.is_vendor_approved).length || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vendor Management</h1>
          <p className="text-gray-600 mt-2">
            {vendors.length || 0} total vendors • {pendingCount} pending approval
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-2">
        <Button
          variant={filter === 'all' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          All ({vendors.length || 0})
        </Button>
        <Button
          variant={filter === 'approved' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setFilter('approved')}
        >
          Approved ({approvedCount})
        </Button>
        <Button
          variant={filter === 'pending' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setFilter('pending')}
        >
          Pending ({pendingCount})
        </Button>
      </div>

      {/* Vendors Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredVendors.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No vendors found
                  </td>
                </tr>
              ) : (
                filteredVendors.map((vendor: any) => (
                  <tr key={vendor.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="font-medium text-gray-900">
                          {vendor.first_name || vendor.last_name 
                            ? `${vendor.first_name} ${vendor.last_name}`.trim()
                            : 'N/A'}
                        </p>
                        <p className="text-sm text-gray-500">{vendor.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-900">{vendor.username}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-900">{vendor.phone || 'N/A'}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={vendor.is_vendor_approved ? 'success' : 'warning'}>
                        {vendor.is_vendor_approved ? 'Approved' : 'Pending'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(vendor.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <Link to={`/admin/vendors/${vendor.id}`}>
                          <Button variant="outline" size="sm" leftIcon={<EyeIcon className="h-4 w-4" />}>
                            View
                          </Button>
                        </Link>
                        {!vendor.is_vendor_approved && (
                          <Button
                            variant="primary"
                            size="sm"
                            leftIcon={<CheckCircleIcon className="h-4 w-4" />}
                            onClick={() => handleApprove(vendor.id, vendor.username)}
                          >
                            Approve
                          </Button>
                        )}
                        {vendor.is_vendor_approved && (
                          <Button
                            variant="danger"
                            size="sm"
                            leftIcon={<XCircleIcon className="h-4 w-4" />}
                            onClick={() => handleReject(vendor.id, vendor.username)}
                          >
                            Suspend
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VendorManagement;