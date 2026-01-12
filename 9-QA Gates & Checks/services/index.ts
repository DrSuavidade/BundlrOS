/**
 * QA Gates & Checks - Service Index
 * 
 * Environment-aware service that switches between mock and Supabase backends.
 * Set VITE_USE_MOCK_BACKEND=true to use mock data.
 */

import { initialDeliverables, runMockQA } from './mockData';
import { SupabaseQAService } from './supabaseService';
import type { Deliverable, QAResult } from '../types';

// Check if we should use mock backend
const useMockBackend = import.meta.env.VITE_USE_MOCK_BACKEND === 'true';

// Mock service wrapper to match interface
const MockQAService = {
    getDeliverables: async (): Promise<Deliverable[]> => {
        return [...initialDeliverables];
    },

    getDeliverableById: async (id: string): Promise<Deliverable | undefined> => {
        return initialDeliverables.find(d => d.id === id);
    },

    runQA: runMockQA,

    getStats: async () => {
        return {
            total: initialDeliverables.length,
            passed: initialDeliverables.filter(d => d.lastResult.status === 'passed').length,
            failed: initialDeliverables.filter(d => d.lastResult.status === 'failed').length,
            pending: initialDeliverables.filter(d => ['pending', 'running'].includes(d.lastResult.status)).length,
        };
    },
};

// Unified service interface
interface IQAService {
    getDeliverables: () => Promise<Deliverable[]>;
    getDeliverableById: (id: string) => Promise<Deliverable | undefined>;
    runQA: (deliverableId: string, currentType: string) => Promise<QAResult>;
    getStats: () => Promise<{ passed: number; failed: number; pending: number; total: number }>;
}

// Export the appropriate service based on environment
export const QAService: IQAService = useMockBackend
    ? MockQAService
    : SupabaseQAService;

// Also export for direct access if needed
export { MockQAService, SupabaseQAService };

console.log(`[QA] Using ${useMockBackend ? 'MOCK' : 'SUPABASE'} backend`);
