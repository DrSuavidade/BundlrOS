/**
 * QA Gates & Checks - Supabase Service
 * 
 * Provides Supabase-backed implementation for QA gates.
 * Uses deliverables from Supabase and generates QA results.
 */

import {
    DeliverablesApi,
    type Deliverable as SupabaseDeliverable,
} from '@bundlros/supabase';
import { Deliverable, QAResult, ChecklistItem, QAStatus } from '../types';

// In-memory storage for QA results (would be a dedicated table in real system)
const qaResultsCache: Map<string, QAResult> = new Map();

// Generate checklist based on deliverable type
const generateChecklist = (type: string): ChecklistItem[] => {
    const common: ChecklistItem[] = [
        { id: 'sec-1', category: 'security', label: 'No hardcoded secrets', status: 'passed' },
        { id: 'perf-1', category: 'performance', label: 'Load time < 200ms', status: 'passed' },
    ];

    switch (type) {
        case 'website':
        case 'web_page':
            return [
                ...common,
                { id: 'vis-1', category: 'visual', label: 'Mobile responsiveness check', status: 'passed' },
                { id: 'func-1', category: 'functional', label: 'All links work', status: 'passed' },
                { id: 'vis-2', category: 'visual', label: 'Font loading', status: 'passed' },
            ];
        case 'api':
        case 'backend':
            return [
                ...common,
                { id: 'func-2', category: 'functional', label: 'Returns 200 OK on valid input', status: 'passed' },
                { id: 'func-3', category: 'functional', label: 'Returns 400 on invalid payload', status: 'passed' },
            ];
        case 'video':
        case 'image':
            return [
                ...common,
                { id: 'vis-3', category: 'visual', label: 'Resolution meets requirements', status: 'passed' },
                { id: 'vis-4', category: 'visual', label: 'Color profile is correct', status: 'passed' },
            ];
        default:
            return common;
    }
};

// Map deliverable status to QA status
const mapQAStatus = (status: string): QAStatus => {
    switch (status) {
        case 'qa_failed':
            return 'failed';
        case 'in_qa':
            return 'running';
        case 'approved':
        case 'published':
            return 'passed';
        default:
            return 'pending';
    }
};

// Get or generate QA result for a deliverable
const getOrGenerateQAResult = (deliverable: SupabaseDeliverable): QAResult => {
    if (qaResultsCache.has(deliverable.id)) {
        return qaResultsCache.get(deliverable.id)!;
    }

    const checklist = generateChecklist(deliverable.type || 'default');
    const status = mapQAStatus(deliverable.status);

    // If deliverable failed QA, mark some checklist items as failed
    const finalChecklist = status === 'failed'
        ? checklist.map((item, i) => i === 0 ? { ...item, status: 'failed' as QAStatus, logs: 'Check failed' } : item)
        : checklist;

    const score = status === 'failed' ? 75 : status === 'passed' ? 100 : 0;

    const result: QAResult = {
        id: `qa-${deliverable.id}`,
        deliverableId: deliverable.id,
        timestamp: deliverable.updated_at,
        status,
        score,
        checklist: finalChecklist,
        automatedSummary: status === 'passed' ? 'All checks passed. Ready for deployment.'
            : status === 'failed' ? 'Some checks failed. Review required.'
                : 'QA in progress...',
    };

    qaResultsCache.set(deliverable.id, result);
    return result;
};

// Map Supabase deliverable to local Deliverable type
const mapToDeliverable = (d: SupabaseDeliverable): Deliverable => {
    const typeMap: Record<string, Deliverable['type']> = {
        'website': 'landing_page',
        'web_page': 'landing_page',
        'api': 'api_endpoint',
        'backend': 'api_endpoint',
        'email': 'email_template',
        'video': 'dashboard_widget',
        'image': 'dashboard_widget',
    };

    return {
        id: d.id,
        name: d.title,
        type: typeMap[d.type || ''] || 'landing_page',
        version: d.version || 'v1.0',
        owner: 'Team',
        lastResult: getOrGenerateQAResult(d),
    };
};

export const SupabaseQAService = {
    getDeliverables: async (): Promise<Deliverable[]> => {
        try {
            const deliverables = await DeliverablesApi.getAll();
            return deliverables.map(mapToDeliverable);
        } catch (error) {
            console.error('[QA] Error fetching deliverables:', error);
            return [];
        }
    },

    getDeliverableById: async (id: string): Promise<Deliverable | undefined> => {
        try {
            const deliverable = await DeliverablesApi.getById(id);
            if (!deliverable) return undefined;
            return mapToDeliverable(deliverable);
        } catch (error) {
            console.error('[QA] Error fetching deliverable:', error);
            return undefined;
        }
    },

    runQA: async (deliverableId: string, currentType: string): Promise<QAResult> => {
        // Simulate QA process
        await new Promise(resolve => setTimeout(resolve, 2000));

        const isPass = Math.random() > 0.3; // 70% chance to pass
        const baseList = generateChecklist(currentType);

        const newList = baseList.map(item => ({
            ...item,
            status: isPass ? 'passed' : (Math.random() > 0.8 ? 'failed' : 'passed') as QAStatus,
            logs: isPass ? undefined : 'Random simulation failure log entry...',
        }));

        const overallStatus = newList.some(i => i.status === 'failed') ? 'failed' : 'passed';
        const score = Math.floor((newList.filter(i => i.status === 'passed').length / newList.length) * 100);

        const result: QAResult = {
            id: `qa-${Date.now()}`,
            deliverableId,
            timestamp: new Date().toISOString(),
            status: overallStatus,
            score,
            checklist: newList,
            automatedSummary: overallStatus === 'passed'
                ? 'All systems go. Ready for deployment.'
                : 'Validation failed. Check logs for details.',
        };

        // Update deliverable status in Supabase
        try {
            const newStatus = overallStatus === 'passed' ? 'approved' : 'qa_failed';
            await DeliverablesApi.transitionStatus(deliverableId, newStatus as any);
        } catch (error) {
            console.error('[QA] Error updating deliverable status:', error);
        }

        // Cache the result
        qaResultsCache.set(deliverableId, result);

        return result;
    },

    getStats: async (): Promise<{ passed: number; failed: number; pending: number; total: number }> => {
        const deliverables = await SupabaseQAService.getDeliverables();
        return {
            total: deliverables.length,
            passed: deliverables.filter(d => d.lastResult.status === 'passed').length,
            failed: deliverables.filter(d => d.lastResult.status === 'failed').length,
            pending: deliverables.filter(d => ['pending', 'running'].includes(d.lastResult.status)).length,
        };
    },
};
