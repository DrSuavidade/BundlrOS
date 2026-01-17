/**
 * Reporting & KPIs - Service Index
 */

import { SupabaseReportingService } from './supabaseService';
import type { KPIRecord, Report } from '../types';

// Unified service interface
export interface IReportingService {
    getKPIs: (period?: string) => Promise<KPIRecord[]>;
    getPeriods: () => string[];
    getReports: () => Promise<Report[]>;
    getReportById: (id: string) => Promise<Report | undefined>;
    createReport: (title: string, period: string, lang?: string) => Promise<Report>;
    updateReport: (id: string, updates: Partial<Report>) => Promise<Report>;
    generateContent: (id: string, content: string) => Promise<Report>;
    approveReport: (id: string) => Promise<Report>;
    sendReport: (id: string) => Promise<Report>;
}

export const ReportingService: IReportingService = SupabaseReportingService;

export { SupabaseReportingService };

// Backward compatibility exports
export const PERIODS_DATA = SupabaseReportingService.getPeriods();
