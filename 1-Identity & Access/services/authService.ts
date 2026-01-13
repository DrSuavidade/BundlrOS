/**
 * Supabase Authentication Service
 * 
 * This service handles user authentication by checking against the Supabase profiles table.
 * It supports both Supabase Auth (for real auth) and simple email lookup (for demo mode).
 */

import { supabase, ProfilesApi, AuditLogsApi, type Profile } from '@bundlros/supabase';
import type { User } from '../types';
import { Role, UserStatus } from '../types';

// Map Supabase role to local Role enum
const roleMap: Record<string, Role> = {
    admin: Role.ADMIN,
    am: Role.AM,
    podlead: Role.POD_LEAD,
    qa: Role.QA,
    designer: Role.DESIGNER,
    dev: Role.DEV,
    client_approver: Role.CLIENT_APPROVER,
};

// Map Supabase status to local UserStatus enum
const statusMap: Record<string, UserStatus> = {
    active: UserStatus.ACTIVE,
    inactive: UserStatus.INACTIVE,
    pending: UserStatus.PENDING,
};

// Convert Supabase Profile to local User type
const mapProfileToUser = (profile: Profile): User => ({
    id: profile.id,
    email: profile.email,
    name: profile.name || profile.email.split('@')[0], // Use name field, fallback to email prefix
    title: profile.title || undefined,
    role: roleMap[profile.role] || Role.DEV,
    status: statusMap[profile.status] || UserStatus.PENDING,
    avatarUrl: profile.avatar_url || undefined,
    createdAt: profile.created_at,
    organizationId: profile.organization_id || 'default',
});

export interface AuthResult {
    success: boolean;
    user?: User;
    error?: string;
}

export const AuthService = {
    /**
     * Authenticate user by email and password
     * Checks if user exists in profiles table, verifies password, and is active
     */
    async loginByEmail(email: string, password: string): Promise<AuthResult> {
        try {
            console.log('[Auth] Attempting login for:', email.toLowerCase());

            // Query the profiles table for the user
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('email', email.toLowerCase())
                .single();

            console.log('[Auth] Query result:', { data, error });

            if (error) {
                if (error.code === 'PGRST116') {
                    // User not found
                    console.log('[Auth] User not found');
                    return { success: false, error: 'Invalid email or password.' };
                }
                console.error('[Auth] Query error:', error);
                return { success: false, error: 'An error occurred during authentication.' };
            }

            const profile = data as Profile;
            console.log('[Auth] Profile found:', {
                email: profile.email,
                status: profile.status,
                hasPassword: !!profile.password_hash,
                passwordHash: profile.password_hash,
                inputPassword: password
            });

            // Verify password (simple comparison for demo - use bcrypt in production!)
            if (!profile.password_hash || profile.password_hash !== password) {
                console.log('[Auth] Password mismatch:', {
                    stored: profile.password_hash,
                    provided: password,
                    match: profile.password_hash === password
                });
                return { success: false, error: 'Invalid email or password.' };
            }

            // Check if user is active
            if (profile.status !== 'active') {
                return {
                    success: false,
                    error: profile.status === 'pending'
                        ? 'Your account is pending approval.'
                        : 'Your account has been deactivated.'
                };
            }

            const user = mapProfileToUser(profile);

            // Log the login event (non-blocking - don't fail login if audit fails)
            try {
                await AuditLogsApi.create({
                    action: `auth.login`,
                    performer_id: profile.id,
                    details: {
                        name: profile.name || profile.email.split('@')[0],
                        email: profile.email,
                        timestamp: new Date().toISOString()
                    }
                });
            } catch (auditErr) {
                console.warn('[Auth] Failed to log audit event:', auditErr);
            }

            console.log('[Auth] Login successful for:', profile.email);
            return { success: true, user };
        } catch (err) {
            console.error('Auth exception:', err);
            return { success: false, error: 'An unexpected error occurred.' };
        }
    },

    /**
     * Authenticate with Supabase Auth (email + password)
     * For production use with real authentication
     */
    async loginWithPassword(email: string, password: string): Promise<AuthResult> {
        try {
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) {
                return { success: false, error: authError.message };
            }

            if (!authData.user) {
                return { success: false, error: 'Authentication failed.' };
            }

            // Get the profile from the profiles table
            const profile = await ProfilesApi.getById(authData.user.id);

            if (!profile) {
                return { success: false, error: 'User profile not found.' };
            }

            if (profile.status !== 'active') {
                await supabase.auth.signOut();
                return {
                    success: false,
                    error: profile.status === 'pending'
                        ? 'Your account is pending approval.'
                        : 'Your account has been deactivated.'
                };
            }

            return { success: true, user: mapProfileToUser(profile) };
        } catch (err) {
            console.error('Auth exception:', err);
            return { success: false, error: 'An unexpected error occurred.' };
        }
    },

    /**
     * Log out the current user
     */
    async logout(userId?: string, userEmail?: string): Promise<void> {
        // Log the logout event
        if (userId) {
            try {
                await AuditLogsApi.create({
                    action: 'auth.logout',
                    performer_id: userId,
                    details: { email: userEmail || 'unknown', timestamp: new Date().toISOString() }
                });
            } catch (auditErr) {
                console.warn('[Auth] Failed to log logout event:', auditErr);
            }
        }

        await supabase.auth.signOut();
    },

    /**
     * Get all users from the profiles table
     */
    async getAllUsers(): Promise<User[]> {
        const profiles = await ProfilesApi.getAll();
        return profiles.map(mapProfileToUser);
    },

    /**
     * Check if email exists in the database
     */
    async emailExists(email: string): Promise<boolean> {
        const { data, error } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', email.toLowerCase())
            .single();

        return !error && !!data;
    }
};
