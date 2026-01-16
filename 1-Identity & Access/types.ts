export enum Role {
  ADMIN = 'admin',
  AM = 'am',
  POD_LEAD = 'pod_lead',
  QA = 'qa',
  DESIGNER = 'designer',
  DEV = 'dev',
  CLIENT_APPROVER = 'client_approver'
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending'
}

export interface User {
  id: string;
  email: string;
  name: string;
  title?: string;
  role: Role;
  status: UserStatus;
  avatarUrl?: string;
  createdAt: string;
  lastLogin?: string;
  organizationId: string;
}

export interface AuditLog {
  id: string;
  action: 'user.created' | 'user.updated' | 'user.role_changed' | 'auth.login' | 'auth.logout' | 'user.deactivated';
  details: string;
  performerId: string;
  performerName: string;
  targetId?: string;
  timestamp: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string | null;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  link: string | null;
  createdAt: string;
}

export interface Approval {
  deliverableId: string;
  token: string;
  title: string | null;
  status: string | null;
  assigneeId: string | null;
  createdAt: string;
}