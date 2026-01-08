export type QAStatus = 'passed' | 'failed' | 'running' | 'pending';

export interface ChecklistItem {
  id: string;
  category: 'visual' | 'functional' | 'performance' | 'security';
  label: string;
  status: QAStatus;
  evidence?: string; // URL or text description of evidence
  logs?: string;
}

export interface QAResult {
  id: string;
  deliverableId: string;
  timestamp: string;
  status: QAStatus;
  score: number;
  checklist: ChecklistItem[];
  automatedSummary?: string;
}

export interface Deliverable {
  id: string;
  name: string;
  type: 'landing_page' | 'api_endpoint' | 'email_template' | 'dashboard_widget';
  version: string;
  owner: string;
  lastResult: QAResult;
}