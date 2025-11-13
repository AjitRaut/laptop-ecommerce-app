import React, { useState } from 'react';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import Button from '@/components/common/Button';
import toast from 'react-hot-toast';

interface ExportButtonProps {
  onExport: () => Promise<any>;
  fileName: string;
  label?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  fileType?: 'pdf' | 'csv';
}

const ExportButton: React.FC<ExportButtonProps> = ({
  onExport,
  fileName,
  label = 'Export PDF',
  variant = 'outline',
  fileType = 'pdf',
}) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      toast.loading('Generating report...', { id: 'export' });

      const result = await onExport();
      
      // Get blob from the response
      let blob: Blob;
      if (result.data instanceof Blob) {
        blob = result.data;
      } else if (result instanceof Blob) {
        blob = result;
      } else {
        throw new Error('Invalid response format');
      }
      
      // Create download URL
      const url = window.URL.createObjectURL(blob);
      
      // Create temporary link and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = `${fileName}_${new Date().toISOString().split('T')[0]}.${fileType}`;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Report downloaded successfully!', { id: 'export' });
    } catch (error: any) {
      console.error('Export error:', error);
      toast.error(error?.message || 'Failed to download report', { id: 'export' });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      variant={variant}
      size="md"
      onClick={handleExport}
      loading={isExporting}
      leftIcon={<ArrowDownTrayIcon className="h-5 w-5" />}
    >
      {label}
    </Button>
  );
};

export default ExportButton;