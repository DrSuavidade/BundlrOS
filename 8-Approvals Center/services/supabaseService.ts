/// <reference types="vite/client" />
/**
 * Approvals Center - Supabase Service
 * 
 * Provides Supabase-backed implementation for approvals.
 * Uses deliverables with 'awaiting_approval' status as the data source,
 * and a separate 'approvals' table for history/tokens.
 */

import {
    DeliverablesApi,
    supabase,
    type Deliverable as SupabaseDeliverable,
} from '@bundlros/supabase';
import { ApprovalRequest, ApprovalStatus, ApprovalEvent, Stats } from '../types';

const APPROVALS_TABLE = 'approvals';

// Helper to get or create approval metadata for a deliverable
const getOrCreateApprovalMetadata = async (deliverableId: string): Promise<{ token: string; history: ApprovalEvent[]; clientEmail: string }> => {
    // Try to fetch from DB
    const { data, error } = await supabase
        .from(APPROVALS_TABLE)
        .select('*')
        .eq('deliverable_id', deliverableId)
        .single();

    if (data) {
        return {
            token: data.token,
            history: data.history as ApprovalEvent[],
            clientEmail: data.client_email || 'client@example.com'
        };
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
    await supabase.from(APPROVALS_TABLE).insert({
        deliverable_id: deliverableId,
        token: newToken,
        client_email: defaultEmail,
        history: initialHistory,
    });

    return {
        token: newToken,
        history: initialHistory,
        clientEmail: defaultEmail
    };
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

    return {
        id: deliverable.id,
        title: deliverable.title,
        description: `Approval requested for deliverable: ${deliverable.title} (Version: ${deliverable.version || 'v1.0'})`,
        clientName: 'Project Team', // In real app: fetch from project->client 
        clientEmail: metadata.clientEmail,
        status: mapStatus(deliverable.status),
        createdAt: deliverable.created_at,
        dueDate: deliverable.due_date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        token: metadata.token,
        history: metadata.history,
    };
};

export const SupabaseApprovalService = {
    init: () => {
        console.log('[Approvals] Supabase service initialized');
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

            // 2. Update Metadata History
            const metadata = await getOrCreateApprovalMetadata(id);
            const newEvent: ApprovalEvent = {
                id: `evt-${Date.now()}`,
                type: 'STATUS_CHANGED',
                timestamp: new Date().toISOString(),
                description: `Status changed to ${status}${comment ? `: "${comment}"` : ''}`,
                actor
            };

            const updatedHistory = [newEvent, ...metadata.history]; // Unshift logic (newest first)

            await supabase
                .from(APPROVALS_TABLE)
                .update({ history: updatedHistory })
                .eq('deliverable_id', id);

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
        const updatedHistory = [newEvent, ...metadata.history];

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
        const updatedHistory = [newEvent, ...metadata.history];

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
