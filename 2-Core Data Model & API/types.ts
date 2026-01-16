export enum EntityType {
  CLIENT = 'CLIENT',
  CONTACT = 'CONTACT',
  CONTRACT = 'CONTRACT',
  PROJECT = 'PROJECT',
  DELIVERABLE = 'DELIVERABLE'
}

export enum DeliverableStatus {
  DRAFT = 'draft',
  AWAITING_APPROVAL = 'awaiting_approval',
  APPROVED = 'approved',
  IN_QA = 'in_qa',
  QA_FAILED = 'qa_failed',
  READY = 'ready',
  PUBLISHED = 'published',
  ARCHIVED = 'archived'
}

export enum ProjectTool {
  PLANE = 'Plane',
  TAIGA = 'Taiga',
  JIRA = 'Jira',
  NONE = 'None'
}

export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface Client extends BaseEntity {
  name: string;
  code: string;
  industry: string;
  status: 'active' | 'inactive';
  email?: string;
}

export interface Contact extends BaseEntity {
  client_id: string;
  name: string;
  email: string;
  role: string;
}

export interface ServiceContract extends BaseEntity {
  client_id: string;
  title: string;
  start_date: string;
  end_date: string;
  value: number;
  status: 'active' | 'pending' | 'expired';
  payment_type?: 'monthly' | 'one_off';
  amount_paid?: number;
}

export interface Project extends BaseEntity {
  client_id: string;
  contract_id?: string;
  name: string;
  external_tool: ProjectTool;
  external_id?: string;
  status: 'active' | 'completed' | 'on_hold';
}

export interface Deliverable extends BaseEntity {
  project_id: string;
  title: string;
  type: 'document' | 'software' | 'design' | 'report';
  status: DeliverableStatus;
  version: string;
  due_date: string;
}

// Event Simulation
export interface SystemEvent {
  id: string;
  type: string; // e.g., client.created
  entity_id: string;
  timestamp: string;
  details: string;
}