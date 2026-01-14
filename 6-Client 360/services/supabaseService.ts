/**
 * Client 360 - Supabase Service
 * 
 * Fetches client data from Supabase, aggregating data from multiple tables
 * to build the comprehensive Client 360 view.
 */

import {
    ClientsApi,
    ContractsApi,
    DeliverablesApi,
    ProjectsApi,
    IntakeItemsApi,
    AuditLogsApi,
    type Client as SupabaseClient,
    type Contract as SupabaseContract,
    type Deliverable as SupabaseDeliverable,
    type Project as SupabaseProject,
} from '@bundlros/supabase';
import { ClientData, Contract, Deliverable, Message, ApprovalItem, QAMetric, Asset, TimelineEvent, KPIPoint } from '../types';

// Map Supabase contract to local type
const mapContract = (contract: SupabaseContract): Contract => ({
    id: contract.id,
    title: contract.title,
    value: contract.value ? `$${(contract.value / 1000).toFixed(0)}k` : '$0',
    status: (contract.status as 'active' | 'pending' | 'expired' | 'draft') || 'active',
    endDate: contract.end_date || new Date().toISOString(),
});

// Map Supabase deliverable to local type
const mapDeliverable = (deliverable: SupabaseDeliverable): Deliverable => {
    // Calculate progress based on status
    const progressMap: Record<string, number> = {
        'draft': 10,
        'in_progress': 50,
        'awaiting_approval': 75,
        'in_qa': 85,
        'qa_failed': 60,
        'approved': 90,
        'published': 100,
        'archived': 100,
    };
    const statusMap: Record<string, 'on-track' | 'at-risk' | 'delayed' | 'completed'> = {
        'draft': 'on-track',
        'in_progress': 'on-track',
        'awaiting_approval': 'on-track',
        'in_qa': 'on-track',
        'qa_failed': 'at-risk',
        'approved': 'on-track',
        'published': 'completed',
        'archived': 'completed',
    };

    return {
        id: deliverable.id,
        title: deliverable.title,
        progress: progressMap[deliverable.status] || 0,
        dueDate: deliverable.due_date || new Date().toISOString(),
        status: statusMap[deliverable.status] || 'on-track',
    };
};

// Generate mock KPI data (would come from analytics table in real system)
const generateMockKPIs = (): { engagement: KPIPoint[]; roi: KPIPoint[] } => ({
    engagement: [
        { date: 'Mon', value: 400 },
        { date: 'Tue', value: 300 },
        { date: 'Wed', value: 550 },
        { date: 'Thu', value: 450 },
        { date: 'Fri', value: 600 },
        { date: 'Sat', value: 700 },
        { date: 'Sun', value: 650 },
    ],
    roi: [
        { date: 'Jan', value: 120 },
        { date: 'Feb', value: 135 },
        { date: 'Mar', value: 160 },
        { date: 'Apr', value: 155 },
        { date: 'May', value: 190 },
    ]
});

export const Client360Service = {
    fetchClientData: async (clientId: string): Promise<ClientData | null> => {
        try {
            // Check if clientId is a valid UUID (Supabase IDs are UUIDs)
            const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(clientId);

            let client: SupabaseClient | null = null;

            if (isValidUUID) {
                // Try to fetch by UUID
                client = await ClientsApi.getById(clientId);
            }

            if (!client) {
                // clientId is not a valid UUID or client not found - get first available client
                console.log('[Client360] Invalid UUID or not found, fetching first available client...');
                const allClients = await ClientsApi.getAll();
                if (allClients.length === 0) {
                    console.log('[Client360] No clients found in database');
                    return null;
                }
                client = allClients[0];
                clientId = client.id; // Update clientId for subsequent queries
            }

            // Fetch related data in parallel
            const [contracts, projects, intakeItems, auditLogs] = await Promise.all([
                ContractsApi.getByClientId(clientId),
                ProjectsApi.getByClientId(clientId),
                IntakeItemsApi.getAll(), // Filter by client
                AuditLogsApi.getAll(20),
            ]);

            // Get deliverables from projects
            let deliverables: SupabaseDeliverable[] = [];
            for (const project of projects) {
                const projectDeliverables = await DeliverablesApi.getByProjectId(project.id);
                deliverables = [...deliverables, ...projectDeliverables];
            }

            // Build timeline from audit logs
            const timeline: TimelineEvent[] = auditLogs.slice(0, 5).map(log => ({
                id: log.id,
                title: log.action.replace('.', ' ').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
                description: typeof log.details === 'object' && log.details
                    ? (log.details as Record<string, unknown>).message as string || log.action
                    : String(log.details || log.action),
                timestamp: new Date(log.created_at).toLocaleDateString(),
                type: log.action.includes('contract') ? 'contract'
                    : log.action.includes('meeting') ? 'meeting'
                        : log.action.includes('deliver') ? 'delivery'
                            : 'system',
            }));

            // Build inbox from intake items
            const inbox: Message[] = intakeItems
                .filter(item => item.client_id === clientId)
                .slice(0, 3)
                .map(item => ({
                    id: item.id,
                    from: item.requestor || 'Unknown',
                    subject: item.title,
                    preview: item.description?.slice(0, 50) || '',
                    date: new Date(item.created_at).toLocaleDateString(),
                    read: item.status !== 'New',
                }));

            // Mock QA metrics (would come from QA system)
            const qa: QAMetric[] = [
                { id: 'qa-1', metric: 'Bug Count', value: Math.floor(Math.random() * 20), trend: 'down', status: 'pass' },
                { id: 'qa-2', metric: 'Uptime', value: '99.9%', trend: 'neutral', status: 'pass' },
                { id: 'qa-3', metric: 'Load Time', value: '1.8s', trend: 'up', status: 'warn' },
            ];

            // Mock assets (would come from assets table)
            const assets: Asset[] = [
                { id: 'ast-1', name: 'Brand Guide', type: 'doc', url: '#' },
                { id: 'ast-2', name: 'Logo Pack', type: 'image', url: 'https://picsum.photos/200/200' },
            ];

            // Mock approvals (would come from workflow system)
            const approvals: ApprovalItem[] = deliverables
                .filter(d => d.status === 'awaiting_approval')
                .slice(0, 2)
                .map(d => ({
                    id: d.id,
                    type: 'Creative' as const,
                    description: d.title,
                    requester: 'Design Team',
                    date: 'Today',
                }));

            const clientData: ClientData = {
                id: client.id,
                name: client.name,
                industry: client.industry || 'Technology',
                tier: 'Enterprise', // Would come from client tier field
                contracts: contracts.map(mapContract),
                deliverables: deliverables.slice(0, 5).map(mapDeliverable),
                inbox,
                approvals,
                qa,
                kpis: generateMockKPIs(),
                assets,
                timeline: timeline.length > 0 ? timeline : [
                    { id: 'evt-1', title: 'Client Created', description: 'Account initialized', timestamp: new Date(client.created_at).toLocaleDateString(), type: 'system' }
                ],
            };

            return clientData;
        } catch (error) {
            console.error('[Client360] Error fetching client data:', error);
            return null;
        }
    },

    getClientList: async (): Promise<Array<{ id: string; name: string }>> => {
        try {
            const clients = await ClientsApi.getAll();
            return clients.map(c => ({ id: c.id, name: c.name }));
        } catch (error) {
            console.error('[Client360] Error fetching clients:', error);
            return [];
        }
    },

    createClient: async (client: { name: string; code: string; industry: string; status: 'active' | 'churned' | 'lead' }): Promise<{ id: string } | null> => {
        try {
            const newClient = await ClientsApi.create(client);
            return { id: newClient.id };
        } catch (error) {
            console.error('[Client360] Error creating client:', error);
            return null;
        }
    },
};
