export enum Status {
  IDLE = 'IDLE',
  ACTIVE = 'ACTIVE',
  BLOCKED = 'BLOCKED',
  COMPLETED = 'COMPLETED',
}

export enum DeliverableType {
  COMPONENT = 'COMPONENT',
  DOCUMENT = 'DOCUMENT',
  ASSET = 'ASSET',
}

export interface Rule {
  id: string;
  description: string;
  check: (factory: Factory) => boolean;
}

export interface StageTemplate {
  id: string;
  name: string;
  order: number;
  requiredDeliverables: string[]; // IDs of deliverables required to exit this stage
}

export interface PipelineTemplate {
  id: string;
  name: string;
  stages: StageTemplate[];
}

export interface Deliverable {
  id: string;
  name: string;
  type: DeliverableType;
  status: 'PENDING' | 'READY' | 'APPROVED';
  notes?: string;
}

export interface Factory {
  id: string;
  contractId: string;
  clientName: string;
  templateId: string;
  currentStageId: string;
  status: Status;
  deliverables: Deliverable[];
  blockers: string[]; // List of blocking reasons
  logs: LogEntry[];
  startedAt: string;
  lastUpdated: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  event: 'BOOTSTRAP' | 'ADVANCE' | 'BLOCK' | 'UPDATE';
  message: string;
}
