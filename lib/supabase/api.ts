/**
 * BundlrOS Data API - Supabase Backend
 * 
 * This module provides typed API functions for all database operations,
 * replacing the localStorage-based mock backend with real Supabase calls.
 */

import { supabase } from './client';
import type {
    Client, ClientInsert, ClientUpdate,
    Contact, ContactInsert, ContactUpdate,
    Contract, ContractInsert, ContractUpdate,
    Project, ProjectInsert, ProjectUpdate,
    Deliverable, DeliverableInsert, DeliverableUpdate, DeliverableStatus,
    Budget, BudgetInsert, BudgetUpdate,
    IntakeItem, IntakeItemInsert, IntakeItemUpdate,
    SystemEvent, SystemEventInsert,
    AutomationRun, AutomationRunInsert, AutomationRunUpdate,
    AuditLog, AuditLogInsert,
    Profile, ProfileUpdate,
    FileAsset, FileAssetInsert, FileAssetUpdate,
    Notification, NotificationInsert, NotificationUpdate,
    Approval,
} from './types';

// ============================================================================
// Error Handling
// ============================================================================

export class ApiError extends Error {
    constructor(
        message: string,
        public code: string,
        public details?: unknown
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

function handleError(error: { message: string; code?: string; details?: unknown }): never {
    throw new ApiError(error.message, error.code || 'UNKNOWN_ERROR', error.details);
}

// ============================================================================
// Profiles API
// ============================================================================

export const ProfilesApi = {
    async getAll(): Promise<Profile[]> {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) handleError(error);
        return (data || []) as Profile[];
    },

    async getById(id: string): Promise<Profile | null> {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', id)
            .single();

        if (error && error.code !== 'PGRST116') handleError(error);
        return data as Profile | null;
    },

    async update(id: string, updates: ProfileUpdate): Promise<Profile> {
        const updateData = { ...updates, updated_at: new Date().toISOString() };
        const { data, error } = await supabase
            .from('profiles')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) handleError(error);
        return data as Profile;
    },

    async getCurrentUser(): Promise<Profile | null> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;
        return this.getById(user.id);
    }
};

// ============================================================================
// Clients API
// ============================================================================

export const ClientsApi = {
    async getAll(): Promise<Client[]> {
        const { data, error } = await supabase
            .from('clients')
            .select('*')
            .order('name', { ascending: true });

        if (error) handleError(error);
        return (data || []) as Client[];
    },

    async getById(id: string): Promise<Client | null> {
        const { data, error } = await supabase
            .from('clients')
            .select('*')
            .eq('id', id)
            .single();

        if (error && error.code !== 'PGRST116') handleError(error);
        return data as Client | null;
    },

    async create(client: ClientInsert): Promise<Client> {
        const { data, error } = await supabase
            .from('clients')
            .insert(client)
            .select()
            .single();

        if (error) handleError(error);

        const result = data as Client;

        // Log the event
        await SystemEventsApi.create({
            type: 'client.created',
            client_id: result.id,
            payload: { name: result.name, code: result.code },
            status: 'created'
        });

        return result;
    },

    async update(id: string, updates: ClientUpdate): Promise<Client> {
        const updateData = { ...updates, updated_at: new Date().toISOString() };
        const { data, error } = await supabase
            .from('clients')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) handleError(error);

        const result = data as Client;

        await SystemEventsApi.create({
            type: 'client.updated',
            client_id: id,
            payload: updates as Record<string, unknown>,
            status: 'created'
        });

        return result;
    },

    async delete(id: string): Promise<void> {
        // Unlink system events first to avoid foreign key constraints
        const { error: eventError } = await supabase
            .from('system_events')
            .update({ client_id: null })
            .eq('client_id', id);

        if (eventError) handleError(eventError);

        // Ideally we should handle other relations too, but for new clients this is usually the blocker.

        const { error } = await supabase
            .from('clients')
            .delete()
            .eq('id', id);

        if (error) handleError(error);
    },

    async getByStatus(status: Client['status']): Promise<Client[]> {
        const { data, error } = await supabase
            .from('clients')
            .select('*')
            .eq('status', status)
            .order('name', { ascending: true });

        if (error) handleError(error);
        return (data || []) as Client[];
    }
};

// ============================================================================
// Contacts API
// ============================================================================

export const ContactsApi = {
    async getAll(): Promise<Contact[]> {
        const { data, error } = await supabase
            .from('contacts')
            .select('*')
            .order('name', { ascending: true });

        if (error) handleError(error);
        return (data || []) as Contact[];
    },

    async getByClientId(clientId: string): Promise<Contact[]> {
        const { data, error } = await supabase
            .from('contacts')
            .select('*')
            .eq('client_id', clientId)
            .order('name', { ascending: true });

        if (error) handleError(error);
        return (data || []) as Contact[];
    },

    async create(contact: ContactInsert): Promise<Contact> {
        const { data, error } = await supabase
            .from('contacts')
            .insert(contact)
            .select()
            .single();

        if (error) handleError(error);
        return data as Contact;
    },

    async update(id: string, updates: ContactUpdate): Promise<Contact> {
        const updateData = { ...updates, updated_at: new Date().toISOString() };
        const { data, error } = await supabase
            .from('contacts')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) handleError(error);
        return data as Contact;
    },

    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from('contacts')
            .delete()
            .eq('id', id);

        if (error) handleError(error);
    }
};

// ============================================================================
// Contracts API
// ============================================================================

export const ContractsApi = {
    async getAll(): Promise<Contract[]> {
        const { data, error } = await supabase
            .from('contracts')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) handleError(error);
        return (data || []) as Contract[];
    },

    async getById(id: string): Promise<Contract | null> {
        const { data, error } = await supabase
            .from('contracts')
            .select('*')
            .eq('id', id)
            .single();

        if (error && error.code !== 'PGRST116') handleError(error);
        return data as Contract | null;
    },

    async getByClientId(clientId: string): Promise<Contract[]> {
        const { data, error } = await supabase
            .from('contracts')
            .select('*')
            .eq('client_id', clientId)
            .order('start_date', { ascending: false });

        if (error) handleError(error);
        return (data || []) as Contract[];
    },

    async create(contract: ContractInsert): Promise<Contract> {
        const { data, error } = await supabase
            .from('contracts')
            .insert(contract)
            .select()
            .single();

        if (error) handleError(error);

        const result = data as Contract;

        // Create Service Factory automatically
        try {
            const { data: client } = await supabase
                .from('clients')
                .select('name')
                .eq('id', contract.client_id)
                .single();

            if (client) {
                // Create Project automatically
                await supabase
                    .from('projects')
                    .insert({
                        client_id: contract.client_id,
                        contract_id: result.id,
                        name: `${client.name} - ${contract.title || 'Contract'}`,
                        status: 'active',
                        external_tool: null,
                        external_id: null
                    });

                // Create Service Factory
                await supabase.from('service_factories').insert({
                    contract_id: result.id,
                    client_name: client.name,
                    template_id: 'null',
                    status: 'IDLE'
                });
            }
        } catch (factoryError) {
            console.error('Failed to create service factory:', factoryError);
            // Proceed without failing the contract creation
        }

        await SystemEventsApi.create({
            type: 'contract.created',
            client_id: contract.client_id,
            payload: { title: result.title, value: result.value },
            status: 'created'
        });

        return result;
    },

    async update(id: string, updates: ContractUpdate): Promise<Contract> {
        const updateData = { ...updates, updated_at: new Date().toISOString() };
        const { data, error } = await supabase
            .from('contracts')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) handleError(error);
        return data as Contract;
    },

    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from('contracts')
            .delete()
            .eq('id', id);

        if (error) handleError(error);
    }
};

// ============================================================================
// Projects API
// ============================================================================

export const ProjectsApi = {
    async getAll(): Promise<Project[]> {
        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) handleError(error);
        return (data || []) as Project[];
    },

    async getById(id: string): Promise<Project | null> {
        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .eq('id', id)
            .single();

        if (error && error.code !== 'PGRST116') handleError(error);
        return data as Project | null;
    },

    async getByClientId(clientId: string): Promise<Project[]> {
        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .eq('client_id', clientId)
            .order('name', { ascending: true });

        if (error) handleError(error);
        return (data || []) as Project[];
    },

    async create(project: ProjectInsert): Promise<Project> {
        const { data, error } = await supabase
            .from('projects')
            .insert(project)
            .select()
            .single();

        if (error) handleError(error);

        const result = data as Project;

        await SystemEventsApi.create({
            type: 'project.created',
            client_id: project.client_id,
            payload: { name: result.name },
            status: 'created'
        });

        return result;
    },

    async update(id: string, updates: ProjectUpdate): Promise<Project> {
        const updateData = { ...updates, updated_at: new Date().toISOString() };
        const { data, error } = await supabase
            .from('projects')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) handleError(error);
        return data as Project;
    },

    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from('projects')
            .delete()
            .eq('id', id);

        if (error) handleError(error);
    }
};

// ============================================================================
// Deliverables API
// ============================================================================

export const DeliverablesApi = {
    async getAll(): Promise<Deliverable[]> {
        const { data, error } = await supabase
            .from('deliverables')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) handleError(error);
        return (data || []) as Deliverable[];
    },

    async getById(id: string): Promise<Deliverable | null> {
        const { data, error } = await supabase
            .from('deliverables')
            .select('*')
            .eq('id', id)
            .single();

        if (error && error.code !== 'PGRST116') handleError(error);
        return data as Deliverable | null;
    },

    async getByProjectId(projectId: string): Promise<Deliverable[]> {
        const { data, error } = await supabase
            .from('deliverables')
            .select('*')
            .eq('project_id', projectId)
            .order('due_date', { ascending: true });

        if (error) handleError(error);
        return (data || []) as Deliverable[];
    },

    async create(deliverable: DeliverableInsert): Promise<Deliverable> {
        const { data, error } = await supabase
            .from('deliverables')
            .insert(deliverable)
            .select()
            .single();

        if (error) handleError(error);

        const result = data as Deliverable;

        await SystemEventsApi.create({
            type: 'deliverable.created',
            payload: { title: result.title, project_id: result.project_id },
            status: 'created'
        });

        return result;
    },

    async update(id: string, updates: DeliverableUpdate): Promise<Deliverable> {
        const updateData = { ...updates, updated_at: new Date().toISOString() };
        const { data, error } = await supabase
            .from('deliverables')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) handleError(error);
        return data as Deliverable;
    },

    async transitionStatus(id: string, newStatus: DeliverableStatus): Promise<Deliverable> {
        const deliverable = await this.getById(id);
        if (!deliverable) {
            throw new ApiError('Deliverable not found', 'NOT_FOUND');
        }

        const oldStatus = deliverable.status;
        const { data, error } = await supabase
            .from('deliverables')
            .update({
                status: newStatus,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) handleError(error);

        const result = data as Deliverable;

        await SystemEventsApi.create({
            type: 'deliverable.status_changed',
            payload: {
                deliverable_id: id,
                old_status: oldStatus,
                new_status: newStatus
            },
            status: 'created'
        });

        return result;
    },

    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from('deliverables')
            .delete()
            .eq('id', id);

        if (error) handleError(error);
    }
};

// ============================================================================
// Budgets API
// ============================================================================

export const BudgetsApi = {
    async getAll(): Promise<Budget[]> {
        const { data, error } = await supabase
            .from('budgets')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) handleError(error);
        return (data || []) as Budget[];
    },

    async getById(id: string): Promise<Budget | null> {
        const { data, error } = await supabase
            .from('budgets')
            .select('*')
            .eq('id', id)
            .single();

        if (error && error.code !== 'PGRST116') handleError(error);
        return data as Budget | null;
    },

    async getByClientId(clientId: string): Promise<Budget[]> {
        const { data, error } = await supabase
            .from('budgets')
            .select('*')
            .eq('client_id', clientId)
            .order('created_at', { ascending: false });

        if (error) handleError(error);
        return (data || []) as Budget[];
    },

    async create(budget: BudgetInsert): Promise<Budget> {
        const { data, error } = await supabase
            .from('budgets')
            .insert(budget)
            .select()
            .single();

        if (error) handleError(error);
        return data as Budget;
    },

    async update(id: string, updates: BudgetUpdate): Promise<Budget> {
        const updateData = { ...updates, updated_at: new Date().toISOString() };
        const { data, error } = await supabase
            .from('budgets')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) handleError(error);
        return data as Budget;
    },

    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from('budgets')
            .delete()
            .eq('id', id);

        if (error) handleError(error);
    }
};

// ============================================================================
// Intake Items API
// ============================================================================

export const IntakeItemsApi = {
    async getAll(): Promise<IntakeItem[]> {
        const { data, error } = await supabase
            .from('intake_items')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) handleError(error);
        return (data || []) as IntakeItem[];
    },

    async getById(id: string): Promise<IntakeItem | null> {
        const { data, error } = await supabase
            .from('intake_items')
            .select('*')
            .eq('id', id)
            .single();

        if (error && error.code !== 'PGRST116') handleError(error);
        return data as IntakeItem | null;
    },

    async getByStatus(status: IntakeItem['status']): Promise<IntakeItem[]> {
        const { data, error } = await supabase
            .from('intake_items')
            .select('*')
            .eq('status', status)
            .order('sla_due_at', { ascending: true });

        if (error) handleError(error);
        return (data || []) as IntakeItem[];
    },

    async create(item: IntakeItemInsert): Promise<IntakeItem> {
        const { data, error } = await supabase
            .from('intake_items')
            .insert(item)
            .select()
            .single();

        if (error) handleError(error);

        const result = data as IntakeItem;

        await SystemEventsApi.create({
            type: 'intake.created',
            client_id: item.client_id ?? null,
            payload: { title: result.title, priority: result.priority },
            status: 'created'
        });

        return result;
    },

    async update(id: string, updates: IntakeItemUpdate): Promise<IntakeItem> {
        const updateData = { ...updates, updated_at: new Date().toISOString() };
        const { data, error } = await supabase
            .from('intake_items')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) handleError(error);
        return data as IntakeItem;
    },

    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from('intake_items')
            .delete()
            .eq('id', id);

        if (error) handleError(error);
    }
};

// ============================================================================
// System Events API
// ============================================================================

export const SystemEventsApi = {
    async getAll(limit = 100): Promise<SystemEvent[]> {
        const { data, error } = await supabase
            .from('system_events')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) handleError(error);
        return (data || []) as SystemEvent[];
    },

    async getByType(type: string): Promise<SystemEvent[]> {
        const { data, error } = await supabase
            .from('system_events')
            .select('*')
            .eq('type', type)
            .order('created_at', { ascending: false });

        if (error) handleError(error);
        return (data || []) as SystemEvent[];
    },

    async getByClientId(clientId: string): Promise<SystemEvent[]> {
        const { data, error } = await supabase
            .from('system_events')
            .select('*')
            .eq('client_id', clientId)
            .order('created_at', { ascending: false });

        if (error) handleError(error);
        return (data || []) as SystemEvent[];
    },

    async create(event: SystemEventInsert): Promise<SystemEvent> {
        const insertData = {
            ...event,
            idempotency_key: event.idempotency_key || `${event.type}-${Date.now()}-${Math.random().toString(36).slice(2)}`
        };
        const { data, error } = await supabase
            .from('system_events')
            .insert(insertData)
            .select()
            .single();

        if (error) handleError(error);
        return data as SystemEvent;
    }
};

// ============================================================================
// Automation Runs API
// ============================================================================

export const AutomationRunsApi = {
    async getAll(): Promise<AutomationRun[]> {
        const { data, error } = await supabase
            .from('automation_runs')
            .select('*')
            .order('started_at', { ascending: false });

        if (error) handleError(error);
        return (data || []) as AutomationRun[];
    },

    async getByWorkflowId(workflowId: string): Promise<AutomationRun[]> {
        const { data, error } = await supabase
            .from('automation_runs')
            .select('*')
            .eq('workflow_id', workflowId)
            .order('started_at', { ascending: false });

        if (error) handleError(error);
        return (data || []) as AutomationRun[];
    },

    async getById(id: string): Promise<AutomationRun | null> {
        const { data, error } = await supabase
            .from('automation_runs')
            .select('*')
            .eq('id', id)
            .single();

        if (error && error.code !== 'PGRST116') handleError(error);
        return data as AutomationRun | null;
    },

    async create(run: AutomationRunInsert): Promise<AutomationRun> {
        const { data, error } = await supabase
            .from('automation_runs')
            .insert(run)
            .select()
            .single();

        if (error) handleError(error);
        return data as AutomationRun;
    },

    async update(id: string, updates: AutomationRunUpdate): Promise<AutomationRun> {
        const { data, error } = await supabase
            .from('automation_runs')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) handleError(error);
        return data as AutomationRun;
    },

    async complete(id: string, output: Record<string, unknown>): Promise<AutomationRun> {
        return this.update(id, {
            status: 'completed',
            output,
            completed_at: new Date().toISOString()
        });
    },

    async fail(id: string, errorData: Record<string, unknown>): Promise<AutomationRun> {
        return this.update(id, {
            status: 'failed',
            error: errorData,
            completed_at: new Date().toISOString()
        });
    },

    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from('automation_runs')
            .delete()
            .eq('id', id);

        if (error) handleError(error);
    }
};

// ============================================================================
// Notifications API
// ============================================================================

export const NotificationsApi = {
    async getAll(userId?: string): Promise<Notification[]> {
        let query = supabase
            .from('notifications')
            .select('*')
            .order('created_at', { ascending: false });

        if (userId) {
            query = query.eq('user_id', userId);
        }

        const { data, error } = await query;

        if (error) handleError(error);
        return (data || []) as Notification[];
    },

    async getUnread(userId: string): Promise<Notification[]> {
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', userId)
            .eq('is_read', false)
            .order('created_at', { ascending: false });

        if (error) handleError(error);
        return (data || []) as Notification[];
    },

    async create(notification: NotificationInsert): Promise<Notification> {
        const { data, error } = await supabase
            .from('notifications')
            .insert(notification)
            .select()
            .single();

        if (error) handleError(error);
        return data as Notification;
    },

    async markAsRead(id: string): Promise<Notification> {
        const { data, error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', id)
            .select()
            .single();

        if (error) handleError(error);
        return data as Notification;
    },

    async markAllAsRead(userId: string): Promise<void> {
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', userId);

        if (error) handleError(error);
    },

    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from('notifications')
            .delete()
            .eq('id', id);

        if (error) handleError(error);
    }
};

// ============================================================================
// Approvals API
// ============================================================================

export const ApprovalsApi = {
    async getAll(): Promise<Approval[]> {
        const { data, error } = await supabase
            .from('approvals')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) handleError(error);
        return (data || []) as Approval[];
    },

    async getByStatus(status: string): Promise<Approval[]> {
        const { data, error } = await supabase
            .from('approvals')
            .select('*')
            .eq('status', status)
            .order('created_at', { ascending: false });

        if (error) handleError(error);
        return (data || []) as Approval[];
    }
};

// ============================================================================
// Audit Logs API
// ============================================================================

export const AuditLogsApi = {
    async getAll(limit = 100): Promise<AuditLog[]> {
        const { data, error } = await supabase
            .from('audit_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) handleError(error);
        return (data || []) as AuditLog[];
    },

    async getByPerformerId(performerId: string): Promise<AuditLog[]> {
        const { data, error } = await supabase
            .from('audit_logs')
            .select('*')
            .eq('performer_id', performerId)
            .order('created_at', { ascending: false });

        if (error) handleError(error);
        return (data || []) as AuditLog[];
    },

    async create(log: AuditLogInsert): Promise<AuditLog> {
        const { data, error } = await supabase
            .from('audit_logs')
            .insert(log)
            .select()
            .single();

        if (error) handleError(error);
        return data as AuditLog;
    },

    async getByTargetId(targetId: string): Promise<AuditLog[]> {
        const { data, error } = await supabase
            .from('audit_logs')
            .select('*')
            .eq('target_id', targetId)
            .order('created_at', { ascending: false });

        if (error) handleError(error);
        return (data || []) as AuditLog[];
    }
};

// ============================================================================
// File Assets API
// ============================================================================

export const FileAssetsApi = {
    async getAll(): Promise<FileAsset[]> {
        const { data, error } = await supabase
            .from('file_assets')
            .select('*')
            .order('uploaded_at', { ascending: false });

        if (error) handleError(error);
        return (data || []) as FileAsset[];
    },

    async getByClientId(clientId: string): Promise<FileAsset[]> {
        const { data, error } = await supabase
            .from('file_assets')
            .select('*')
            .eq('client_id', clientId)
            .order('uploaded_at', { ascending: false });

        if (error) handleError(error);
        return (data || []) as FileAsset[];
    },

    async create(asset: FileAssetInsert): Promise<FileAsset> {
        const { data, error } = await supabase
            .from('file_assets')
            .insert(asset)
            .select()
            .single();

        if (error) handleError(error);

        const result = data as FileAsset;

        await SystemEventsApi.create({
            type: 'asset.uploaded',
            client_id: asset.client_id,
            payload: { filename: result.filename, type: result.mime_type },
            status: 'created'
        });

        return result;
    }
};

// ============================================================================
// Unified API Object (for backwards compatibility with MockAPI)
// ============================================================================

export const API = {
    profiles: ProfilesApi,
    clients: ClientsApi,
    contacts: ContactsApi,
    contracts: ContractsApi,
    projects: ProjectsApi,
    deliverables: DeliverablesApi,
    budgets: BudgetsApi,
    intakeItems: IntakeItemsApi,
    systemEvents: SystemEventsApi,
    automationRuns: AutomationRunsApi,
    auditLogs: AuditLogsApi,
    fileAssets: FileAssetsApi,

    // Backwards compatible methods
    init: () => Promise.resolve(), // No-op, Supabase handles its own initialization
    getClients: ClientsApi.getAll,
    createClient: ClientsApi.create,
    getContracts: ContractsApi.getAll,
    getProjects: ProjectsApi.getAll,
    getDeliverables: DeliverablesApi.getAll,
    createDeliverable: DeliverablesApi.create,
    transitionDeliverable: DeliverablesApi.transitionStatus,
    getEvents: SystemEventsApi.getAll,
};

