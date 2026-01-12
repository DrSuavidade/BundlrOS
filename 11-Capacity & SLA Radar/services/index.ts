/**
 * Capacity & SLA Radar - Service Index
 * 
 * Environment-aware service that switches between mock and Supabase backends.
 * Set VITE_USE_MOCK_BACKEND=true to use mock data.
 */

import { MOCK_CLIENTS, MOCK_INTAKE } from '../constants';
import { SupabaseCapacityService } from './supabaseService';
import type { Client, IntakeItem, DashboardMetrics } from '../types';

// Check if we should use mock backend
const useMockBackend = import.meta.env.VITE_USE_MOCK_BACKEND === 'true';

// In-memory intake for mock
let mockIntakeItems = [...MOCK_INTAKE];

// Mock service wrapper
const MockCapacityService = {
    getClients: async (): Promise<Client[]> => {
        return [...MOCK_CLIENTS];
    },

    getIntakeItems: (): IntakeItem[] => {
        return mockIntakeItems;
    },

    resolveIntakeItem: (id: string): void => {
        mockIntakeItems = mockIntakeItems.filter(item => item.id !== id);
    },

    getMetrics: async (): Promise<DashboardMetrics> => {
        const clients = MOCK_CLIENTS;
        return {
            totalCapacity: clients.reduce((sum, c) => sum + c.capacityUsage, 0) / clients.length,
            avgSla: clients.reduce((sum, c) => sum + c.sla, 0) / clients.length,
            clientsAtRisk: clients.filter(c => c.riskScore > 60).length,
            activeAlerts: mockIntakeItems.filter(i => i.status === 'new').length,
        };
    },
};

// Unified service interface
interface ICapacityService {
    getClients: () => Promise<Client[]>;
    getIntakeItems: () => IntakeItem[];
    resolveIntakeItem: (id: string) => void;
    getMetrics: () => Promise<DashboardMetrics>;
}

// Export the appropriate service based on environment
export const CapacityService: ICapacityService = useMockBackend
    ? MockCapacityService
    : SupabaseCapacityService;

// Also export for direct access if needed
export { MockCapacityService, SupabaseCapacityService };

console.log(`[Capacity] Using ${useMockBackend ? 'MOCK' : 'SUPABASE'} backend`);
