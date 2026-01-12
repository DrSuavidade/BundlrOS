/**
 * Event Bus - Service Index
 * 
 * Environment-aware service that switches between mock and Supabase backends.
 * Set VITE_USE_MOCK_BACKEND=true to use mock data.
 */

import { MockService } from './mockData';
import { SupabaseService } from './supabaseService';
import type { SystemEvent, AutomationRun } from '../types';

// Check if we should use mock backend
const useMockBackend = import.meta.env.VITE_USE_MOCK_BACKEND === 'true';

// Unified service interface
interface IEventBusService {
    getEvents: () => Promise<SystemEvent[]>;
    getRuns: () => Promise<AutomationRun[]>;
    getEvent: (id: string) => Promise<SystemEvent | undefined>;
    getRunsByEvent: (eventId: string) => Promise<AutomationRun[]>;
    getRun: (id: string) => Promise<AutomationRun | undefined>;
}

// Export the appropriate service based on environment
export const EventBusService: IEventBusService = useMockBackend
    ? MockService
    : SupabaseService;

// Also export for direct access if needed
export { MockService, SupabaseService };

console.log(`[EventBus] Using ${useMockBackend ? 'MOCK' : 'SUPABASE'} backend`);
