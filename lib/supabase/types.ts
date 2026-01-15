/**
 * Database Types for BundlrOS Supabase Schema
 * Auto-generated from schema definition
 */

// Enum Types matching Supabase custom types
export type ClientStatus = 'active' | 'churned' | 'lead';
export type ContractStatus = 'draft' | 'pending' | 'active' | 'expired';
export type ProjectStatus = 'active' | 'completed' | 'on_hold';
export type DeliverableStatus = 'draft' | 'in_progress' | 'awaiting_approval' | 'in_qa' | 'qa_failed' | 'approved' | 'published' | 'archived';
export type DeliverableType = 'document' | 'design' | 'software' | 'report' | 'video';
export type UserRole = 'admin' | 'am' | 'podlead' | 'qa' | 'designer' | 'dev' | 'client_approver';
export type UserStatus = 'active' | 'pending' | 'inactive';
export type IntakePriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type IntakeStatus = 'New' | 'Triaged' | 'In Progress' | 'Done' | 'Archived';

// Database schema definition
export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string;
                    email: string;
                    name: string | null;
                    title: string | null;
                    role: UserRole;
                    status: UserStatus;
                    organization_id: string | null;
                    avatar_url: string | null;
                    password_hash: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>;
                Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
            };
            clients: {
                Row: {
                    id: string;
                    name: string;
                    code: string | null;
                    email: string | null;
                    nif: string | null;
                    industry: string | null;
                    status: ClientStatus;
                    created_at: string;
                    updated_at: string;
                };
                Insert: Omit<Database['public']['Tables']['clients']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string };
                Update: Partial<Database['public']['Tables']['clients']['Insert']>;
            };
            contacts: {
                Row: {
                    id: string;
                    client_id: string;
                    name: string;
                    email: string | null;
                    phone: string | null;
                    role: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: Omit<Database['public']['Tables']['contacts']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string };
                Update: Partial<Database['public']['Tables']['contacts']['Insert']>;
            };
            contracts: {
                Row: {
                    id: string;
                    client_id: string;
                    title: string;
                    start_date: string | null;
                    end_date: string | null;
                    value: number | null;
                    status: ContractStatus;
                    payment_type: 'monthly' | 'one_off';
                    created_at: string;
                    updated_at: string;
                };
                Insert: Omit<Database['public']['Tables']['contracts']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string };
                Update: Partial<Database['public']['Tables']['contracts']['Insert']>;
            };
            projects: {
                Row: {
                    id: string;
                    client_id: string;
                    contract_id: string | null;
                    name: string;
                    status: ProjectStatus;
                    external_tool: string | null;
                    external_id: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: Omit<Database['public']['Tables']['projects']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string };
                Update: Partial<Database['public']['Tables']['projects']['Insert']>;
            };
            deliverables: {
                Row: {
                    id: string;
                    project_id: string;
                    title: string;
                    type: DeliverableType | null;
                    status: DeliverableStatus;
                    version: string | null;
                    due_date: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: Omit<Database['public']['Tables']['deliverables']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string };
                Update: Partial<Database['public']['Tables']['deliverables']['Insert']>;
            };
            budgets: {
                Row: {
                    id: string;
                    client_id: string;
                    project_name: string | null;
                    contract_id: string | null;
                    items: Record<string, unknown> | null;
                    notes: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: Omit<Database['public']['Tables']['budgets']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string };
                Update: Partial<Database['public']['Tables']['budgets']['Insert']>;
            };
            intake_items: {
                Row: {
                    id: string;
                    title: string;
                    description: string | null;
                    client_id: string | null;
                    requestor: string | null;
                    priority: IntakePriority;
                    status: IntakeStatus;
                    assignee_id: string | null;
                    ai_analysis: Record<string, unknown> | null;
                    tags: string[] | null;
                    sla_due_at: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: Omit<Database['public']['Tables']['intake_items']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string };
                Update: Partial<Database['public']['Tables']['intake_items']['Insert']>;
            };
            system_events: {
                Row: {
                    id: string;
                    type: string;
                    client_id: string | null;
                    payload: Record<string, unknown> | null;
                    idempotency_key: string | null;
                    status: string;
                    created_at: string;
                };
                Insert: {
                    type: string;
                    status: string;
                    id?: string;
                    client_id?: string | null;
                    payload?: Record<string, unknown> | null;
                    idempotency_key?: string | null;
                };
                Update: Partial<Database['public']['Tables']['system_events']['Insert']>;
            };
            automation_runs: {
                Row: {
                    id: string;
                    event_id: string | null;
                    workflow_id: string | null;
                    status: string;
                    input: Record<string, unknown> | null;
                    output: Record<string, unknown> | null;
                    error: Record<string, unknown> | null;
                    attempt_count: number;
                    started_at: string;
                    completed_at: string | null;
                };
                Insert: Omit<Database['public']['Tables']['automation_runs']['Row'], 'id' | 'started_at'> & { id?: string };
                Update: Partial<Database['public']['Tables']['automation_runs']['Insert']>;
            };
            audit_logs: {
                Row: {
                    id: string;
                    action: string;
                    performer_id: string | null;
                    target_id: string | null;
                    details: Record<string, unknown> | null;
                    created_at: string;
                };
                Insert: {
                    action: string;
                    id?: string;
                    performer_id?: string | null;
                    target_id?: string | null;
                    details?: Record<string, unknown> | null;
                };
                Update: Partial<Database['public']['Tables']['audit_logs']['Insert']>;
            };
            service_factories: {
                Row: {
                    id: string;
                    contract_id: string;
                    client_name: string;
                    template_id: string;
                    current_stage_id: string | null;
                    status: string;
                    deliverables: Record<string, unknown>[] | null;
                    blockers: string[] | null;
                    logs: Record<string, unknown>[] | null;
                    started_at: string;
                    last_updated: string;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    contract_id: string;
                    client_name: string;
                    template_id: string;
                    current_stage_id?: string | null;
                    status?: string;
                    deliverables?: Record<string, unknown>[] | null;
                    blockers?: string[] | null;
                    logs?: Record<string, unknown>[] | null;
                    started_at?: string;
                    last_updated?: string;
                    created_at?: string;
                };
                Update: Partial<Database['public']['Tables']['service_factories']['Insert']>;
            };
            file_assets: {
                Row: {
                    id: string;
                    filename: string;
                    mime_type: string | null;
                    size_bytes: number | null;
                    public_url: string | null;
                    preview_url: string | null;
                    client_id: string | null;
                    deliverable_id: string | null;
                    tags: string[] | null;
                    description: string | null;
                    uploaded_at: string;
                };
                Insert: Omit<Database['public']['Tables']['file_assets']['Row'], 'id' | 'uploaded_at'> & { id?: string };
                Update: Partial<Database['public']['Tables']['file_assets']['Insert']>;
            };
            notifications: {
                Row: {
                    id: string;
                    user_id: string;
                    title: string;
                    message: string | null;
                    type: 'info' | 'success' | 'warning' | 'error';
                    is_read: boolean;
                    link: string | null;
                    created_at: string;
                };
                Insert: Omit<Database['public']['Tables']['notifications']['Row'], 'id' | 'created_at'> & { id?: string };
                Update: Partial<Database['public']['Tables']['notifications']['Insert']>;
            };
        };
        Functions: Record<string, never>;
        Enums: {
            client_status: ClientStatus;
            contract_status: ContractStatus;
            project_status: ProjectStatus;
            deliverable_status: DeliverableStatus;
            deliverable_type: DeliverableType;
            user_role: UserRole;
            user_status: UserStatus;
            intake_priority: IntakePriority;
            intake_status: IntakeStatus;
        };
    };
}

// Convenience type aliases for easier access
export type Tables = Database['public']['Tables'];
export type Profile = Tables['profiles']['Row'];
export type Client = Tables['clients']['Row'];
export type Contact = Tables['contacts']['Row'];
export type Contract = Tables['contracts']['Row'];
export type Project = Tables['projects']['Row'];
export type Deliverable = Tables['deliverables']['Row'];
export type Budget = Tables['budgets']['Row'];
export type IntakeItem = Tables['intake_items']['Row'];
export type SystemEvent = Tables['system_events']['Row'];
export type AutomationRun = Tables['automation_runs']['Row'];
export type AuditLog = Tables['audit_logs']['Row'];

// Insert types
export type ProfileInsert = Tables['profiles']['Insert'];
export type ClientInsert = Tables['clients']['Insert'];
export type ContactInsert = Tables['contacts']['Insert'];
export type ContractInsert = Tables['contracts']['Insert'];
export type ProjectInsert = Tables['projects']['Insert'];
export type DeliverableInsert = Tables['deliverables']['Insert'];
export type BudgetInsert = Tables['budgets']['Insert'];
export type IntakeItemInsert = Tables['intake_items']['Insert'];
export type SystemEventInsert = Tables['system_events']['Insert'];
export type AutomationRunInsert = Tables['automation_runs']['Insert'];
export type AuditLogInsert = Tables['audit_logs']['Insert'];

// Update types
export type ProfileUpdate = Tables['profiles']['Update'];
export type ClientUpdate = Tables['clients']['Update'];
export type ContactUpdate = Tables['contacts']['Update'];
export type ContractUpdate = Tables['contracts']['Update'];
export type ProjectUpdate = Tables['projects']['Update'];
export type DeliverableUpdate = Tables['deliverables']['Update'];
export type BudgetUpdate = Tables['budgets']['Update'];
export type IntakeItemUpdate = Tables['intake_items']['Update'];
export type SystemEventUpdate = Tables['system_events']['Update'];
export type AutomationRunUpdate = Tables['automation_runs']['Update'];
export type AuditLogUpdate = Tables['audit_logs']['Update'];
export type FileAsset = Tables['file_assets']['Row'];
export type FileAssetInsert = Tables['file_assets']['Insert'];
export type FileAssetUpdate = Tables['file_assets']['Update'];
export type ServiceFactory = Tables['service_factories']['Row'];
export type ServiceFactoryInsert = Tables['service_factories']['Insert'];
export type ServiceFactoryUpdate = Tables['service_factories']['Update'];
export type Notification = Tables['notifications']['Row'];
export type NotificationInsert = Tables['notifications']['Insert'];
export type NotificationUpdate = Tables['notifications']['Update'];
