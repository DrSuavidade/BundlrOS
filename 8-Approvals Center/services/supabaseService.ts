/// <reference types="vite/client" />
/**
 * Approvals Center - Supabase Service
 * 
 * Provides Supabase-backed implementation for approvals.
 * Uses 'approvals' table for context (description, assets) and history.
 * Syncs status with 'deliverables' table.
 */

import { createClient } from '@supabase/supabase-js';
import {
    DeliverablesApi,
    type Deliverable as SupabaseDeliverable,
} from '@bundlros/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);
import { ApprovalRequest, ApprovalStatus, ApprovalEvent, Stats } from '../types';

const APPROVALS_TABLE = 'approvals';

interface ApprovalDBRow {
    deliverable_id: string;
    token: string;
    client_email?: string;
    history: any;
    title?: string;
    description?: string;
    asset_url?: string;
    asset_name?: string;
    version?: string;
    status?: string;
    assignee_id?: string;
}

// Helper to get or create approval metadata for a deliverable
const getOrCreateApprovalMetadata = async (deliverableId: string): Promise<ApprovalDBRow> => {
    // Try to fetch from DB
    const { data, error } = await supabase
        .from(APPROVALS_TABLE)
        .select('*')
        .eq('deliverable_id', deliverableId)
        .single();

    if (data) {
        return data as ApprovalDBRow;
    }

    // If not found (or error), create new default
    const newToken = `token-${deliverableId.slice(0, 8)}-${Date.now().toString(36)}`;
    const initialHistory: ApprovalEvent[] = [{
        id: `evt-${Date.now()}`,
        type: 'CREATED',
        timestamp: new Date().toISOString(),
        description: 'Approval request initialized',
        actor: 'System'
    }];
    const defaultEmail = 'client@example.com';

    // Persist it
    const newRecord = {
        deliverable_id: deliverableId,
        token: newToken,
        client_email: defaultEmail,
        history: initialHistory,
        // Default description and version could be set here if we fetched deliverable first, 
        // but valid to leave null and fallback in mapToApprovalRequest
    };

    await supabase.from(APPROVALS_TABLE).insert(newRecord);

    return newRecord;
};

// Map deliverable status to approval status
const mapStatus = (status: string): ApprovalStatus => {
    switch (status) {
        case 'awaiting_approval':
            return ApprovalStatus.PENDING;
        case 'approved':
        case 'published':
            return ApprovalStatus.APPROVED;
        case 'qa_failed':
            return ApprovalStatus.REJECTED;
        default:
            return ApprovalStatus.PENDING;
    }
};

// Map Supabase deliverable to ApprovalRequest
const mapToApprovalRequest = async (deliverable: SupabaseDeliverable): Promise<ApprovalRequest> => {
    const metadata = await getOrCreateApprovalMetadata(deliverable.id);

    const fileAsset = await getLatestFileAsset(deliverable.id);
    // Prefer direct column from approval, fallback to lookup
    const factoryAssigneeId = metadata.assignee_id || await getFactoryAssignee(deliverable.id);

    return {
        id: deliverable.id,
        // Use metadata title if specific to approval, else fallback to deliverable
        title: metadata.title || deliverable.title,
        // Use metadata description if exists, else generic fallback
        description: metadata.description || `Approval requested for deliverable: ${deliverable.title} (Version: ${deliverable.version || 'v1.0'})`,
        clientName: await getClientName(deliverable.id), // Fetch real client name 
        clientEmail: metadata.client_email || 'client@example.com',
        // Status: Prioritize metadata.status (Approvals table). If null, default to PENDING.
        // We ignore deliverable.status here because "null" validation is requested to be PENDING, 
        // preventing "Approved" deliverable state from leaking into a new Approval Request.
        status: (metadata.status as ApprovalStatus) || ApprovalStatus.PENDING,
        createdAt: deliverable.created_at,
        dueDate: deliverable.due_date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        token: metadata.token,
        history: metadata.history as ApprovalEvent[],
        attachmentName: metadata.asset_name || fileAsset?.filename,
        attachmentUrl: metadata.asset_url || fileAsset?.public_url,
        attachmentSize: fileAsset?.size_bytes,
        attachmentType: fileAsset?.mime_type,
        assigneeId: factoryAssigneeId,
    };
};

const getLatestFileAsset = async (deliverableId: string) => {
    const { data } = await supabase
        .from('file_assets')
        .select('filename, public_url, size_bytes, mime_type')
        .eq('deliverable_id', deliverableId)
        .order('uploaded_at', { ascending: false })
        .limit(1)
        .single();
    return data;
};

const getClientName = async (deliverableId: string): Promise<string> => {
    const { data } = await supabase
        .from('deliverables')
        .select('project:projects(client:clients(name))')
        .eq('id', deliverableId)
        .maybeSingle();

    return (data as any)?.project?.client?.name || 'Project Team';
};

const getFactoryAssignee = async (deliverableId: string): Promise<string | undefined> => {
    // 1. Get Project's Contract ID from Deliverable
    // Note: We cast to any because Typescript types might not reflect the deep relation fully yet
    const { data: deliverable } = await supabase
        .from('deliverables')
        .select('project:projects(contract_id)')
        .eq('id', deliverableId)
        .single();

    const contractId = (deliverable as any)?.project?.contract_id;
    if (!contractId) return undefined;

    // 2. Get Factory Assignee from Service Factory
    const { data: factory } = await supabase
        .from('service_factories')
        .select('assignee_id')
        .eq('contract_id', contractId)
        .single();

    return factory?.assignee_id;
};

export const SupabaseApprovalService = {
    init: () => {
        console.log('[Approvals] Supabase service initialized');
    },

    getCurrentUser: async () => {
        // 1. Try Supabase Auth (Real DB Auth)
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) return session.user;

        // 2. Fallback to LocalStorage 'nexus_session' (Demo/Mock Auth)
        try {
            const localSession = localStorage.getItem('nexus_session');
            if (localSession) {
                const user = JSON.parse(localSession);
                // Return a structure compatible with Supabase User
                return {
                    id: user.id,
                    email: user.email,
                    app_metadata: {},
                    user_metadata: { ...user },
                    aud: 'authenticated',
                    created_at: new Date().toISOString()
                } as any;
            }
        } catch (e) {
            console.warn('Failed to parse local session', e);
        }

        return null;
    },

    getAll: async (): Promise<ApprovalRequest[]> => {
        try {
            // Get all deliverables and filter to those needing approval or recently processed
            const deliverables = await DeliverablesApi.getAll();
            const approvalDeliverables = deliverables.filter(d =>
                ['awaiting_approval', 'approved', 'qa_failed'].includes(d.status)
            );

            // Map efficiently
            const approvals = await Promise.all(
                approvalDeliverables.map(mapToApprovalRequest)
            );

            return approvals;
        } catch (error) {
            console.error('[Approvals] Error fetching approvals:', error);
            return [];
        }
    },

    getById: async (id: string): Promise<ApprovalRequest | undefined> => {
        try {
            const deliverable = await DeliverablesApi.getById(id);
            if (!deliverable) return undefined;
            return await mapToApprovalRequest(deliverable);
        } catch (error) {
            console.error('[Approvals] Error fetching approval:', error);
            return undefined;
        }
    },

    getByToken: async (token: string): Promise<ApprovalRequest | undefined> => {
        try {
            // Find approval ID by token first
            const { data } = await supabase
                .from(APPROVALS_TABLE)
                .select('deliverable_id')
                .eq('token', token)
                .single();

            if (!data) return undefined;

            return await SupabaseApprovalService.getById(data.deliverable_id);
        } catch (error) {
            console.error('[Approvals] Error finding by token', error);
            return undefined;
        }
    },

    updateStatus: async (
        id: string,
        status: ApprovalStatus,
        comment: string,
        actor: string
    ): Promise<ApprovalRequest> => {
        try {
            // 1. Update Deliverable Status
            const statusMap: Record<ApprovalStatus, string> = {
                [ApprovalStatus.PENDING]: 'awaiting_approval',
                [ApprovalStatus.APPROVED]: 'approved',
                [ApprovalStatus.REJECTED]: 'qa_failed',
                [ApprovalStatus.EXPIRED]: 'archived',
            };

            const newStatus = statusMap[status] as any;
            await DeliverablesApi.transitionStatus(id, newStatus);

            // 2. Update Metadata History & Status
            const metadata = await getOrCreateApprovalMetadata(id);
            const newEvent: ApprovalEvent = {
                id: `evt-${Date.now()}`,
                type: 'STATUS_CHANGED',
                timestamp: new Date().toISOString(),
                description: `Status changed to ${status}${comment ? `: "${comment}"` : ''}`,
                actor
            };

            const updatedHistory = [newEvent, ...(metadata.history as ApprovalEvent[])];

            await supabase
                .from(APPROVALS_TABLE)
                .update({
                    history: updatedHistory,
                    status: status // Persist status in approvals table too for record keeping
                })
                .eq('deliverable_id', id);

            // 3. Reactivate Factory if Rejected
            if (status === ApprovalStatus.REJECTED) {
                try {
                    // Find contract_id via deliverable -> project
                    const { data: deliverableData } = await supabase
                        .from('deliverables')
                        .select('project_id')
                        .eq('id', id)
                        .single();

                    if (deliverableData) {
                        const { data: projectData } = await supabase
                            .from('projects')
                            .select('contract_id')
                            .eq('id', deliverableData.project_id)
                            .single();

                        if (projectData && projectData.contract_id) {
                            // Update factory status to ACTIVE to allow revisions
                            await supabase
                                .from('service_factories')
                                .update({
                                    status: 'active', // Reactivate factory
                                    // Optionally append a log? simpler just to reset status for now.
                                })
                                .eq('contract_id', projectData.contract_id);
                        }
                    }
                } catch (e) {
                    console.error('[Approvals] Failed to reactivate factory:', e);
                }
            }

            // 3. Return fresh object
            const deliverable = await DeliverablesApi.getById(id);
            if (!deliverable) throw new Error('Deliverable lost');
            return await mapToApprovalRequest(deliverable);

        } catch (error) {
            console.error('[Approvals] Error updating status:', error);
            throw error;
        }
    },

    addComment: async (id: string, comment: string, actor: string): Promise<ApprovalRequest> => {
        const metadata = await getOrCreateApprovalMetadata(id);
        const newEvent: ApprovalEvent = {
            id: `evt-${Date.now()}`,
            type: 'COMMENT_ADDED',
            timestamp: new Date().toISOString(),
            description: `Comment: ${comment}`,
            actor
        };
        const updatedHistory = [newEvent, ...(metadata.history as ApprovalEvent[])];

        await supabase
            .from(APPROVALS_TABLE)
            .update({ history: updatedHistory })
            .eq('deliverable_id', id);

        const deliverable = await DeliverablesApi.getById(id);
        if (!deliverable) throw new Error('Deliverable not found');
        return await mapToApprovalRequest(deliverable);
    },

    sendReminder: async (id: string): Promise<void> => {
        const metadata = await getOrCreateApprovalMetadata(id);
        const newEvent: ApprovalEvent = {
            id: `evt-${Date.now()}`,
            type: 'REMINDER_SENT',
            timestamp: new Date().toISOString(),
            description: 'Automated reminder email sent to client.',
            actor: 'System'
        };
        const updatedHistory = [newEvent, ...(metadata.history as ApprovalEvent[])];

        await supabase
            .from(APPROVALS_TABLE)
            .update({ history: updatedHistory })
            .eq('deliverable_id', id);
    },

    getStats: async (): Promise<Stats> => {
        const all = await SupabaseApprovalService.getAll();
        return {
            total: all.length,
            pending: all.filter(a => a.status === ApprovalStatus.PENDING).length,
            approved: all.filter(a => a.status === ApprovalStatus.APPROVED).length,
            rejected: all.filter(a => a.status === ApprovalStatus.REJECTED).length,
        };
    }
};
