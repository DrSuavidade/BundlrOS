/**
 * Supabase Backend Service
 * 
 * This module provides a Supabase-backed API that maintains backwards compatibility
 * with the original MockAPI interface while using real database operations.
 */

import {
    API,
    ClientsApi,
    ContractsApi,
    ProjectsApi,
    DeliverablesApi,
    SystemEventsApi,
    type Client as SupabaseClient,
    type Contract as SupabaseContract,
    type Project as SupabaseProject,
    type Deliverable as SupabaseDeliverable,
    type SystemEvent as SupabaseSystemEvent,
    type DeliverableStatus as SupabaseDeliverableStatus,
} from '@bundlros/supabase';
import type {
    Client,
    ServiceContract,
    Project,
    Deliverable,
    SystemEvent,
    DeliverableStatus,
    BaseEntity
} from '../types';

// ============================================================================
// Type Converters
// ============================================================================

// Map Supabase types to local types for backwards compatibility
const mapClient = (client: SupabaseClient): Client => ({
    id: client.id,
    name: client.name,
    code: client.code || '',
    industry: client.industry || '',
    status: client.status as Client['status'],
    created_at: client.created_at,
    updated_at: client.updated_at,
    created_by: 'system' // Not tracked in Supabase schema
});

const mapContract = (contract: SupabaseContract): ServiceContract => ({
    id: contract.id,
    client_id: contract.client_id,
    title: contract.title,
    start_date: contract.start_date || '',
    end_date: contract.end_date || '',
    value: contract.value || 0,
    status: (contract.status === 'draft' ? 'pending' : contract.status) as ServiceContract['status'],
    created_at: contract.created_at,
    updated_at: contract.updated_at,
    created_by: 'system'
});

const mapProject = (project: SupabaseProject): Project => ({
    id: project.id,
    client_id: project.client_id,
    contract_id: project.contract_id || undefined,
    name: project.name,
    external_tool: (project.external_tool || 'None') as Project['external_tool'],
    external_id: project.external_id || undefined,
    status: project.status as Project['status'],
    created_at: project.created_at,
    updated_at: project.updated_at,
    created_by: 'system'
});

// Map Supabase deliverable status to local enum
const statusMap: Record<SupabaseDeliverableStatus, DeliverableStatus> = {
    'draft': 'draft' as DeliverableStatus,
    'in_progress': 'draft' as DeliverableStatus, // Map to closest
    'awaiting_approval': 'awaiting_approval' as DeliverableStatus,
    'in_qa': 'in_qa' as DeliverableStatus,
    'qa_failed': 'qa_failed' as DeliverableStatus,
    'approved': 'approved' as DeliverableStatus,
    'published': 'published' as DeliverableStatus,
    'archived': 'archived' as DeliverableStatus,
};

const reverseStatusMap: Record<string, SupabaseDeliverableStatus> = {
    'draft': 'draft',
    'awaiting_approval': 'awaiting_approval',
    'in_qa': 'in_qa',
    'qa_failed': 'qa_failed',
    'approved': 'approved',
    'ready': 'approved', // Map ready to approved
    'published': 'published',
    'archived': 'archived',
};

const mapDeliverable = (deliverable: SupabaseDeliverable): Deliverable => ({
    id: deliverable.id,
    project_id: deliverable.project_id,
    title: deliverable.title,
    type: (deliverable.type || 'document') as Deliverable['type'],
    status: statusMap[deliverable.status] || ('draft' as DeliverableStatus),
    version: deliverable.version || 'v0.1',
    due_date: deliverable.due_date || '',
    created_at: deliverable.created_at,
    updated_at: deliverable.updated_at,
    created_by: 'system'
});

const mapSystemEvent = (event: SupabaseSystemEvent): SystemEvent => ({
    id: event.id,
    type: event.type,
    entity_id: (event.payload as Record<string, unknown>)?.entity_id as string || event.client_id || '',
    timestamp: event.created_at,
    details: JSON.stringify(event.payload) || ''
});

// ============================================================================
// Supabase API Implementation
// ============================================================================

export const SupabaseAPI = {
    // Initialize (no-op for Supabase, connection is automatic)
    init: async (): Promise<void> => {
        console.log('[SupabaseAPI] Initialized connection to Supabase');
    },

    // Clients
    getClients: async (): Promise<Client[]> => {
        const clients = await ClientsApi.getAll();
        return clients.map(mapClient);
    },

    createClient: async (data: Omit<Client, keyof BaseEntity>): Promise<Client> => {
        const created = await ClientsApi.create({
            name: data.name,
            code: data.code || null,
            industry: data.industry || null,
            status: data.status as SupabaseClient['status'],
        });
        return mapClient(created);
    },

    // Contracts
    getContracts: async (): Promise<ServiceContract[]> => {
        const contracts = await ContractsApi.getAll();
        return contracts.map(mapContract);
    },

    // Projects
    getProjects: async (): Promise<Project[]> => {
        const projects = await ProjectsApi.getAll();
        return projects.map(mapProject);
    },

    // Deliverables
    getDeliverables: async (): Promise<Deliverable[]> => {
        const deliverables = await DeliverablesApi.getAll();
        return deliverables.map(mapDeliverable);
    },

    createDeliverable: async (data: Omit<Deliverable, keyof BaseEntity>): Promise<Deliverable> => {
        const created = await DeliverablesApi.create({
            project_id: data.project_id,
            title: data.title,
            type: data.type as SupabaseDeliverable['type'],
            status: reverseStatusMap[data.status] || 'draft',
            version: data.version || null,
            due_date: data.due_date || null,
        });
        return mapDeliverable(created);
    },

    // State Machine Logic
    transitionDeliverable: async (id: string, newStatus: DeliverableStatus): Promise<Deliverable> => {
        const supabaseStatus = reverseStatusMap[newStatus] || 'draft';
        const updated = await DeliverablesApi.transitionStatus(id, supabaseStatus);
        return mapDeliverable(updated);
    },

    // Events
    getEvents: async (): Promise<SystemEvent[]> => {
        const events = await SystemEventsApi.getAll(100);
        return events.map(mapSystemEvent);
    },
};

// Export both APIs - SupabaseAPI for real data, MockAPI for local development
export { SupabaseAPI as API };

// For convenience, also re-export the full typed API
export {
    ClientsApi,
    ContractsApi,
    ProjectsApi,
    DeliverablesApi,
    SystemEventsApi
} from '@bundlros/supabase';
