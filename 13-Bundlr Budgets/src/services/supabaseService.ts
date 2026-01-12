/**
 * Bundlr Budgets - Supabase Service
 * 
 * Provides Supabase-backed implementation for saving/loading budgets.
 * The proposal builder UI remains stateless, but budgets can be persisted.
 */

import {
    BudgetsApi,
    ClientsApi,
    type Budget as SupabaseBudget,
    type Client as SupabaseClient,
} from '@bundlros/supabase';
import { Budget, SelectedService } from '../types';

// Map local Budget to Supabase format
const mapToSupabaseBudget = (budget: Budget): Omit<SupabaseBudget, 'id' | 'created_at' | 'updated_at'> => ({
    client_id: budget.clientId || '',
    contract_id: budget.contractId || null,
    project_name: budget.projectName || null,
    items: budget.items as unknown as Record<string, unknown>,
    notes: budget.notes || null,
});

// Map Supabase Budget to local format
const mapFromSupabaseBudget = (budget: SupabaseBudget, clientName?: string): Budget => ({
    id: budget.id,
    clientId: budget.client_id,
    contractId: budget.contract_id || '',
    clientName: clientName || 'Unknown Client',
    projectName: budget.project_name || '',
    notes: budget.notes || '',
    items: (budget.items as unknown as SelectedService[]) || [],
});

export const SupabaseBudgetService = {
    // Get all saved budgets
    getAll: async (): Promise<Budget[]> => {
        try {
            const supabaseBudgets = await BudgetsApi.getAll();
            const clients = await ClientsApi.getAll();
            const clientMap = new Map(clients.map(c => [c.id, c.name]));

            return supabaseBudgets.map(b =>
                mapFromSupabaseBudget(b, clientMap.get(b.client_id))
            );
        } catch (error) {
            console.error('[Budgets] Error fetching budgets:', error);
            return [];
        }
    },

    // Get budget by ID
    getById: async (id: string): Promise<Budget | null> => {
        try {
            const budget = await BudgetsApi.getById(id);
            if (!budget) return null;

            const client = await ClientsApi.getById(budget.client_id);
            return mapFromSupabaseBudget(budget, client?.name);
        } catch (error) {
            console.error('[Budgets] Error fetching budget:', error);
            return null;
        }
    },

    // Get budgets by client
    getByClientId: async (clientId: string): Promise<Budget[]> => {
        try {
            const budgets = await BudgetsApi.getByClientId(clientId);
            const client = await ClientsApi.getById(clientId);

            return budgets.map(b => mapFromSupabaseBudget(b, client?.name));
        } catch (error) {
            console.error('[Budgets] Error fetching budgets by client:', error);
            return [];
        }
    },

    // Save a new budget
    create: async (budget: Budget): Promise<Budget> => {
        try {
            const supabaseData = mapToSupabaseBudget(budget);
            const created = await BudgetsApi.create(supabaseData);
            return mapFromSupabaseBudget(created, budget.clientName);
        } catch (error) {
            console.error('[Budgets] Error creating budget:', error);
            throw error;
        }
    },

    // Update existing budget
    update: async (id: string, budget: Partial<Budget>): Promise<Budget> => {
        try {
            const updateData: Record<string, unknown> = {};
            if (budget.clientId) updateData.client_id = budget.clientId;
            if (budget.contractId) updateData.contract_id = budget.contractId;
            if (budget.projectName !== undefined) updateData.project_name = budget.projectName;
            if (budget.notes !== undefined) updateData.notes = budget.notes;
            if (budget.items) updateData.items = budget.items;

            const updated = await BudgetsApi.update(id, updateData as any);
            return mapFromSupabaseBudget(updated, budget.clientName);
        } catch (error) {
            console.error('[Budgets] Error updating budget:', error);
            throw error;
        }
    },

    // Delete a budget
    delete: async (id: string): Promise<void> => {
        try {
            await BudgetsApi.delete(id);
        } catch (error) {
            console.error('[Budgets] Error deleting budget:', error);
            throw error;
        }
    },

    // Get all clients (for selection)
    getClients: async (): Promise<Array<{ id: string; name: string }>> => {
        try {
            const clients = await ClientsApi.getAll();
            return clients.map(c => ({ id: c.id, name: c.name }));
        } catch (error) {
            console.error('[Budgets] Error fetching clients:', error);
            return [];
        }
    },
};
