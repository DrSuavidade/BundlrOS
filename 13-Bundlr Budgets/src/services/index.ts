/**
 * Bundlr Budgets - Service Index
 * 
 * Environment-aware service that switches between mock and Supabase backends.
 * Set VITE_USE_MOCK_BACKEND=true to use mock data.
 */

import { SupabaseBudgetService } from './supabaseService';
import type { Budget, SelectedService } from '../types';

// Check if we should use mock backend
const useMockBackend = import.meta.env.VITE_USE_MOCK_BACKEND === 'true';

// In-memory storage for mock service
let mockBudgets: Budget[] = [];

// Mock service
const MockBudgetService = {
    getAll: async (): Promise<Budget[]> => {
        return mockBudgets;
    },

    getById: async (id: string): Promise<Budget | null> => {
        return mockBudgets.find(b => b.id === id) || null;
    },

    getByClientId: async (clientId: string): Promise<Budget[]> => {
        return mockBudgets.filter(b => b.clientId === clientId);
    },

    create: async (budget: Budget): Promise<Budget> => {
        const newBudget = { ...budget, id: budget.id || `b-${Date.now()}` };
        mockBudgets.push(newBudget);
        return newBudget;
    },

    update: async (id: string, updates: Partial<Budget>): Promise<Budget> => {
        const index = mockBudgets.findIndex(b => b.id === id);
        if (index === -1) throw new Error('Budget not found');
        mockBudgets[index] = { ...mockBudgets[index], ...updates };
        return mockBudgets[index];
    },

    delete: async (id: string): Promise<void> => {
        mockBudgets = mockBudgets.filter(b => b.id !== id);
    },

    getClients: async (): Promise<Array<{ id: string; name: string }>> => {
        return [
            { id: 'c1', name: 'Acme Corp' },
            { id: 'c2', name: 'Globex Inc' },
        ];
    },
};

// Unified service interface
interface IBudgetService {
    getAll: () => Promise<Budget[]>;
    getById: (id: string) => Promise<Budget | null>;
    getByClientId: (clientId: string) => Promise<Budget[]>;
    create: (budget: Budget) => Promise<Budget>;
    update: (id: string, updates: Partial<Budget>) => Promise<Budget>;
    delete: (id: string) => Promise<void>;
    getClients: () => Promise<Array<{ id: string; name: string }>>;
}

// Export the appropriate service based on environment
export const BudgetService: IBudgetService = useMockBackend
    ? MockBudgetService
    : SupabaseBudgetService;

// Also export for direct access if needed
export { MockBudgetService, SupabaseBudgetService };

console.log(`[Budgets] Using ${useMockBackend ? 'MOCK' : 'SUPABASE'} backend`);
