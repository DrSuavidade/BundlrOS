/**
 * Reporting & KPIs - Service Index
 * 
 * Environment-aware service that switches between mock and Supabase backends.
 * Set VITE_USE_MOCK_BACKEND=true to use mock data.
 */

import { MOCK_KPIS, PERIODS } from '../data/mockData';
import { SupabaseReportingService } from './supabaseService';
import type { KPIRecord, Report, ReportStatus } from '../types';

// Check if we should use mock backend
const useMockBackend = import.meta.env.VITE_USE_MOCK_BACKEND === 'true';

// In-memory reports for mock service
const mockReports: Report[] = [];

// Mock service wrapper
const MockReportingService = {
    getKPIs: async (period?: string): Promise<KPIRecord[]> => {
        if (!period) return MOCK_KPIS.filter(k => k.period === PERIODS[0]);
        return MOCK_KPIS.filter(k => k.period === period);
    },

    getPeriods: (): string[] => {
        return PERIODS;
    },

    getReports: async (): Promise<Report[]> => {
        return mockReports;
    },

    getReportById: async (id: string): Promise<Report | undefined> => {
        return mockReports.find(r => r.id === id);
    },

    createReport: async (title: string, period: string): Promise<Report> => {
        const report: Report = {
            id: `report-${Date.now()}`,
            title,
            period,
            status: 'REQUESTED' as ReportStatus,
            content: null,
            createdAt: new Date().toISOString(),
            kpiSnapshot: MOCK_KPIS.filter(k => k.period === period),
        };
        mockReports.push(report);
        return report;
    },

    updateReport: async (id: string, updates: Partial<Report>): Promise<Report> => {
        const index = mockReports.findIndex(r => r.id === id);
        if (index === -1) throw new Error('Report not found');
        mockReports[index] = { ...mockReports[index], ...updates };
        return mockReports[index];
    },

    generateContent: async (id: string, content: string): Promise<Report> => {
        return MockReportingService.updateReport(id, {
            content,
            status: 'GENERATED' as ReportStatus,
            generatedAt: new Date().toISOString(),
        });
    },

    approveReport: async (id: string): Promise<Report> => {
        return MockReportingService.updateReport(id, { status: 'APPROVED' as ReportStatus });
    },

    sendReport: async (id: string): Promise<Report> => {
        return MockReportingService.updateReport(id, {
            status: 'SENT' as ReportStatus,
            sentAt: new Date().toISOString(),
        });
    },
};

// Unified service interface
interface IReportingService {
    getKPIs: (period?: string) => Promise<KPIRecord[]>;
    getPeriods: () => string[];
    getReports: () => Promise<Report[]>;
    getReportById: (id: string) => Promise<Report | undefined>;
    createReport: (title: string, period: string) => Promise<Report>;
    updateReport: (id: string, updates: Partial<Report>) => Promise<Report>;
    generateContent: (id: string, content: string) => Promise<Report>;
    approveReport: (id: string) => Promise<Report>;
    sendReport: (id: string) => Promise<Report>;
}

// Export the appropriate service based on environment
export const ReportingService: IReportingService = useMockBackend
    ? MockReportingService
    : SupabaseReportingService;

// Also export for direct access if needed
export { MockReportingService, SupabaseReportingService };

// Backward compatibility exports
export const MOCK_KPIS_DATA = MOCK_KPIS;
export const PERIODS_DATA = useMockBackend ? PERIODS : SupabaseReportingService.getPeriods();

console.log(`[Reporting] Using ${useMockBackend ? 'MOCK' : 'SUPABASE'} backend`);
