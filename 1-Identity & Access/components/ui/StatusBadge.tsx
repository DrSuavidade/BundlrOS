import React from 'react';
import { UserStatus } from '../../types';

interface StatusBadgeProps {
  status: UserStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const styles = {
    [UserStatus.ACTIVE]: 'bg-green-500/10 text-green-400 border-green-500/20',
    [UserStatus.INACTIVE]: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
    [UserStatus.PENDING]: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  };

  return (
    <span className={`px-2 py-0.5 rounded-md text-[10px] uppercase tracking-wider font-semibold border ${styles[status]}`}>
      {status}
    </span>
  );
};