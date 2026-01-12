/**
 * Capacity & SLA Radar - Supabase Service
 * 
 * Provides capacity and SLA metrics from Supabase data.
 * Aggregates data from clients, projects, and deliverables.
 */

import {
    ClientsApi,
    ProjectsApi,
    DeliverablesApi,
    type Client as SupabaseClient,
} from '@bundlros/supabase';
import { Client, IntakeItem, RiskLevel, DashboardMetrics } from '../types';

// In-memory intake items (would be from system events in real system)
let intakeItems: IntakeItem[] = [];

// Map Supabase client to local Client type with capacity metrics
const mapToClient = async (client: SupabaseClient): Promise<Client> => {
    try {
        // Get projects and deliverables for this client
        const projects = await ProjectsApi.getByClientId(client.id);
        const activeProjects = projects.filter(p => p.status === 'active').length;

        // Get deliverables for all projects
        let totalDeliverables = 0;
        let completedDeliverables = 0;

        for (const project of projects) {
            const deliverables = await DeliverablesApi.getByProjectId(project.id);
            totalDeliverables += deliverables.length;
            completedDeliverables += deliverables.filter(d =>
                ['published', 'approved'].includes(d.status)
            ).length;
        }

        // Calculate metrics
        const completionRate = totalDeliverables > 0
            ? (completedDeliverables / totalDeliverables) * 100
            : 100;

        // Simulate capacity based on active projects (more projects = higher capacity usage)
        const capacityUsage = Math.min(100, activeProjects * 15 + Math.random() * 20);

        // SLA based on completion rate
        const sla = Math.min(100, completionRate + Math.random() * 5);

        // Risk score based on capacity and SLA
        const riskScore = Math.max(0, Math.min(100,
            (capacityUsage > 80 ? 30 : 0) +
            (sla < 90 ? 40 : 0) +
            (activeProjects > 5 ? 20 : 0) +
            Math.random() * 10
        ));

        // Churn risk if high capacity and low SLA
        const churnRisk = capacityUsage > 85 && sla < 92;

        return {
            id: client.id,
            name: client.name,
            sla: Math.round(sla * 10) / 10,
            capacityUsage: Math.round(capacityUsage * 10) / 10,
            riskScore: Math.round(riskScore),
            churnRisk,
            activeProjects,
        };
    } catch (error) {
        console.error(`[Capacity] Error mapping client ${client.id}:`, error);
        return {
            id: client.id,
            name: client.name,
            sla: 95,
            capacityUsage: 50,
            riskScore: 10,
            churnRisk: false,
            activeProjects: 0,
        };
    }
};

// Generate intake item from capacity/SLA issues
const generateIntakeItem = (client: Client, type: 'capacity_warning' | 'sla_breach' | 'churn_alert'): IntakeItem => {
    const descriptions: Record<string, string> = {
        capacity_warning: `${client.name} capacity at ${client.capacityUsage.toFixed(0)}%`,
        sla_breach: `${client.name} SLA dropped to ${client.sla.toFixed(1)}%`,
        churn_alert: `${client.name} showing churn risk signals`,
    };

    const severity: Record<string, RiskLevel> = {
        capacity_warning: client.capacityUsage > 90 ? RiskLevel.CRITICAL : RiskLevel.HIGH,
        sla_breach: client.sla < 85 ? RiskLevel.CRITICAL : RiskLevel.HIGH,
        churn_alert: RiskLevel.CRITICAL,
    };

    return {
        id: `intake-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        description: descriptions[type],
        type,
        severity: severity[type],
        timestamp: Date.now(),
        status: 'new',
    };
};

export const SupabaseCapacityService = {
    getClients: async (): Promise<Client[]> => {
        try {
            const supabaseClients = await ClientsApi.getAll();
            const clients = await Promise.all(supabaseClients.map(mapToClient));

            // Generate intake items for high-risk clients
            intakeItems = [];
            for (const client of clients) {
                if (client.capacityUsage > 85) {
                    intakeItems.push(generateIntakeItem(client, 'capacity_warning'));
                }
                if (client.sla < 92) {
                    intakeItems.push(generateIntakeItem(client, 'sla_breach'));
                }
                if (client.churnRisk) {
                    intakeItems.push(generateIntakeItem(client, 'churn_alert'));
                }
            }

            return clients;
        } catch (error) {
            console.error('[Capacity] Error fetching clients:', error);
            return [];
        }
    },

    getIntakeItems: (): IntakeItem[] => {
        return intakeItems;
    },

    resolveIntakeItem: (id: string): void => {
        intakeItems = intakeItems.filter(item => item.id !== id);
    },

    getMetrics: async (): Promise<DashboardMetrics> => {
        const clients = await SupabaseCapacityService.getClients();

        if (clients.length === 0) {
            return {
                totalCapacity: 0,
                avgSla: 100,
                clientsAtRisk: 0,
                activeAlerts: 0,
            };
        }

        return {
            totalCapacity: clients.reduce((sum, c) => sum + c.capacityUsage, 0) / clients.length,
            avgSla: clients.reduce((sum, c) => sum + c.sla, 0) / clients.length,
            clientsAtRisk: clients.filter(c => c.riskScore > 60).length,
            activeAlerts: intakeItems.filter(i => i.status === 'new').length,
        };
    },
};
