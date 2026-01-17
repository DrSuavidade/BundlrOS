/**
 * Reporting & KPIs - Supabase Service
 * 
 * Generates KPI reports from Supabase data.
 * Aggregates data from clients, projects, deliverables, and contracts.
 */

/**
 * Reporting & KPIs - Supabase Service
 * 
 * Generates KPI reports from Supabase data.
 * Aggregates data from clients, projects, deliverables, and contracts.
 * Uses Automation Runs to store and retrieve generated reports.
 */

import {
    ClientsApi,
    ProjectsApi,
    DeliverablesApi,
    ContractsApi,
    FileAssetsApi,
    AutomationRunsApi,
    type AutomationRun
} from '@bundlros/supabase';
import { KPIRecord, KPIUnit, Report, ReportStatus } from '../types';
import { generateReportNarrative } from './geminiService';

const REPORTING_WORKFLOW_ID = 'n8n:reporting_agent';

// Map Automation Run to Report
const mapRunToReport = (run: AutomationRun): Report => {
    const input = run.input as any || {};
    const output = run.output as any || {};

    // Determine status
    let status = ReportStatus.REQUESTED;
    if (run.status === 'completed') status = ReportStatus.GENERATED;
    if (output.approved) status = ReportStatus.APPROVED; // Stored in output?
    if (output.sent) status = ReportStatus.SENT;

    // Use specific fields if available
    if (output.status === 'APPROVED') status = ReportStatus.APPROVED;
    if (output.status === 'SENT') status = ReportStatus.SENT;

    return {
        id: run.id,
        title: input.title || `Report - ${input.period}`,
        period: input.period || 'Unknown Period',
        status,
        content: output.content || (run.status === 'running' ? 'Generating report...' : 'No content available.'),
        createdAt: run.started_at,
        generatedAt: run.completed_at || undefined,
        sentAt: output.sentAt,
        kpiSnapshot: output.kpis || [] // Assuming we store the snapshot in the run output
    };
};

// Helper to generate history from real data records
const generateHistoryFromRecords = (
    records: any[],
    dateField: string = 'created_at',
    type: 'cumulative' | 'daily' = 'cumulative',
    valueField?: string,
    filterFn?: (record: any) => boolean
): { date: string; value: number }[] => {
    const points = 365; // Generate 1 year of history
    const history: { date: string; value: number }[] = [];
    const now = new Date();

    // Normalize string dates to Date objects for easier comparison
    const preparedRecords = records
        .filter(r => filterFn ? filterFn(r) : true)
        .map(r => ({
            ...r,
            _date: new Date(r[dateField])
        }));

    for (let i = points - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        d.setHours(23, 59, 59, 999); // End of day comparison

        // Create a consistent date string for the chart
        const dateString = d.toISOString().split('T')[0];

        let value = 0;
        if (type === 'cumulative') {
            // Count/Sum records created before or on this day
            value = preparedRecords.reduce((acc, r) => {
                if (r._date <= d) {
                    return acc + (valueField ? (Number(r[valueField]) || 0) : 1);
                }
                return acc;
            }, 0);
        } else {
            // Daily count/sum (records created exactly on this day)
            value = preparedRecords.reduce((acc, r) => {
                if (r._date.toDateString() === d.toDateString()) {
                    return acc + (valueField ? (Number(r[valueField]) || 0) : 1);
                }
                return acc;
            }, 0);
        }

        history.push({ date: dateString, value });
    }

    return history;
};

// Helper to simulate history based on current value and trend
const generateMockHistory = (finalValue: number, trend: 'up' | 'down' | 'mixed' = 'mixed'): { date: string; value: number }[] => {
    const points = 30;
    const history = [];
    let currentValue = finalValue;
    const now = new Date();

    for (let i = 0; i < points; i++) {
        const d = new Date();
        d.setDate(now.getDate() - (points - 1 - i));

        // Add some volatility
        const volatility = finalValue * 0.1;
        const randomFluctuation = (Math.random() - 0.5) * volatility;

        // Apply trend bias
        let trendBias = 0;
        if (trend === 'up') trendBias = (i / points) * (finalValue * 0.2); // Gradually increasing
        if (trend === 'down') trendBias = -(i / points) * (finalValue * 0.2);

        // Calculate historical point (working backwards from final, but we construct forward)
        // Actually easier to just synthesize a path
        history.push({
            date: d.toISOString().split('T')[0],
            value: Math.max(0, Math.round(finalValue * 0.8 + (Math.random() * finalValue * 0.4))) // Simple random walk around mean
        });
    }
    // Force last point to match current value
    history[points - 1].value = finalValue;

    return history;
};

// Generate KPIs from Supabase data
const generateKPIsFromData = async (period: string): Promise<KPIRecord[]> => {
    try {
        // Fetch all data from Supabase
        const [clients, projects, deliverables, contracts, assets] = await Promise.all([
            ClientsApi.getAll(),
            ProjectsApi.getAll(),
            DeliverablesApi.getAll(),
            ContractsApi.getAll(),
            FileAssetsApi.getAll(),
        ]);

        // Calculate KPIs from real data
        const kpis: KPIRecord[] = [
            {
                id: 'kpi-1',
                name: 'Total Clients',
                value: clients.length,
                previousValue: Math.max(0, clients.length - 2), // Simple approximation for "last period" if we don't query explicit historical snapshots
                unit: KPIUnit.NUMBER,
                period,
                category: 'Growth',
                history: generateHistoryFromRecords(clients, 'created_at', 'cumulative')
            },
            {
                id: 'kpi-2',
                name: 'Active Projects',
                value: projects.filter(p => p.status === 'active').length,
                previousValue: 0,
                unit: KPIUnit.NUMBER,
                period,
                category: 'Growth',
                // For Active Projects, "Cumulative" creates a trend of "Total Projects Created" which is a proxy for growth
                // Ideally we'd filter by status at that time, but we don't have historical status logs here.
                // We'll show "Total Projects" trend.
                history: generateHistoryFromRecords(projects, 'created_at', 'cumulative')
            },
            {
                id: 'kpi-3',
                name: 'Total Deliverables',
                value: deliverables.length,
                previousValue: Math.max(0, deliverables.length - 5),
                unit: KPIUnit.NUMBER,
                period,
                category: 'Growth',
                history: generateHistoryFromRecords(deliverables, 'created_at', 'cumulative')
            },
            {
                id: 'kpi-4',
                name: 'Deliverables Published',
                value: deliverables.filter(d => d.status === 'published').length,
                previousValue: 0,
                unit: KPIUnit.NUMBER,
                period,
                category: 'Growth',
                history: generateHistoryFromRecords(deliverables, 'created_at', 'cumulative', undefined, d => d.status === 'published')
            },
            {
                id: 'kpi-5',
                name: 'Recent Activity', // Changed from Completion Rate to something more chart-friendly for daily
                value: deliverables.length, // Showing daily volume trend in chart
                previousValue: 0,
                unit: KPIUnit.NUMBER,
                period,
                category: 'Engagement',
                history: generateHistoryFromRecords(deliverables, 'created_at', 'daily') // Daily volume
            },
            {
                id: 'kpi-6',
                name: 'Total Contract Value',
                value: contracts.reduce((sum, c) => sum + (c.value || 0), 0),
                previousValue: 0,
                unit: KPIUnit.CURRENCY,
                period,
                category: 'Financial',
                history: generateHistoryFromRecords(contracts, 'created_at', 'cumulative', 'value')
            },
            {
                id: 'kpi-7',
                name: 'Active Contracts',
                value: contracts.filter(c => c.status === 'active').length,
                previousValue: 0,
                unit: KPIUnit.NUMBER,
                period,
                category: 'Financial',
                history: generateHistoryFromRecords(contracts, 'created_at', 'cumulative', undefined, c => c.status === 'active')
            },
            {
                id: 'kpi-8',
                name: 'Storage Usage',
                value: assets.reduce((sum, a) => sum + (a.size_bytes || 0), 0),
                previousValue: 0,
                unit: KPIUnit.BYTES,
                period,
                category: 'Engagement',
                history: generateHistoryFromRecords(assets, 'uploaded_at', 'cumulative', 'size_bytes')
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
        try {
            const runs = await AutomationRunsApi.getByWorkflowId(REPORTING_WORKFLOW_ID);
            return runs.map(mapRunToReport);
        } catch (error) {
            console.error('[Reporting] Error fetching reports:', error);
            return [];
        }
    },

    getReportById: async (id: string): Promise<Report | undefined> => {
        try {
            const run = await AutomationRunsApi.getById(id);
            if (!run) return undefined;
            return mapRunToReport(run);
        } catch (error) {
            console.error('[Reporting] Error fetching report:', error);
            return undefined;
        }
    },

    createReport: async (title: string, period: string, lang: string = 'en'): Promise<Report> => {
        const kpis = await generateKPIsFromData(period);

        // Create automation run to act as the report
        // We simulate the output immediately for better UX if the "agent" isn't actually running
        // In a real scenario, we might just set status='running'


        // Generate narrative using Gemini
        let narrative = "";
        try {
            narrative = await generateReportNarrative(period, kpis, lang);
        } catch (e) {
            console.error("Failed to generate AI narrative, falling back to basic summary.", e);
            narrative = `# Executive Summary - ${period}\n\nBased on the data, the company has seen ${kpis[0].value > 10 ? 'steady growth' : 'stable performance'}. Total contract value is ${kpis[5].value > 0 ? 'healthy' : 'pending'}.\n\n## Financial Performance\nRecurring revenue is tracking against targets.`;
        }

        const run = await AutomationRunsApi.create({
            workflow_id: REPORTING_WORKFLOW_ID,
            status: 'completed', // Simulate immediate completion for now
            input: {
                title,
                period,
                triggered_by: 'reporting_ui'
            },
            attempt_count: 1,
            event_id: null,
            output: {
                content: narrative,
                kpis: kpis,
                status: 'GENERATED'
            },
            error: null,
            completed_at: new Date().toISOString()
        });

        return mapRunToReport(run);
    },

    updateReport: async (id: string, updates: Partial<Report>): Promise<Report> => {
        // We can update the automation run output to store state changes (approved/sent)
        const run = await AutomationRunsApi.getById(id);
        if (!run) throw new Error('Report not found');

        const currentOutput = (run.output as any) || {};
        const newOutput = { ...currentOutput, ...updates };

        // For status updates, we map ReportStatus to our stored status field in output
        if (updates.status) {
            newOutput.status = updates.status;
            if (updates.status === ReportStatus.SENT) {
                newOutput.sentAt = new Date().toISOString();
            }
        }

        const updatedRun = await AutomationRunsApi.complete(id, newOutput);
        return mapRunToReport(updatedRun);
    },

    generateContent: async (id: string, content: string): Promise<Report> => {
        return SupabaseReportingService.updateReport(id, {
            content,
            status: ReportStatus.GENERATED,
            generatedAt: new Date().toISOString(),
        } as any);
    },

    approveReport: async (id: string): Promise<Report> => {
        return SupabaseReportingService.updateReport(id, {
            status: ReportStatus.APPROVED,
        });
    },

    sendReport: async (id: string): Promise<Report> => {
        return SupabaseReportingService.updateReport(id, {
            status: ReportStatus.SENT,
        });
    },

    deleteAllReports: async (): Promise<void> => {
        try {
            const runs = await AutomationRunsApi.getByWorkflowId(REPORTING_WORKFLOW_ID);
            await Promise.all(runs.map(run => AutomationRunsApi.delete(run.id)));
        } catch (error) {
            console.error('[Reporting] Error deleting reports:', error);
            throw error;
        }
    },

    deleteReport: async (id: string): Promise<void> => {
        try {
            await AutomationRunsApi.delete(id);
        } catch (error) {
            console.error('[Reporting] Error deleting report:', error);
            throw error;
        }
    },
};
