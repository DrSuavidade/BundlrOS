export enum KPIUnit {
  CURRENCY = 'CURRENCY',
  PERCENTAGE = 'PERCENTAGE',
  NUMBER = 'NUMBER'
}

export interface KPIRecord {
  id: string;
  name: string;
  value: number;
  previousValue: number;
  unit: KPIUnit;
  period: string; // e.g., "2023-10"
  category: 'Financial' | 'Growth' | 'Engagement';
}

export enum ReportStatus {
  REQUESTED = 'REQUESTED',
  GENERATED = 'GENERATED',
  APPROVED = 'APPROVED',
  SENT = 'SENT'
}

export interface Report {
  id: string;
  title: string;
  period: string;
  status: ReportStatus;
  content: string | null; // Markdown content
  createdAt: string;
  generatedAt?: string;
  sentAt?: string;
  kpiSnapshot: KPIRecord[]; // The data used to generate this report
}

export type ViewState = 'DASHBOARD' | 'REPORTS' | 'REPORT_DETAIL';