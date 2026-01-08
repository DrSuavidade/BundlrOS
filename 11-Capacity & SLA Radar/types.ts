export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface Client {
  id: string;
  name: string;
  sla: number; // percentage 0-100
  capacityUsage: number; // percentage 0-100
  riskScore: number; // 0-100
  churnRisk: boolean;
  activeProjects: number;
}

export interface Task {
  id: string;
  title: string;
  clientId: string;
  status: 'pending' | 'in-progress' | 'blocked' | 'completed';
  priority: 'low' | 'medium' | 'high';
  createdAt: number;
  source: 'external' | 'internal';
}

export interface IntakeItem {
  id: string;
  description: string;
  type: 'capacity_warning' | 'sla_breach' | 'churn_alert' | 'new_request';
  severity: RiskLevel;
  timestamp: number;
  status: 'new' | 'acknowledged' | 'resolved';
}

export interface DashboardMetrics {
  totalCapacity: number;
  avgSla: number;
  clientsAtRisk: number;
  activeAlerts: number;
}

export type EventType = 'ops.capacity_risk' | 'ops.sla_risk' | 'ops.churn_risk';

export interface SystemEvent {
  id: string;
  type: EventType;
  message: string;
  timestamp: number;
}