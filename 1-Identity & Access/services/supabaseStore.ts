/**
 * Identity & Access - Supabase Store
 * 
 * This replaces the localStorage-based mock store with real Supabase database operations.
 * Provides backward-compatible interface for UserService and AuditService.
 */

import { ProfilesApi, AuditLogsApi, type Profile, type AuditLog as SupabaseAuditLog } from '@bundlros/supabase';
import { User, AuditLog, Role, UserStatus } from '../types';

// Map Supabase profile to local User type
const mapProfileToUser = (profile: Profile): User => ({
    id: profile.id,
    email: profile.email,
    name: profile.email.split('@')[0], // Use email prefix as name
    role: (profile.role as Role) || Role.DEV,
    status: (profile.status as UserStatus) || UserStatus.PENDING,
    avatarUrl: profile.avatar_url || undefined,
    createdAt: profile.created_at,
    organizationId: profile.organization_id || 'default',
});

// Map Supabase audit log to local AuditLog type
const mapSupabaseAuditLog = (log: SupabaseAuditLog): AuditLog => ({
    id: log.id,
    action: (log.action as AuditLog['action']) || 'user.updated',
    details: typeof log.details === 'object' && log.details !== null
        ? (log.details as Record<string, unknown>).message as string || JSON.stringify(log.details)
        : String(log.details || ''),
    performerId: log.performer_id || 'system',
    performerName: typeof log.details === 'object' && log.details !== null
        ? (log.details as Record<string, unknown>).performer_name as string || 'System'
        : 'System',
    targetId: log.target_id || undefined,
    timestamp: log.created_at,
});

export const UserService = {
    getAll: async (): Promise<User[]> => {
        try {
            const profiles = await ProfilesApi.getAll();
            return profiles.map(mapProfileToUser);
        } catch (error) {
            console.error('[UserService] Error fetching users:', error);
            return [];
        }
    },

    getById: async (id: string): Promise<User | undefined> => {
        try {
            const profile = await ProfilesApi.getById(id);
            return profile ? mapProfileToUser(profile) : undefined;
        } catch (error) {
            console.error('[UserService] Error fetching user:', error);
            return undefined;
        }
    },

    update: async (user: User): Promise<User> => {
        try {
            const updatedProfile = await ProfilesApi.update(user.id, {
                email: user.email,
                role: user.role as unknown as import('@bundlros/supabase').UserRole,
                status: user.status as unknown as import('@bundlros/supabase').UserStatus,
                organization_id: user.organizationId,
                avatar_url: user.avatarUrl || null,
            });

            // Log the action
            await AuditService.log(
                'user.updated',
                `Updated user ${user.email}`,
                'current_user',
                'Current Admin',
                user.id
            );

            return mapProfileToUser(updatedProfile);
        } catch (error) {
            console.error('[UserService] Error updating user:', error);
            throw error;
        }
    },

    create: async (data: Omit<User, 'id' | 'createdAt'>): Promise<User> => {
        try {
            // Note: Creating users in Supabase Auth requires auth.admin privilege
            // For now, we create a profile entry (assumes FK constraint is removed)
            const newProfile = await ProfilesApi.update(crypto.randomUUID(), {
                email: data.email,
                role: data.role as unknown as import('@bundlros/supabase').UserRole,
                status: data.status as unknown as import('@bundlros/supabase').UserStatus,
                organization_id: data.organizationId,
                avatar_url: data.avatarUrl || null,
            });

            await AuditService.log(
                'user.created',
                `Created user ${data.email}`,
                'current_user',
                'Current Admin',
                newProfile.id
            );

            return mapProfileToUser(newProfile);
        } catch (error) {
            console.error('[UserService] Error creating user:', error);
            throw error;
        }
    },

    delete: async (id: string): Promise<void> => {
        // Supabase profiles typically shouldn't be deleted directly
        // Instead, we deactivate them
        await UserService.setStatus(id, UserStatus.INACTIVE);
    },

    setStatus: async (id: string, status: UserStatus): Promise<void> => {
        try {
            const profile = await ProfilesApi.getById(id);
            if (profile) {
                await ProfilesApi.update(id, { status: status as unknown as import('@bundlros/supabase').UserStatus });
                await AuditService.log(
                    'user.deactivated',
                    `Changed status of ${profile.email} to ${status}`,
                    'current_user',
                    'Current Admin',
                    id
                );
            }
        } catch (error) {
            console.error('[UserService] Error setting status:', error);
        }
    },
};

export const AuditService = {
    getAll: async (): Promise<AuditLog[]> => {
        try {
            const logs = await AuditLogsApi.getAll(100);
            return logs.map(mapSupabaseAuditLog);
        } catch (error) {
            console.error('[AuditService] Error fetching logs:', error);
            return [];
        }
    },

    log: async (
        action: AuditLog['action'],
        details: string,
        performerId: string,
        performerName: string,
        targetId?: string
    ): Promise<void> => {
        try {
            await AuditLogsApi.create({
                action,
                performer_id: performerId,
                target_id: targetId || null,
                details: { message: details, performer_name: performerName },
            });
        } catch (error) {
            console.warn('[AuditService] Failed to log event:', error);
            // Don't throw - audit logging should not break the main flow
        }
    },
};
