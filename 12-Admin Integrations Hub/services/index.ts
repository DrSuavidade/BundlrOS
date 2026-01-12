/**
 * Admin Integrations Hub - Service Index
 * 
 * Environment-aware service that switches between mock and Supabase backends.
 * Set VITE_USE_MOCK_BACKEND=true to use mock data.
 */

import { SupabaseAdminService } from './supabaseService';
import type { Client, Integration, HealthStatus, LogEntry } from '../types';

// Check if we should use mock backend
const useMockBackend = import.meta.env.VITE_USE_MOCK_BACKEND === 'true';

// Mock data (inline for simplicity)
const MOCK_CLIENTS: Client[] = [
    { id: 'c1', name: 'Acme Corp', contactEmail: 'admin@acme.com' },
    { id: 'c2', name: 'Globex Inc', contactEmail: 'it@globex.com' },
];

const MOCK_INTEGRATIONS: Integration[] = [
    {
        id: 'i1',
        clientId: 'c1',
        providerId: 'salesforce',
        name: 'Salesforce CRM (Main)',
        status: 'HEALTHY' as HealthStatus,
        enabled: true,
        lastSync: '2023-10-27 14:30:00',
        config: { endpointUrl: 'https://acme.my.salesforce.com' },
        mappings: [{ sourceField: 'user_email', destinationField: 'Email' }],
        logs: [{ id: 'l1', timestamp: '2023-10-27 14:30:00', level: 'success', message: 'Sync completed successfully.' }],
    },
];

let mockIntegrations = [...MOCK_INTEGRATIONS];

// Mock service
const MockAdminService = {
    getClients: async (): Promise<Client[]> => MOCK_CLIENTS,

    getIntegrations: async (): Promise<Integration[]> => mockIntegrations,

    getIntegrationsByClientId: async (clientId: string): Promise<Integration[]> =>
        mockIntegrations.filter(i => i.clientId === clientId),

    updateIntegration: (id: string, updates: Partial<Integration>): Integration | undefined => {
        const index = mockIntegrations.findIndex(i => i.id === id);
        if (index === -1) return undefined;
        mockIntegrations[index] = { ...mockIntegrations[index], ...updates };
        return mockIntegrations[index];
    },

    toggleIntegration: (id: string): Integration | undefined => {
        const integration = mockIntegrations.find(i => i.id === id);
        if (!integration) return undefined;
        const newEnabled = !integration.enabled;
        return MockAdminService.updateIntegration(id, {
            enabled: newEnabled,
            status: (newEnabled ? 'HEALTHY' : 'INACTIVE') as HealthStatus,
        });
    },

    testIntegration: async (id: string): Promise<Integration | undefined> => {
        await new Promise(resolve => setTimeout(resolve, 1500));
        const integration = mockIntegrations.find(i => i.id === id);
        if (!integration) return undefined;
        const isSuccess = Math.random() > 0.3;
        const newLog: LogEntry = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
            level: isSuccess ? 'success' : 'error',
            message: isSuccess ? 'Test successful.' : 'Test failed.',
        };
        return MockAdminService.updateIntegration(id, {
            status: (isSuccess ? 'HEALTHY' : 'FAILED') as HealthStatus,
            logs: [...integration.logs, newLog],
        });
    },

    createIntegration: (integration: Omit<Integration, 'id'>): Integration => {
        const newIntegration: Integration = { ...integration, id: `int-${Date.now()}` };
        mockIntegrations.push(newIntegration);
        return newIntegration;
    },
};

// Unified service interface
interface IAdminService {
    getClients: () => Promise<Client[]>;
    getIntegrations: () => Promise<Integration[]>;
    getIntegrationsByClientId: (clientId: string) => Promise<Integration[]>;
    updateIntegration: (id: string, updates: Partial<Integration>) => Integration | undefined;
    toggleIntegration: (id: string) => Integration | undefined;
    testIntegration: (id: string) => Promise<Integration | undefined>;
    createIntegration: (integration: Omit<Integration, 'id'>) => Integration;
}

// Export the appropriate service based on environment
export const AdminService: IAdminService = useMockBackend
    ? MockAdminService
    : SupabaseAdminService;

// Also export for direct access if needed
export { MockAdminService, SupabaseAdminService };

console.log(`[Admin] Using ${useMockBackend ? 'MOCK' : 'SUPABASE'} backend`);
