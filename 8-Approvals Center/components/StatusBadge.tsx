import React from 'react';
import { ApprovalStatus } from '../types';
import { CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';

interface Props {
  status: ApprovalStatus;
  className?: string;
}

export const StatusBadge: React.FC<Props> = ({ status, className = '' }) => {
  switch (status) {
    case ApprovalStatus.APPROVED:
      return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-green-50 text-green-700 border border-green-200 ${className}`}>
          <CheckCircle2 size={16} />
          Approved
        </span>
      );
    case ApprovalStatus.REJECTED:
      return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-red-50 text-red-700 border border-red-200 ${className}`}>
          <XCircle size={16} />
          Rejected
        </span>
      );
    case ApprovalStatus.EXPIRED:
      return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600 border border-gray-200 ${className}`}>
          <AlertCircle size={16} />
          Expired
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-amber-50 text-amber-700 border border-amber-200 ${className}`}>
          <Clock size={16} />
          Pending
        </span>
      );
  }
};