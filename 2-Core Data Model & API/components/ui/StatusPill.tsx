import React from 'react';
import { DeliverableStatus } from '../../types';

interface StatusPillProps {
  status: string;
  size?: 'sm' | 'md';
}

const getColors = (status: string) => {
  switch (status) {
    // Deliverable Statuses
    case DeliverableStatus.DRAFT:
      return 'bg-slate-100 text-slate-600 border-slate-200';
    case DeliverableStatus.AWAITING_APPROVAL:
      return 'bg-amber-50 text-amber-600 border-amber-200';
    case DeliverableStatus.APPROVED:
      return 'bg-blue-50 text-blue-600 border-blue-200';
    case DeliverableStatus.IN_QA:
      return 'bg-purple-50 text-purple-600 border-purple-200';
    case DeliverableStatus.QA_FAILED:
      return 'bg-red-50 text-red-600 border-red-200';
    case DeliverableStatus.READY:
      return 'bg-emerald-50 text-emerald-600 border-emerald-200';
    case DeliverableStatus.PUBLISHED:
      return 'bg-indigo-50 text-indigo-600 border-indigo-200';
    case DeliverableStatus.ARCHIVED:
      return 'bg-slate-800 text-slate-300 border-slate-700';
    
    // Generic Statuses
    case 'active':
      return 'bg-green-50 text-green-700 border-green-200';
    case 'inactive':
      return 'bg-gray-100 text-gray-500 border-gray-200';
    case 'pending':
      return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    case 'completed':
      return 'bg-blue-50 text-blue-700 border-blue-200';
      
    default:
      return 'bg-gray-100 text-gray-600 border-gray-200';
  }
};

const formatLabel = (status: string) => {
  return status.replace(/_/g, ' ').toUpperCase();
};

export const StatusPill: React.FC<StatusPillProps> = ({ status, size = 'sm' }) => {
  const colors = getColors(status);
  const padding = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs';
  
  return (
    <span className={`inline-flex items-center justify-center font-mono font-medium border rounded-full ${colors} ${padding}`}>
      {formatLabel(status)}
    </span>
  );
};