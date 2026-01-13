/**
 * Admin Integrations Hub - Service Index
 */

import { SupabaseAdminService } from './supabaseService';
import type { Client, Integration } from '../types';

// Unified service interface
export interface IAdminService {
    getClients: () => Promise<Client[]>;
    getIntegrations: () => Promise<Integration[]>;
    getIntegrationsByClientId: (clientId: string) => Promise<Integration[]>;
    updateIntegration: (id: string, updates: Partial<Integration>) => Promise<Integration | undefined>;
    toggleIntegration: (id: string) => Promise<Integration | undefined>;
    testIntegration: (id: string) => Promise<Integration | undefined>;
    createIntegration: (integration: Omit<Integration, 'id'>) => Promise<Integration>;
}

export const AdminService: IAdminService = SupabaseAdminService;

export { SupabaseAdminService };
