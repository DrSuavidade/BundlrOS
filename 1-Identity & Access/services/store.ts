import { User, AuditLog, Role, UserStatus, Notification, Approval } from '../types';
import { INITIAL_USERS, INITIAL_LOGS } from './mockData';

// Simulating a backend database in local storage
const USERS_KEY = 'nexus_users';
const LOGS_KEY = 'nexus_logs';
const NOTIFICATIONS_KEY = 'nexus_notifications';

const load = <T>(key: string, defaults: T): T => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaults;
  } catch {
    return defaults;
  }
};

const save = <T>(key: string, data: T) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const UserService = {
  getAll: (): User[] => load(USERS_KEY, INITIAL_USERS),

  getById: (id: string): User | undefined => {
    const users = UserService.getAll();
    return users.find(u => u.id === id);
  },

  update: (user: User): User => {
    const users = UserService.getAll();
    const index = users.findIndex(u => u.id === user.id);
    if (index !== -1) {
      users[index] = { ...users[index], ...user };
      save(USERS_KEY, users);
      AuditService.log('user.updated', `Updated user ${user.email}`, 'current_user', 'Current Admin', user.id);
      return users[index];
    }
    throw new Error('User not found');
  },

  create: (data: Omit<User, 'id' | 'createdAt'>): User => {
    const users = UserService.getAll();
    const newUser: User = {
      ...data,
      id: `u${Date.now()}`,
      createdAt: new Date().toISOString(),
      organizationId: 'default',
    };
    users.push(newUser);
    save(USERS_KEY, users);
    AuditService.log('user.created', `Created user ${newUser.email}`, 'current_user', 'Current Admin', newUser.id);
    return newUser;
  },

  delete: (id: string) => {
    const users = UserService.getAll();
    const newUsers = users.filter(u => u.id !== id);
    save(USERS_KEY, newUsers);
  },

  setStatus: (id: string, status: UserStatus) => {
    const users = UserService.getAll();
    const user = users.find(u => u.id === id);
    if (user) {
      user.status = status;
      save(USERS_KEY, users);
      AuditService.log('user.deactivated', `Changed status of ${user.email} to ${status}`, 'current_user', 'Current Admin', id);
    }
  }
};

export const AuditService = {
  getAll: (): AuditLog[] => {
    const logs = load(LOGS_KEY, INITIAL_LOGS);
    return logs.sort((a: AuditLog, b: AuditLog) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  },

  log: (action: AuditLog['action'], details: string, performerId: string, performerName: string, targetId?: string) => {
    const logs = AuditService.getAll();
    const newLog: AuditLog = {
      id: `l${Date.now()}`,
      action,
      details,
      performerId,
      performerName,
      targetId,
      timestamp: new Date().toISOString()
    };
    logs.unshift(newLog); // Prepend
    save(LOGS_KEY, logs);
  }
};

export const NotificationService = {
  getAll: (userId?: string): Notification[] => {
    const notes = load<Notification[]>(NOTIFICATIONS_KEY, []);
    if (userId) return notes.filter(n => n.userId === userId);
    return notes;
  },
  getUnread: (userId: string): Notification[] => {
    const notes = NotificationService.getAll(userId);
    return notes.filter(n => !n.isRead);
  },
  markAsRead: (id: string) => {
    const notes = load<Notification[]>(NOTIFICATIONS_KEY, []);
    const index = notes.findIndex(n => n.id === id);
    if (index !== -1) {
      notes[index].isRead = true;
      save(NOTIFICATIONS_KEY, notes);
    }
  },
  markAllAsRead: (userId: string) => {
    const notes = load<Notification[]>(NOTIFICATIONS_KEY, []);
    let changed = false;
    notes.forEach(n => {
      if (n.userId === userId && !n.isRead) {
        n.isRead = true;
        changed = true;
      }
    });
    if (changed) save(NOTIFICATIONS_KEY, notes);
  }
};
export const ApprovalService = {
  getAll: (): Approval[] => [],
};
