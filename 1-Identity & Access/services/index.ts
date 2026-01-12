/**
 * Identity & Access - Store Index
 * 
 * Environment-aware store that switches between mock (localStorage) and Supabase backends.
 * Set VITE_USE_MOCK_BACKEND=true to use localStorage mock data.
 */

// Check if we should use mock backend
const useMockBackend = import.meta.env.VITE_USE_MOCK_BACKEND === 'true';

// Import the appropriate implementation
import { UserService as MockUserService, AuditService as MockAuditService } from './store';
import { UserService as SupabaseUserService, AuditService as SupabaseAuditService } from './supabaseStore';
import type { User, AuditLog, UserStatus } from '../types';

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

console.log(`[Identity Store] Using ${useMockBackend ? 'MOCK' : 'SUPABASE'} backend`);
