export interface Contract {
  id: string;
  title: string;
  value: string;
  status: 'active' | 'pending' | 'expired' | 'draft';
  endDate: string;
}

export interface Deliverable {
  id: string;
  title: string;
  progress: number; // 0-100
  dueDate: string;
  status: 'on-track' | 'at-risk' | 'delayed' | 'completed';
}

export interface Message {
  id: string;
  from: string;
  subject: string;
  preview: string;
  date: string;
  read: boolean;
}

export interface ApprovalItem {
  id: string;
  type: 'Budget' | 'Creative' | 'Legal';
  description: string;
  requester: string;
  date: string;
}

export interface QAMetric {
  id: string;
  metric: string;
  value: number | string;
  trend: 'up' | 'down' | 'neutral';
  status: 'pass' | 'warn' | 'fail';
}

export interface KPIPoint {
  date: string;
  value: number;
}

export interface Asset {
  id: string;
  name: string;
  type: 'image' | 'video' | 'doc';
  url: string;
}

export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: 'meeting' | 'delivery' | 'contract' | 'system';
}

export interface ClientData {
  id: string;
  name: string;
  industry: string;
  tier: 'Enterprise' | 'Growth' | 'Startup';
  contracts: Contract[];
  deliverables: Deliverable[];
  inbox: Message[];
  approvals: ApprovalItem[];
  qa: QAMetric[];
  kpis: {
    engagement: KPIPoint[];
    roi: KPIPoint[];
  };
  assets: Asset[];
  timeline: TimelineEvent[];
}
