/**
 * QA Gates & Checks - Service Index
 */

import { SupabaseQAService } from './supabaseService';
import type { Deliverable, QAResult } from '../types';

// Unified service interface
export interface IQAService {
    getDeliverables: () => Promise<Deliverable[]>;
    getDeliverableById: (id: string) => Promise<Deliverable | undefined>;
    runQA: (deliverableId: string, currentType: string) => Promise<QAResult>;
    getStats: () => Promise<{ passed: number; failed: number; pending: number; total: number }>;
    saveChecklistState: (deliverableId: string, state: Record<string, boolean>) => Promise<void>;
}

// Export the Supabase service directly
export const QAService: IQAService = SupabaseQAService;

export { SupabaseQAService };
