import { Role, User, UserStatus, AuditLog } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'u1',
    name: 'Admin User',
    email: 'admin@nexus.com',
    role: Role.ADMIN,
    status: UserStatus.ACTIVE,
    organizationId: 'org_main',
    createdAt: new Date().toISOString(),
    avatarUrl: 'https://picsum.photos/200/200?random=1'
  },
  {
    id: 'u2',
    name: 'Sarah Designer',
    email: 'sarah@nexus.com',
    role: Role.DESIGNER,
    status: UserStatus.ACTIVE,
    organizationId: 'org_main',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    avatarUrl: 'https://picsum.photos/200/200?random=2'
  },
  {
    id: 'u3',
    name: 'Mike Dev',
    email: 'mike@nexus.com',
    role: Role.DEV,
    status: UserStatus.ACTIVE,
    organizationId: 'org_main',
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    avatarUrl: 'https://picsum.photos/200/200?random=3'
  },
  {
    id: 'u4',
    name: 'Client Dave',
    email: 'dave@client.com',
    role: Role.CLIENT_APPROVER,
    status: UserStatus.ACTIVE,
    organizationId: 'org_client_a',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    avatarUrl: 'https://picsum.photos/200/200?random=4'
  },
  {
    id: 'u5',
    name: 'Inactive User',
    email: 'ghost@nexus.com',
    role: Role.QA,
    status: UserStatus.INACTIVE,
    organizationId: 'org_main',
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
  }
];

export const INITIAL_LOGS: AuditLog[] = [
  {
    id: 'l1',
    action: 'user.created',
    details: 'Created user Client Dave',
    performerId: 'u1',
    performerName: 'Admin User',
    targetId: 'u4',
    timestamp: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 'l2',
    action: 'auth.login',
    details: 'User Admin User logged in',
    performerId: 'u1',
    performerName: 'Admin User',
    timestamp: new Date().toISOString()
  }
];