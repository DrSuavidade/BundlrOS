export enum ApprovalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
}

export interface ApprovalEvent {
  id: string;
  type: 'CREATED' | 'VIEWED' | 'REMINDER_SENT' | 'COMMENT_ADDED' | 'STATUS_CHANGED';
  timestamp: string; // ISO date string
  description: string;
  actor: string; // 'System', 'Admin', 'Client'
}

export interface ApprovalRequest {
  id: string;
  title: string;
  description: string;
  clientName: string;
  clientEmail: string;
  status: ApprovalStatus;
  createdAt: string;
  dueDate: string;
  token: string;
  history: ApprovalEvent[];
  attachmentName?: string;
  attachmentUrl?: string; // Placeholder for file URL
}

export interface Stats {
  total: number;
  approved: number;
  rejected: number;
  pending: number;
}