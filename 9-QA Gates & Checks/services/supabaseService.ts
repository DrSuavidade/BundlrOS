/**
 * QA Gates & Checks - Supabase Service
 * 
 * Provides Supabase-backed implementation for QA gates.
 * Uses deliverables from Supabase and generates QA results from Automation Runs.
 */

import {
    DeliverablesApi,
    AutomationRunsApi,
    type Deliverable as SupabaseDeliverable,
    type AutomationRun
} from '@bundlros/supabase';
import { Deliverable, QAResult, QAStatus } from '../types';

const WORKFLOW_ID = 'n8n:gatekeeper_active';

// Generate a default "Pending" result
const createPendingResult = (deliverableId: string, timestamp: string): QAResult => ({
    id: `pending-${deliverableId}`,
    deliverableId,
    timestamp,
    status: 'pending',
    score: 0,
    checklist: [],
    automatedSummary: 'No QA run recorded.'
});

// Map Automation Run output to QAResult
const mapRunToResult = (run: AutomationRun, deliverableId: string): QAResult => {
    // If run is running, return running status
    if (run.status === 'running') {
        return {
            id: run.id,
            deliverableId,
            timestamp: run.started_at || new Date().toISOString(),
            status: 'running',
            score: 0,
            checklist: [],
            automatedSummary: 'QA Check in progress...'
        };
    }

    // Try to parse output
    const output = run.output as any;
    if (output && output.qaResult) {
        return {
            ...output.qaResult,
            id: run.id, // Ensure ID matches run ID
            status: run.status === 'failed' ? 'failed' : (output.qaResult.status || 'passed')
        };
    }

    // Fallback if output structure doesn't match
    return {
        id: run.id,
        deliverableId,
        timestamp: run.completed_at || run.started_at || new Date().toISOString(),
        status: run.status === 'failed' ? 'failed' : 'passed', // Crude fallback
        score: 0,
        checklist: [],
        automatedSummary: run.error ? `Error: ${JSON.stringify(run.error)}` : 'QA Completed (No detailed data)'
    };
};

// Map Supabase deliverable to local Deliverable type
const mapToDeliverable = (d: SupabaseDeliverable, latestRun?: AutomationRun): Deliverable => {
    const typeMap: Record<string, Deliverable['type']> = {
        'website': 'landing_page',
        'web_page': 'landing_page',
        'api': 'api_endpoint',
        'backend': 'api_endpoint',
        'email': 'email_template',
        'video': 'dashboard_widget',
        'image': 'dashboard_widget',
    };

    const result = latestRun
        ? mapRunToResult(latestRun, d.id)
        : createPendingResult(d.id, d.updated_at || new Date().toISOString());

    return {
        id: d.id,
        name: d.title,
        type: typeMap[d.type || ''] || 'landing_page',
        version: d.version || 'v1.0',
        owner: 'Team', // This could come from a join with profiles/owners if available
        lastResult: result,
    };
};

export const SupabaseQAService = {
    getDeliverables: async (): Promise<Deliverable[]> => {
        try {
            const [deliverables, runs] = await Promise.all([
                DeliverablesApi.getAll(),
                AutomationRunsApi.getByWorkflowId(WORKFLOW_ID)
            ]);

            // Map runs by deliverable_id (from input)
            // Assuming input is { deliverable_id: "..." }
            const runsByDeliverable = new Map<string, AutomationRun>();

            // Iterate in reverse (since sorted by started_at desc, we want the first one found?)
            // Actually getByWorkflowId orders by started_at DESC. So the first one we find for a ID is the latest.
            for (const run of runs) {
                const input = run.input as any;
                if (input && input.deliverable_id && !runsByDeliverable.has(input.deliverable_id)) {
                    runsByDeliverable.set(input.deliverable_id, run);
                }
            }

            return deliverables.map(d => mapToDeliverable(d, runsByDeliverable.get(d.id)));
        } catch (error) {
            console.error('[QA] Error fetching deliverables:', error);
            return [];
        }
    },

    getDeliverableById: async (id: string): Promise<Deliverable | undefined> => {
        try {
            const deliverable = await DeliverablesApi.getById(id);
            if (!deliverable) return undefined;

            // Fetch latest run for this ID
            // Ideally we'd filter by input->>deliverable_id but we don't have that API yet.
            // Fetching all might be heavy but for now it's consistent with getDeliverables.
            // ASK: Should we implement a specific fetch?
            // For now, let's reuse the logic by fetching all runs for the workflow.
            // Note: This matches the getDeliverables strategy.

            const runs = await AutomationRunsApi.getByWorkflowId(WORKFLOW_ID);
            const latestRun = runs.find(r => (r.input as any)?.deliverable_id === id);

            return mapToDeliverable(deliverable, latestRun);
        } catch (error) {
            console.error('[QA] Error fetching deliverable:', error);
            return undefined;
        }
    },

    runQA: async (deliverableId: string, currentType: string): Promise<QAResult> => {
        try {
            // Create a new Automation Run
            const run = await AutomationRunsApi.create({
                workflow_id: WORKFLOW_ID,
                status: 'running',
                input: {
                    deliverable_id: deliverableId,
                    type: currentType,
                    triggered_by: 'qa_ui'
                },
                attempt_count: 1,
                event_id: null,
                output: null,
                error: null,
                completed_at: null
            });

            // Update local status representation via return
            return {
                id: run.id,
                deliverableId,
                timestamp: run.started_at || new Date().toISOString(),
                status: 'running',
                score: 0,
                checklist: [],
                automatedSummary: 'QA Check started...'
            };
        } catch (error) {
            console.error('[QA] Error starting run:', error);
            throw error;
        }
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
