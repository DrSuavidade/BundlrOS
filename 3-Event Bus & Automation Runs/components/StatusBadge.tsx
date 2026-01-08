import React from 'react';
import { Status } from '../types';
import { CheckCircle2, XCircle, Clock, PlayCircle, CircleDashed } from 'lucide-react';

interface Props {
  status: Status;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<Props> = ({ status, size = 'md' }) => {
  const styles = {
    [Status.SUCCESS]: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    [Status.FAILED]: 'text-rose-400 bg-rose-400/10 border-rose-400/20',
    [Status.WAITING]: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    [Status.RUNNING]: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    [Status.CREATED]: 'text-slate-400 bg-slate-400/10 border-slate-400/20',
  };

  const icons = {
    [Status.SUCCESS]: CheckCircle2,
    [Status.FAILED]: XCircle,
    [Status.WAITING]: Clock,
    [Status.RUNNING]: PlayCircle,
    [Status.CREATED]: CircleDashed,
  };

  const Icon = icons[status];
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1';
  const iconSize = size === 'sm' ? 12 : 16;

  return (
    <div className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${styles[status]} ${sizeClasses}`}>
      <Icon size={iconSize} />
      <span className="uppercase tracking-wider">{status}</span>
    </div>
  );
};
