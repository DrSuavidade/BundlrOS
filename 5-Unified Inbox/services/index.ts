/**
 * Unified Inbox - Service Index
 * 
 * Environment-aware service that switches between mock and Supabase backends.
 * Set VITE_USE_MOCK_BACKEND=true to use mock data.
 */

import { MockInboxService } from './mockService';
import { InboxService as SupabaseInboxService } from './supabaseService';
import type { IntakeItem, Priority } from '../types';

// Check if we should use mock backend
const useMockBackend = import.meta.env.VITE_USE_MOCK_BACKEND === 'true';

// Unified service interface
interface IInboxService {
    getAll: () => Promise<IntakeItem[]>;
    getById: (id: string) => Promise<IntakeItem | null>;
    create: (data: {
        title: string;
        description: string;
        client: string;
        requestor: string;
        priority: Priority;
    }) => Promise<IntakeItem>;
    update: (id: string, updates: Partial<IntakeItem>) => Promise<IntakeItem>;
    delete: (id: string) => Promise<void>;
    getClients: () => Promise<string[]>;
}

// Export the appropriate service based on environment
export const InboxService: IInboxService = useMockBackend
    ? MockInboxService
    : SupabaseInboxService;

// Also export for direct access if needed
export { MockInboxService, SupabaseInboxService };

console.log(`[Inbox] Using ${useMockBackend ? 'MOCK' : 'SUPABASE'} backend`);
