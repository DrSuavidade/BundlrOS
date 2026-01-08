import { Client, Task, RiskLevel, IntakeItem } from './types';

export const MOCK_CLIENTS: Client[] = [
  { id: 'c1', name: 'Alpha Corp', sla: 98.5, capacityUsage: 45, riskScore: 10, churnRisk: false, activeProjects: 2 },
  { id: 'c2', name: 'Beta Industries', sla: 92.0, capacityUsage: 88, riskScore: 65, churnRisk: true, activeProjects: 5 },
  { id: 'c3', name: 'Gamma Global', sla: 99.0, capacityUsage: 30, riskScore: 5, churnRisk: false, activeProjects: 1 },
  { id: 'c4', name: 'Delta Logistics', sla: 85.0, capacityUsage: 95, riskScore: 85, churnRisk: true, activeProjects: 8 },
  { id: 'c5', name: 'Epsilon Tech', sla: 94.5, capacityUsage: 60, riskScore: 25, churnRisk: false, activeProjects: 3 },
];

export const MOCK_INTAKE: IntakeItem[] = [
  { id: 'i1', description: 'Delta Logistics capacity nearing 100%', type: 'capacity_warning', severity: RiskLevel.CRITICAL, timestamp: Date.now() - 100000, status: 'new' },
  { id: 'i2', description: 'Beta Industries SLA dropped below 93%', type: 'sla_breach', severity: RiskLevel.HIGH, timestamp: Date.now() - 500000, status: 'new' },
  { id: 'i3', description: 'New project request from Alpha Corp', type: 'new_request', severity: RiskLevel.LOW, timestamp: Date.now() - 800000, status: 'acknowledged' },
];

export const COLORS = {
  success: '#10b981', // emerald-500
  warning: '#f59e0b', // amber-500
  danger: '#f43f5e',  // rose-500
  neutral: '#64748b', // slate-500
  background: '#1e293b' // slate-800
};