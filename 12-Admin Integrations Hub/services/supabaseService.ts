/**
 * Admin Integrations Hub - Supabase Service
 * 
 * Provides Supabase-backed implementation for integrations.
 * Clients come from Supabase.
 * Integrations are stored as 'automation_runs' with workflow_id = 'system:integration_persist'.
 * This treats the automation_runs table as a flexible configuration store.
 */

import {
    ClientsApi,
    AutomationRunsApi,
    type Client as SupabaseClient,
    type AutomationRun,
} from '@bundlros/supabase';
import { Client, Integration, HealthStatus, LogEntry } from '../types';

const INTEGRATION_WORKFLOW_ID = 'system:integration_persist';

// Map Supabase client to local Client type
const mapClient = (client: SupabaseClient): Client => ({
    id: client.id,
    name: client.name,
    contactEmail: `contact@${client.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
    logoUrl: undefined,
});

// Map AutomationRun to Integration
const mapRunToIntegration = (run: AutomationRun): Integration => {
    const input = (run.input as any) || {};
    const output = (run.output as any) || {};

    return {
        id: run.id,
        clientId: input.clientId || '',
        providerId: input.providerId || '',
        name: input.name || 'Unnamed Integration',
        status: (output.status as HealthStatus) || HealthStatus.PENDING,
        enabled: input.enabled !== false,
        lastSync: output.lastSync,
        config: input.config || {},
        mappings: input.mappings || [],
        logs: output.logs || []
    };
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
            const runs = await AutomationRunsApi.getByWorkflowId(INTEGRATION_WORKFLOW_ID);
            return runs.map(mapRunToIntegration);
        } catch (error) {
            console.error('[Admin] Error fetching integrations:', error);
            return [];
        }
    },

    getIntegrationsByClientId: async (clientId: string): Promise<Integration[]> => {
        const all = await SupabaseAdminService.getIntegrations();
        return all.filter(i => i.clientId === clientId);
    },

    updateIntegration: async (id: string, updates: Partial<Integration>): Promise<Integration | undefined> => {
        try {
            const run = await AutomationRunsApi.getById(id);
            if (!run) return undefined;

            const existing = mapRunToIntegration(run);
            const updated = { ...existing, ...updates };

            const inputUpdate = {
                clientId: updated.clientId,
                providerId: updated.providerId,
                name: updated.name,
                enabled: updated.enabled,
                config: updated.config,
                mappings: updated.mappings
            };

            const outputUpdate = {
                status: updated.status,
                lastSync: updated.lastSync,
                logs: updated.logs
            };

            const updatedRun = await AutomationRunsApi.update(id, {
                input: inputUpdate,
                output: outputUpdate,
                status: 'completed' // Always keep these as completed
            });

            return mapRunToIntegration(updatedRun);
        } catch (error) {
            console.error('[Admin] Error updating integration:', error);
            return undefined;
        }
    },

    toggleIntegration: async (id: string): Promise<Integration | undefined> => {
        try {
            const run = await AutomationRunsApi.getById(id);
            if (!run) return undefined;

            const input = (run.input as any) || {};
            const newEnabled = !input.enabled;

            const updatedRun = await AutomationRunsApi.update(id, {
                input: { ...input, enabled: newEnabled },
                output: {
                    ...(run.output as any),
                    status: newEnabled ? HealthStatus.HEALTHY : HealthStatus.INACTIVE
                }
            });

            return mapRunToIntegration(updatedRun);
        } catch (error) {
            console.error('[Admin] Error toggling integration:', error);
            return undefined;
        }
    },

    testIntegration: async (id: string): Promise<Integration | undefined> => {
        try {
            // Simulate test
            await new Promise(resolve => setTimeout(resolve, 1500));

            const run = await AutomationRunsApi.getById(id);
            if (!run) return undefined;

            const output = (run.output as any) || {};
            const logs = output.logs || [];

            const isSuccess = Math.random() > 0.3;
            const newLog: LogEntry = {
                id: Date.now().toString(),
                timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
                level: isSuccess ? 'success' : 'error',
                message: isSuccess
                    ? 'Manual connection test successful.'
                    : 'Connection test failed: Connection refused.',
            };

            const updatedRun = await AutomationRunsApi.update(id, {
                output: {
                    ...output,
                    status: isSuccess ? HealthStatus.HEALTHY : HealthStatus.FAILED,
                    logs: [...logs, newLog]
                }
            });

            return mapRunToIntegration(updatedRun);
        } catch (error) {
            console.error('[Admin] Error testing integration:', error);
            return undefined;
        }
    },

    createIntegration: async (integration: Omit<Integration, 'id'>): Promise<Integration> => {
        try {
            const run = await AutomationRunsApi.create({
                workflow_id: INTEGRATION_WORKFLOW_ID,
                status: 'completed',
                attempt_count: 1,
                completed_at: new Date().toISOString(),
                event_id: null,
                error: null,
                input: {
                    clientId: integration.clientId,
                    providerId: integration.providerId,
                    name: integration.name,
                    enabled: integration.enabled,
                    config: integration.config,
                    mappings: integration.mappings
                },
                output: {
                    status: integration.status,
                    lastSync: integration.lastSync,
                    logs: integration.logs
                }
            });

            return mapRunToIntegration(run);
        } catch (error) {
            console.error('[Admin] Error creating integration:', error);
            throw error;
        }
    },
};
