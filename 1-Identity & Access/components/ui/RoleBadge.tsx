import React from 'react';
import { Role } from '../../types';

interface RoleBadgeProps {
  role: Role;
}

const roleColors: Record<Role, string> = {
  [Role.ADMIN]: 'bg-red-500/10 text-red-400 border-red-500/20',
  [Role.AM]: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  [Role.POD_LEAD]: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  [Role.QA]: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  [Role.DESIGNER]: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  [Role.DEV]: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  [Role.CLIENT_APPROVER]: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
};

const roleLabels: Record<Role, string> = {
  [Role.ADMIN]: 'Admin',
  [Role.AM]: 'Account Manager',
  [Role.POD_LEAD]: 'Pod Lead',
  [Role.QA]: 'QA',
  [Role.DESIGNER]: 'Designer',
  [Role.DEV]: 'Developer',
  [Role.CLIENT_APPROVER]: 'Client',
};

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role }) => {
  const colorClass = roleColors[role] || 'bg-gray-500/10 text-gray-400 border-gray-500/20';
  const label = roleLabels[role] || role;

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClass}`}>
      {label}
    </span>
  );
};