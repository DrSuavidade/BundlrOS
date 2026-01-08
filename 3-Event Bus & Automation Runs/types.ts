export enum Status {
  SUCCESS = 'success',
  FAILED = 'failed',
  WAITING = 'waiting',
  RUNNING = 'running',
  CREATED = 'created'
}

export interface SystemEvent {
  id: string;
  type: string; // e.g., 'order.created', 'user.signup'
  clientId: string;
  payload: Record<string, any>;
  idempotencyKey: string;
  createdAt: string;
  status: Status; // Derived from aggregate runs or processing status
}

export interface AutomationRun {
  id: string;
  eventId: string;
  workflowId: string; // n8n workflow ID reference
  status: Status;
  input: Record<string, any>;
  output?: Record<string, any>;
  error?: {
    message: string;
    code: string;
    stack?: string;
  };
  attemptCount: number;
  startedAt: string;
  completedAt?: string;
}

export interface Stats {
  totalEvents: number;
  successRate: number;
  activeRuns: number;
  failedRuns: number;
}
