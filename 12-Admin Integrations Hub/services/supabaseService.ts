/**
 * Admin Integrations Hub - Supabase Service
 * 
 * Provides Supabase-backed implementation for integrations.
 * Clients come from Supabase, integrations remain in-memory (would need dedicated table).
 */

import {
    ClientsApi,
    type Client as SupabaseClient,
} from '@bundlros/supabase';
import { Client, Integration, HealthStatus, LogEntry } from '../types';

// In-memory storage for integrations (would be a dedicated integrations table)
let integrationsCache: Integration[] = [];

// Map Supabase client to local Client type
const mapClient = (client: SupabaseClient): Client => ({
    id: client.id,
    name: client.name,
    contactEmail: `contact@${client.name.toLowerCase().replace(/\s+/g, '')}.com`,
    logoUrl: undefined,
});

// Generate initial integrations for a client
const generateIntegrationsForClient = (clientId: string, clientName: string): Integration[] => {
    // Generate some default integrations based on client
    const providers = ['salesforce', 'hubspot', 'slack'];
    const randomProvider = providers[Math.floor(Math.random() * providers.length)];

    return [{
        id: `int-${clientId}-${randomProvider}`,
        clientId,
        providerId: randomProvider,
        name: `${clientName} - ${randomProvider.charAt(0).toUpperCase() + randomProvider.slice(1)}`,
        status: HealthStatus.HEALTHY,
        enabled: true,
        lastSync: new Date().toISOString().replace('T', ' ').substring(0, 19),
        config: { endpointUrl: `https://${clientName.toLowerCase().replace(/\s+/g, '')}.example.com` },
        mappings: [{ sourceField: 'user_email', destinationField: 'Email' }],
        logs: [{
            id: `log-${Date.now()}`,
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
            level: 'success',
            message: 'Initial connection established.',
        }],
    }];
};

export const SupabaseAdminService = {
    getClients: async (): Promise<Client[]> => {
        try {
            const supabaseClients = await ClientsApi.getAll();
            return supabaseClients.map(mapClient);
        } catch (error) {
            console.error('[Admin] Error fetching clients:', error);
            return [];
        }
    },

    getIntegrations: async (): Promise<Integration[]> => {
        try {
            // If no cached integrations, generate from clients
            if (integrationsCache.length === 0) {
                const clients = await SupabaseAdminService.getClients();
                clients.forEach(client => {
                    const integrations = generateIntegrationsForClient(client.id, client.name);
                    integrationsCache.push(...integrations);
                });
            }
            return integrationsCache;
        } catch (error) {
            console.error('[Admin] Error fetching integrations:', error);
            return [];
        }
    },

    getIntegrationsByClientId: async (clientId: string): Promise<Integration[]> => {
        const all = await SupabaseAdminService.getIntegrations();
        return all.filter(i => i.clientId === clientId);
    },

    updateIntegration: (id: string, updates: Partial<Integration>): Integration | undefined => {
        const index = integrationsCache.findIndex(i => i.id === id);
        if (index === -1) return undefined;

        integrationsCache[index] = { ...integrationsCache[index], ...updates };
        return integrationsCache[index];
    },

    toggleIntegration: (id: string): Integration | undefined => {
        const integration = integrationsCache.find(i => i.id === id);
        if (!integration) return undefined;

        const newEnabled = !integration.enabled;
        return SupabaseAdminService.updateIntegration(id, {
            enabled: newEnabled,
            status: newEnabled ? HealthStatus.HEALTHY : HealthStatus.INACTIVE,
        });
    },

    testIntegration: async (id: string): Promise<Integration | undefined> => {
        // Simulate test
        await new Promise(resolve => setTimeout(resolve, 1500));

        const integration = integrationsCache.find(i => i.id === id);
        if (!integration) return undefined;

        const isSuccess = Math.random() > 0.3;
        const newLog: LogEntry = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
            level: isSuccess ? 'success' : 'error',
            message: isSuccess
                ? 'Manual connection test successful.'
                : 'Connection test failed: Connection refused.',
        };

        return SupabaseAdminService.updateIntegration(id, {
            status: isSuccess ? HealthStatus.HEALTHY : HealthStatus.FAILED,
            logs: [...integration.logs, newLog],
        });
    },

    createIntegration: (integration: Omit<Integration, 'id'>): Integration => {
        const newIntegration: Integration = {
            ...integration,
            id: `int-${Date.now()}`,
        };
        integrationsCache.push(newIntegration);
        return newIntegration;
    },
};
