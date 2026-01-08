import { ApprovalRequest, ApprovalStatus } from '../types';

export const INITIAL_APPROVALS: ApprovalRequest[] = [
  {
    id: 'app-001',
    title: 'Q3 Marketing Budget Proposal',
    description: 'Approval requested for the Q3 marketing allocation. This includes an increase in social media spend by 15% and a reduction in print media. Total budget requested: $45,000. Please review the attached breakdown for details on specific campaign allocations.',
    clientName: 'Acme Corp',
    clientEmail: 'finance@acmecorp.com',
    status: ApprovalStatus.PENDING,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days from now
    token: 'token-acme-q3',
    history: [
      {
        id: 'evt-1',
        type: 'CREATED',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
        description: 'Approval request created',
        actor: 'System'
      }
    ],
    attachmentName: 'Q3_Budget_v2.pdf'
  },
  {
    id: 'app-002',
    title: 'Homepage Redesign Mockups',
    description: 'Final review for the new homepage design. Key changes include a simplified navigation bar, hero video section, and updated testimonials component. We need sign-off before development begins next sprint.',
    clientName: 'TechFlow Inc.',
    clientEmail: 'product@techflow.io',
    status: ApprovalStatus.APPROVED,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    dueDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    token: 'token-techflow-design',
    history: [
      {
        id: 'evt-2',
        type: 'CREATED',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
        description: 'Approval request created',
        actor: 'System'
      },
      {
        id: 'evt-3',
        type: 'STATUS_CHANGED',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
        description: 'Status changed to APPROVED',
        actor: 'Client'
      }
    ],
    attachmentName: 'Homepage_V4_Figma.png'
  },
  {
    id: 'app-003',
    title: 'Vendor Contract Renewal - CleanServices',
    description: 'Annual contract renewal for office cleaning services. The vendor has increased rates by 3% due to inflation. Service level agreement remains the same.',
    clientName: 'Internal Ops',
    clientEmail: 'ops@ourcompany.com',
    status: ApprovalStatus.PENDING,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10).toISOString(),
    token: 'token-ops-cleaning',
    history: [
      {
        id: 'evt-4',
        type: 'CREATED',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        description: 'Approval request created',
        actor: 'System'
      }
    ]
  }
];