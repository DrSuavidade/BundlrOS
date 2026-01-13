/**
 * Capacity & SLA Radar - Service Index
 */

import { SupabaseCapacityService } from './supabaseService';
import type { Client, IntakeItem, DashboardMetrics } from '../types';

// Unified service interface
interface ICapacityService {
    getClients: () => Promise<Client[]>;
    getIntakeItems: () => IntakeItem[];
    resolveIntakeItem: (id: string) => void;
    getMetrics: () => Promise<DashboardMetrics>;
    analyzeRisks: (clients: Client[], intakeItems: IntakeItem[]) => Promise<string>;
}

// Export the appropriate service based on environment
export const CapacityService: ICapacityService = SupabaseCapacityService;

// Also export for direct access if needed
export { SupabaseCapacityService };
