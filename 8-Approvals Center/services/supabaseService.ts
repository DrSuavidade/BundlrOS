/**
 * Approvals Center - Supabase Service
 * 
 * Provides Supabase-backed implementation for approvals.
 * Uses deliverables with 'awaiting_approval' status as the data source.
 */

import {
    DeliverablesApi,
    ClientsApi,
    type Deliverable as SupabaseDeliverable,
} from '@bundlros/supabase';
import { ApprovalRequest, ApprovalStatus, ApprovalEvent, Stats } from '../types';

// In-memory storage for approval-specific data (history, comments)
// This would be a dedicated approvals table in a real system
const approvalMetadata: Map<string, {
    history: ApprovalEvent[];
    token: string;
    clientEmail: string;
}> = new Map();

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
    // Get or create metadata for this deliverable
    if (!approvalMetadata.has(deliverable.id)) {
        approvalMetadata.set(deliverable.id, {
            history: [{
                id: `evt-${Date.now()}`,
                type: 'CREATED',
                timestamp: deliverable.created_at,
                description: 'Approval request created',
                actor: 'System'
            }],
            token: `token-${deliverable.id.slice(0, 8)}`,
            clientEmail: 'client@example.com'
        });
    }

    const metadata = approvalMetadata.get(deliverable.id)!;

    return {
        id: deliverable.id,
        title: deliverable.title,
        description: `Approval requested for deliverable: ${deliverable.title} (Version: ${deliverable.version || 'v1.0'})`,
        clientName: 'Project Team', // Would come from project -> client relation
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
            // Get all deliverables and filter to those needing approval
            const deliverables = await DeliverablesApi.getAll();
            const approvalDeliverables = deliverables.filter(d =>
                ['awaiting_approval', 'approved', 'qa_failed'].includes(d.status)
            );

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
        // Find approval by token from metadata
        const allApprovals = await SupabaseApprovalService.getAll();
        return allApprovals.find(a => a.token === token);
    },

    updateStatus: async (
        id: string,
        status: ApprovalStatus,
        comment: string,
        actor: string
    ): Promise<ApprovalRequest> => {
        try {
            // Map ApprovalStatus to deliverable status
            const statusMap: Record<ApprovalStatus, string> = {
                [ApprovalStatus.PENDING]: 'awaiting_approval',
                [ApprovalStatus.APPROVED]: 'approved',
                [ApprovalStatus.REJECTED]: 'qa_failed',
                [ApprovalStatus.EXPIRED]: 'archived',
            };

            const newStatus = statusMap[status] as 'approved' | 'qa_failed' | 'archived' | 'awaiting_approval';
            await DeliverablesApi.transitionStatus(id, newStatus as any);

            // Update local metadata
            const metadata = approvalMetadata.get(id) || {
                history: [],
                token: `token-${id.slice(0, 8)}`,
                clientEmail: 'client@example.com'
            };

            metadata.history.unshift({
                id: `evt-${Date.now()}`,
                type: 'STATUS_CHANGED',
                timestamp: new Date().toISOString(),
                description: `Status changed to ${status}${comment ? `: "${comment}"` : ''}`,
                actor
            });

            approvalMetadata.set(id, metadata);

            const deliverable = await DeliverablesApi.getById(id);
            if (!deliverable) throw new Error('Approval not found after update');

            return await mapToApprovalRequest(deliverable);
        } catch (error) {
            console.error('[Approvals] Error updating status:', error);
            throw error;
        }
    },

    addComment: async (id: string, comment: string, actor: string): Promise<ApprovalRequest> => {
        const metadata = approvalMetadata.get(id) || {
            history: [],
            token: `token-${id.slice(0, 8)}`,
            clientEmail: 'client@example.com'
        };

        metadata.history.unshift({
            id: `evt-${Date.now()}`,
            type: 'COMMENT_ADDED',
            timestamp: new Date().toISOString(),
            description: `Comment: ${comment}`,
            actor
        });

        approvalMetadata.set(id, metadata);

        const deliverable = await DeliverablesApi.getById(id);
        if (!deliverable) throw new Error('Approval not found');

        return await mapToApprovalRequest(deliverable);
    },

    sendReminder: async (id: string): Promise<void> => {
        const metadata = approvalMetadata.get(id) || {
            history: [],
            token: `token-${id.slice(0, 8)}`,
            clientEmail: 'client@example.com'
        };

        metadata.history.unshift({
            id: `evt-${Date.now()}`,
            type: 'REMINDER_SENT',
            timestamp: new Date().toISOString(),
            description: 'Automated reminder email sent to client.',
            actor: 'System'
        });

        approvalMetadata.set(id, metadata);
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
