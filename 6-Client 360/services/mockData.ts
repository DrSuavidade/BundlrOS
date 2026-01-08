import { ClientData } from '../types';

export const MOCK_CLIENT: ClientData = {
  id: 'c-101',
  name: 'Acme Corp',
  industry: 'Technology',
  tier: 'Enterprise',
  contracts: [
    { id: 'cnt-1', title: 'Q4 Marketing Retainer', value: '$150k', status: 'active', endDate: '2024-12-31' },
    { id: 'cnt-2', title: '2025 Strategy Renewal', value: '$450k', status: 'pending', endDate: '2025-12-31' },
  ],
  deliverables: [
    { id: 'del-1', title: 'Website Redesign', progress: 75, dueDate: '2024-11-15', status: 'on-track' },
    { id: 'del-2', title: 'Q3 Report', progress: 100, dueDate: '2024-10-01', status: 'completed' },
    { id: 'del-3', title: 'Mobile App Launch', progress: 30, dueDate: '2024-12-20', status: 'at-risk' },
  ],
  inbox: [
    { id: 'msg-1', from: 'Sarah Connor', subject: 'Feedback on Hero Image', preview: 'The creative team loves the direction, but...', date: '2h ago', read: false },
    { id: 'msg-2', from: 'John Doe', subject: 'Meeting Reschedule', preview: 'Can we move the weekly sync to...', date: '5h ago', read: true },
    { id: 'msg-3', from: 'Billing Dept', subject: 'Invoice #4023 Approved', preview: 'Payment has been processed for...', date: '1d ago', read: true },
  ],
  approvals: [
    { id: 'app-1', type: 'Creative', description: 'Holiday Campaign Assets', requester: 'Design Team', date: 'Today' },
    { id: 'app-2', type: 'Budget', description: 'Ad Spend Increase', requester: 'Media Team', date: 'Yesterday' },
  ],
  qa: [
    { id: 'qa-1', metric: 'Bug Count', value: 12, trend: 'down', status: 'pass' },
    { id: 'qa-2', metric: 'Uptime', value: '99.9%', trend: 'neutral', status: 'pass' },
    { id: 'qa-3', metric: 'Load Time', value: '1.8s', trend: 'up', status: 'warn' },
  ],
  kpis: {
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
  },
  assets: [
    { id: 'ast-1', name: 'Brand Guide 2024', type: 'doc', url: '#' },
    { id: 'ast-2', name: 'Logo Pack', type: 'image', url: 'https://picsum.photos/200/200' },
    { id: 'ast-3', name: 'Promo Video v2', type: 'video', url: '#' },
    { id: 'ast-4', name: 'Social Templates', type: 'image', url: 'https://picsum.photos/201/201' },
  ],
  timeline: [
    { id: 'evt-1', title: 'Contract Signed', description: 'Q4 Retainer initialized.', timestamp: '2h ago', type: 'contract' },
    { id: 'evt-2', title: 'Assets Uploaded', description: 'New campaign visuals added.', timestamp: '5h ago', type: 'system' },
    { id: 'evt-3', title: 'Client Call', description: 'Weekly sync with Sarah.', timestamp: 'Yesterday', type: 'meeting' },
    { id: 'evt-4', title: 'Milestone Reached', description: 'Website Phase 1 complete.', timestamp: '2 days ago', type: 'delivery' },
  ]
};

export const fetchClientData = async (id: string): Promise<ClientData> => {
  // Simulate network delay
  return new Promise((resolve) => {
    setTimeout(() => resolve(MOCK_CLIENT), 800);
  });
};
