import { toast } from 'react-hot-toast';
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';

export const showSuccessToast = (message: string) => {
  toast.success(message, {
    icon: <CheckCircleIcon className="h-5 w-5 text-green-500" />,
    style: {
      background: '#f0fdf4',
      color: '#166534',
      border: '1px solid #bbf7d0',
    },
  });
};

export const showErrorToast = (message: string) => {
  toast.error(message, {
    icon: <XCircleIcon className="h-5 w-5 text-red-500" />,
    style: {
      background: '#fef2f2',
      color: '#991b1b',
      border: '1px solid #fecaca',
    },
  });
};

export const showWarningToast = (message: string) => {
  toast(message, {
    icon: <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />,
    style: {
      background: '#fffbeb',
      color: '#92400e',
      border: '1px solid #fed7aa',
    },
  });
};

export const showInfoToast = (message: string) => {
  toast(message, {
    icon: <InformationCircleIcon className="h-5 w-5 text-blue-500" />,
    style: {
      background: '#eff6ff',
      color: '#1e40af',
      border: '1px solid #dbeafe',
    },
  });
};
