/**
 * Identity & Access - Store Index
 * 
 * Environment-aware store that switches between mock (localStorage) and Supabase backends.
 * Set VITE_USE_MOCK_BACKEND=true to use localStorage mock data.
 */

// Check if we should use mock backend
const useMockBackend = import.meta.env.VITE_USE_MOCK_BACKEND === 'true';

// Import the appropriate implementation
import { UserService as MockUserService, AuditService as MockAuditService, NotificationService as MockNotificationService } from './store';
import { UserService as SupabaseUserService, AuditService as SupabaseAuditService, NotificationService as SupabaseNotificationService, ApprovalService as SupabaseApprovalService } from './supabaseStore';
import type { User, AuditLog, UserStatus, Notification, Approval } from '../types';

// Wrapper to make sync mock API compatible with async Supabase API
const wrapSyncToAsync = <T>(fn: () => T): (() => Promise<T>) => {
    return async () => fn();
};

// Create unified interfaces
interface IUserService {
    getAll: () => Promise<User[]>;
    getById: (id: string) => Promise<User | undefined>;
    update: (user: User) => Promise<User>;
    create: (data: Omit<User, 'id' | 'createdAt'>) => Promise<User>;
    delete: (id: string) => Promise<void>;
    setStatus: (id: string, status: UserStatus) => Promise<void>;
}

interface IAuditService {
    getAll: () => Promise<AuditLog[]>;
    log: (action: AuditLog['action'], details: string, performerId: string, performerName: string, targetId?: string) => Promise<void>;
}

interface INotificationService {
    getAll: (userId?: string) => Promise<Notification[]>;
    getUnread: (userId: string) => Promise<Notification[]>;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: (userId: string) => Promise<void>;
}

interface IApprovalService {
    getAll: () => Promise<Approval[]>;
}

// Export the appropriate service based on environment
export const UserService: IUserService = useMockBackend
    ? {
        getAll: wrapSyncToAsync(MockUserService.getAll),
        getById: async (id) => MockUserService.getById(id),
        update: async (user) => MockUserService.update(user),
        create: async (data) => MockUserService.create(data),
        delete: async (id) => MockUserService.delete(id),
        setStatus: async (id, status) => MockUserService.setStatus(id, status),
    }
    : SupabaseUserService;

export const AuditService: IAuditService = useMockBackend
    ? {
        getAll: wrapSyncToAsync(MockAuditService.getAll),
        log: async (action, details, performerId, performerName, targetId) => {
            MockAuditService.log(action, details, performerId, performerName, targetId);
        },
    }
    : SupabaseAuditService;

export const NotificationService: INotificationService = useMockBackend
    ? {
        getAll: wrapSyncToAsync(MockNotificationService.getAll),
        getUnread: wrapSyncToAsync(() => []), // Mock not fully implemented for filtering
        markAsRead: async (id) => MockNotificationService.markAsRead(id),
        markAllAsRead: async (userId) => MockNotificationService.markAllAsRead(userId),
    }
    : SupabaseNotificationService;

// Note: Approvals are not currently mocked in local store
export const ApprovalService: IApprovalService = useMockBackend
    ? {
        getAll: async () => [],
    }
    : SupabaseApprovalService;

console.log(`[Identity Store] Using ${useMockBackend ? 'MOCK' : 'SUPABASE'} backend`);
