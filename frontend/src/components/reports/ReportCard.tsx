import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';

interface ReportCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtitle?: string;
  delay?: number;
}

const ReportCard: React.FC<ReportCardProps> = ({
  title,
  value,
  icon: Icon,
  color,
  trend,
  subtitle,
  delay = 0,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${color} flex items-center justify-center`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm font-medium ${
            trend.isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend.isPositive ? (
              <ArrowUpIcon className="h-4 w-4" />
            ) : (
              <ArrowDownIcon className="h-4 w-4" />
            )}
            {Math.abs(trend.value)}%
          </div>
        )}
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
      <p className="text-sm text-gray-600">{title}</p>
      {subtitle && (
        <p className="text-xs text-gray-500 mt-2">{subtitle}</p>
      )}
    </motion.div>
  );
};

export default ReportCard;