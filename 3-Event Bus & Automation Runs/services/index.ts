/**
 * Event Bus - Service Index
 */

import { SupabaseService } from './supabaseService';
import type { SystemEvent, AutomationRun } from '../types';

// Unified service interface
export interface IEventBusService {
    getEvents: () => Promise<SystemEvent[]>;
    getRuns: () => Promise<AutomationRun[]>;
    getEvent: (id: string) => Promise<SystemEvent | undefined>;
    getRunsByEvent: (eventId: string) => Promise<AutomationRun[]>;
    getRun: (id: string) => Promise<AutomationRun | undefined>;
}

export const EventBusService: IEventBusService = SupabaseService;

export { SupabaseService };
