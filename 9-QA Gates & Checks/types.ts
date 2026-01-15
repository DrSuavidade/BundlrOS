export type QAStatus = 'passed' | 'failed' | 'running' | 'pending' | 'awaiting';

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
  type: string;
  version: string;
  qa_checklist_state?: Record<string, boolean>; // Persisted checklist state
  owner: string;
  status: string;
  lastResult: QAResult;
}