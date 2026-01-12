/**
 * Unified Inbox - Supabase Service
 * 
 * Provides Supabase-backed implementation for intake items.
 */

import {
    IntakeItemsApi,
    ClientsApi,
    type IntakeItem as SupabaseIntakeItem,
} from '@bundlros/supabase';
import { IntakeItem, Priority, Status, AIAnalysisResult } from '../types';

// Map Supabase status to local Status enum
const mapStatus = (status: string): Status => {
    switch (status) {
        case 'New':
            return Status.NEW;
        case 'Triaged':
        case 'Triaging':
            return Status.TRIAGING;
        case 'In Progress':
            return Status.IN_PROGRESS;
        case 'Done':
        case 'Resolved':
            return Status.RESOLVED;
        case 'Archived':
        case 'Closed':
            return Status.CLOSED;
        default:
            return Status.NEW;
    }
};

// Map Supabase priority to local Priority enum
const mapPriority = (priority: string): Priority => {
    switch (priority) {
        case 'Low':
            return Priority.LOW;
        case 'Medium':
            return Priority.MEDIUM;
        case 'High':
            return Priority.HIGH;
        case 'Critical':
            return Priority.CRITICAL;
        default:
            return Priority.MEDIUM;
    }
};

// Map Supabase IntakeItem to local type
const mapIntakeItem = async (item: SupabaseIntakeItem): Promise<IntakeItem> => {
    // Get client name
    let clientName = 'Unknown Client';
    if (item.client_id) {
        try {
            const client = await ClientsApi.getById(item.client_id);
            if (client) clientName = client.name;
        } catch {
            // Keep default
        }
    }

    return {
        id: item.id,
        title: item.title,
        description: item.description || '',
        client: clientName,
        requestor: item.requestor || 'unknown@example.com',
        priority: mapPriority(item.priority),
        status: mapStatus(item.status),
        createdAt: item.created_at,
        slaDueAt: item.sla_due_at || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        assignee: item.assignee_id || undefined,
        tags: item.tags || [],
        aiAnalysis: item.ai_analysis ? (item.ai_analysis as unknown as AIAnalysisResult) : undefined,
    };
};

export const InboxService = {
    getAll: async (): Promise<IntakeItem[]> => {
        try {
            const items = await IntakeItemsApi.getAll();
            const mapped = await Promise.all(items.map(mapIntakeItem));
            return mapped;
        } catch (error) {
            console.error('[Inbox] Error fetching items:', error);
            return [];
        }
    },

    getById: async (id: string): Promise<IntakeItem | null> => {
        try {
            const item = await IntakeItemsApi.getById(id);
            if (!item) return null;
            return await mapIntakeItem(item);
        } catch (error) {
            console.error('[Inbox] Error fetching item:', error);
            return null;
        }
    },

    create: async (data: {
        title: string;
        description: string;
        client: string;
        requestor: string;
        priority: Priority;
    }): Promise<IntakeItem> => {
        try {
            // Find client by name to get ID
            const clients = await ClientsApi.getAll();
            const client = clients.find(c => c.name === data.client);

            const item = await IntakeItemsApi.create({
                title: data.title,
                description: data.description,
                client_id: client?.id || null,
                requestor: data.requestor,
                priority: data.priority as 'Low' | 'Medium' | 'High' | 'Critical',
                status: 'New',
                sla_due_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                tags: [],
                assignee_id: null,
                ai_analysis: null,
            });

            return await mapIntakeItem(item);
        } catch (error) {
            console.error('[Inbox] Error creating item:', error);
            throw error;
        }
    },

    update: async (id: string, updates: Partial<IntakeItem>): Promise<IntakeItem> => {
        try {
            const updateData: Record<string, unknown> = {};

            if (updates.title) updateData.title = updates.title;
            if (updates.description) updateData.description = updates.description;
            if (updates.priority) updateData.priority = updates.priority;
            if (updates.status) {
                // Map local status to Supabase status
                const statusMap: Record<Status, string> = {
                    [Status.NEW]: 'New',
                    [Status.TRIAGING]: 'Triaged',
                    [Status.IN_PROGRESS]: 'In Progress',
                    [Status.BLOCKED]: 'In Progress', // No direct mapping
                    [Status.RESOLVED]: 'Done',
                    [Status.CLOSED]: 'Archived',
                };
                updateData.status = statusMap[updates.status];
            }
            if (updates.assignee) updateData.assignee_id = updates.assignee;
            if (updates.tags) updateData.tags = updates.tags;
            if (updates.aiAnalysis) updateData.ai_analysis = updates.aiAnalysis;

            const item = await IntakeItemsApi.update(id, updateData);
            return await mapIntakeItem(item);
        } catch (error) {
            console.error('[Inbox] Error updating item:', error);
            throw error;
        }
    },

    delete: async (id: string): Promise<void> => {
        try {
            await IntakeItemsApi.delete(id);
        } catch (error) {
            console.error('[Inbox] Error deleting item:', error);
            throw error;
        }
    },

    getClients: async (): Promise<string[]> => {
        try {
            const clients = await ClientsApi.getAll();
            return clients.map(c => c.name);
        } catch (error) {
            console.error('[Inbox] Error fetching clients:', error);
            return [];
        }
    },
};
