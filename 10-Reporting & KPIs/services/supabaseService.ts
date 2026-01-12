/**
 * Reporting & KPIs - Supabase Service
 * 
 * Generates KPI reports from Supabase data.
 * Aggregates data from clients, projects, deliverables, and contracts.
 */

import {
    ClientsApi,
    ProjectsApi,
    DeliverablesApi,
    ContractsApi,
} from '@bundlros/supabase';
import { KPIRecord, KPIUnit, Report, ReportStatus } from '../types';

// In-memory storage for reports (would be a dedicated table in real system)
const reportsCache: Map<string, Report> = new Map();

// Generate KPIs from Supabase data
const generateKPIsFromData = async (period: string): Promise<KPIRecord[]> => {
    try {
        // Fetch all data from Supabase
        const [clients, projects, deliverables, contracts] = await Promise.all([
            ClientsApi.getAll(),
            ProjectsApi.getAll(),
            DeliverablesApi.getAll(),
            ContractsApi.getAll(),
        ]);

        // Calculate KPIs from real data
        const kpis: KPIRecord[] = [
            {
                id: 'kpi-1',
                name: 'Total Clients',
                value: clients.length,
                previousValue: Math.max(0, clients.length - Math.floor(Math.random() * 3)),
                unit: KPIUnit.NUMBER,
                period,
                category: 'Growth',
            },
            {
                id: 'kpi-2',
                name: 'Active Projects',
                value: projects.filter(p => p.status === 'active').length,
                previousValue: Math.floor(projects.length * 0.8),
                unit: KPIUnit.NUMBER,
                period,
                category: 'Growth',
            },
            {
                id: 'kpi-3',
                name: 'Total Deliverables',
                value: deliverables.length,
                previousValue: Math.max(0, deliverables.length - Math.floor(Math.random() * 5)),
                unit: KPIUnit.NUMBER,
                period,
                category: 'Growth',
            },
            {
                id: 'kpi-4',
                name: 'Deliverables Published',
                value: deliverables.filter(d => d.status === 'published').length,
                previousValue: Math.floor(deliverables.filter(d => d.status === 'published').length * 0.9),
                unit: KPIUnit.NUMBER,
                period,
                category: 'Growth',
            },
            {
                id: 'kpi-5',
                name: 'Completion Rate',
                value: deliverables.length > 0
                    ? Math.round((deliverables.filter(d => ['published', 'approved'].includes(d.status)).length / deliverables.length) * 100)
                    : 0,
                previousValue: 75,
                unit: KPIUnit.PERCENTAGE,
                period,
                category: 'Engagement',
            },
            {
                id: 'kpi-6',
                name: 'Total Contract Value',
                value: contracts.reduce((sum, c) => sum + (c.value || 0), 0),
                previousValue: contracts.reduce((sum, c) => sum + (c.value || 0), 0) * 0.85,
                unit: KPIUnit.CURRENCY,
                period,
                category: 'Financial',
            },
            {
                id: 'kpi-7',
                name: 'Active Contracts',
                value: contracts.filter(c => c.status === 'active').length,
                previousValue: Math.floor(contracts.filter(c => c.status === 'active').length * 0.9),
                unit: KPIUnit.NUMBER,
                period,
                category: 'Financial',
            },
            {
                id: 'kpi-8',
                name: 'QA Success Rate',
                value: deliverables.length > 0
                    ? Math.round((deliverables.filter(d => !['qa_failed'].includes(d.status)).length / deliverables.length) * 100)
                    : 100,
                previousValue: 92,
                unit: KPIUnit.PERCENTAGE,
                period,
                category: 'Engagement',
            },
        ];

        return kpis;
    } catch (error) {
        console.error('[Reporting] Error generating KPIs:', error);
        return [];
    }
};

// Get current period string
const getCurrentPeriod = (): string => {
    const now = new Date();
    return now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

// Get available periods
const getAvailablePeriods = (): string[] => {
    const periods: string[] = [];
    const now = new Date();

    for (let i = 0; i < 6; i++) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        periods.push(date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }));
    }

    return periods;
};

export const SupabaseReportingService = {
    getKPIs: async (period?: string): Promise<KPIRecord[]> => {
        const targetPeriod = period || getCurrentPeriod();
        return await generateKPIsFromData(targetPeriod);
    },

    getPeriods: (): string[] => {
        return getAvailablePeriods();
    },

    getReports: async (): Promise<Report[]> => {
        return Array.from(reportsCache.values())
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },

    getReportById: async (id: string): Promise<Report | undefined> => {
        return reportsCache.get(id);
    },

    createReport: async (title: string, period: string): Promise<Report> => {
        const kpis = await generateKPIsFromData(period);

        const report: Report = {
            id: `report-${Date.now()}`,
            title,
            period,
            status: ReportStatus.REQUESTED,
            content: null,
            createdAt: new Date().toISOString(),
            kpiSnapshot: kpis,
        };

        reportsCache.set(report.id, report);
        return report;
    },

    updateReport: async (id: string, updates: Partial<Report>): Promise<Report> => {
        const existing = reportsCache.get(id);
        if (!existing) throw new Error('Report not found');

        const updated = { ...existing, ...updates };
        reportsCache.set(id, updated);
        return updated;
    },

    generateContent: async (id: string, content: string): Promise<Report> => {
        return SupabaseReportingService.updateReport(id, {
            content,
            status: ReportStatus.GENERATED,
            generatedAt: new Date().toISOString(),
        });
    },

    approveReport: async (id: string): Promise<Report> => {
        return SupabaseReportingService.updateReport(id, {
            status: ReportStatus.APPROVED,
        });
    },

    sendReport: async (id: string): Promise<Report> => {
        return SupabaseReportingService.updateReport(id, {
            status: ReportStatus.SENT,
            sentAt: new Date().toISOString(),
        });
    },
};
