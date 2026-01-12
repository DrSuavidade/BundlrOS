/**
 * Event Bus - Supabase Service
 * 
 * This provides the real Supabase-backed implementation for Event Bus.
 */

import {
    SystemEventsApi,
    AutomationRunsApi,
    type SystemEvent as SupabaseSystemEvent,
    type AutomationRun as SupabaseAutomationRun
} from '@bundlros/supabase';
import { SystemEvent, AutomationRun, Status } from '../types';

// Map Supabase status to local Status enum
const mapStatus = (status: string | null): Status => {
    switch (status) {
        case 'success':
        case 'completed':
            return Status.SUCCESS;
        case 'failed':
            return Status.FAILED;
        case 'waiting':
        case 'pending':
            return Status.WAITING;
        case 'running':
            return Status.RUNNING;
        case 'created':
        default:
            return Status.CREATED;
    }
};

// Map Supabase SystemEvent to local type
const mapSystemEvent = (event: SupabaseSystemEvent): SystemEvent => ({
    id: event.id,
    type: event.type,
    clientId: event.client_id || 'unknown',
    payload: event.payload as Record<string, unknown> || {},
    idempotencyKey: event.idempotency_key,
    createdAt: event.created_at,
    status: mapStatus(event.status || 'created'),
});

// Map Supabase AutomationRun to local type
const mapAutomationRun = (run: SupabaseAutomationRun): AutomationRun => ({
    id: run.id,
    eventId: run.event_id,
    workflowId: run.workflow_id,
    status: mapStatus(run.status),
    input: run.input as Record<string, unknown> || {},
    output: run.output as Record<string, unknown> | undefined,
    error: run.error as { message: string; code: string; stack?: string } | undefined,
    attemptCount: run.attempt_count,
    startedAt: run.started_at,
    completedAt: run.completed_at || undefined,
});

export const SupabaseService = {
    getEvents: async (): Promise<SystemEvent[]> => {
        try {
            const events = await SystemEventsApi.getAll(100);
            return events.map(mapSystemEvent);
        } catch (error) {
            console.error('[EventBus] Error fetching events:', error);
            return [];
        }
    },

    getRuns: async (): Promise<AutomationRun[]> => {
        try {
            const runs = await AutomationRunsApi.getAll();
            return runs.map(mapAutomationRun);
        } catch (error) {
            console.error('[EventBus] Error fetching runs:', error);
            return [];
        }
    },

    getEvent: async (id: string): Promise<SystemEvent | undefined> => {
        try {
            // SystemEventsApi doesn't have getById, so get all and filter
            const events = await SystemEventsApi.getAll(500);
            const event = events.find(e => e.id === id);
            return event ? mapSystemEvent(event) : undefined;
        } catch (error) {
            console.error('[EventBus] Error fetching event:', error);
            return undefined;
        }
    },

    getRunsByEvent: async (eventId: string): Promise<AutomationRun[]> => {
        try {
            const allRuns = await AutomationRunsApi.getAll();
            return allRuns.filter(r => r.event_id === eventId).map(mapAutomationRun);
        } catch (error) {
            console.error('[EventBus] Error fetching runs by event:', error);
            return [];
        }
    },

    getRun: async (id: string): Promise<AutomationRun | undefined> => {
        try {
            const run = await AutomationRunsApi.getById(id);
            return run ? mapAutomationRun(run) : undefined;
        } catch (error) {
            console.error('[EventBus] Error fetching run:', error);
            return undefined;
        }
    },

    // Create a new event (for testing or manual trigger)
    createEvent: async (type: string, clientId: string, payload: Record<string, unknown>): Promise<SystemEvent | null> => {
        try {
            const event = await SystemEventsApi.create({
                type,
                client_id: clientId,
                payload,
                status: 'created',
            });
            return mapSystemEvent(event);
        } catch (error) {
            console.error('[EventBus] Error creating event:', error);
            return null;
        }
    },
};
