export enum Priority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  CRITICAL = 'Critical'
}

export enum Status {
  NEW = 'New',
  TRIAGING = 'Triaging',
  IN_PROGRESS = 'In Progress',
  BLOCKED = 'Blocked',
  RESOLVED = 'Resolved',
  CLOSED = 'Closed'
}

export interface IntakeItem {
  id: string;
  title: string;
  description: string;
  client: string;
  requestor: string;
  priority: Priority;
  status: Status;
  createdAt: string; // ISO Date string
  slaDueAt: string; // ISO Date string
  assignee?: string;
  tags: string[];
  aiAnalysis?: AIAnalysisResult;
}

export interface AIAnalysisResult {
  suggestedPriority: Priority;
  reasoning: string;
  suggestedCategory: string;
  summary: string;
  nextSteps: string[];
}

export interface FilterState {
  search: string;
  status: Status | 'All';
  priority: Priority | 'All';
  client: string | 'All';
}
