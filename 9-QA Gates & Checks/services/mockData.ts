import { Deliverable, QAResult, ChecklistItem, QAStatus } from '../types';

const generateChecklist = (type: string): ChecklistItem[] => {
  const common: ChecklistItem[] = [
    { id: 'sec-1', category: 'security', label: 'No hardcoded secrets', status: 'passed' },
    { id: 'perf-1', category: 'performance', label: 'Load time < 200ms', status: 'passed' },
  ];

  if (type === 'landing_page') {
    return [
      ...common,
      { id: 'vis-1', category: 'visual', label: 'Mobile responsiveness check', status: 'failed', evidence: 'Screenshot mismatch at 320px width', logs: 'Element .hero-banner overflowed viewport.' },
      { id: 'func-1', category: 'functional', label: 'CTA button links work', status: 'passed' },
      { id: 'vis-2', category: 'visual', label: 'Font loading', status: 'passed' },
    ];
  }
  
  if (type === 'api_endpoint') {
    return [
      ...common,
      { id: 'func-2', category: 'functional', label: 'Returns 200 OK on valid input', status: 'passed' },
      { id: 'func-3', category: 'functional', label: 'Returns 400 on invalid payload', status: 'failed', logs: 'Expected 400, got 500 Internal Server Error. Trace ID: 99283-x' },
    ];
  }

  return common;
};

export const initialDeliverables: Deliverable[] = [
  {
    id: 'del-001',
    name: 'Q3 Marketing Landing Page',
    type: 'landing_page',
    version: 'v1.0.2',
    owner: 'Frontend Team',
    lastResult: {
      id: 'qa-101',
      deliverableId: 'del-001',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      status: 'failed',
      score: 75,
      checklist: generateChecklist('landing_page'),
    }
  },
  {
    id: 'del-002',
    name: 'User Auth API',
    type: 'api_endpoint',
    version: 'v2.1.0',
    owner: 'Backend Team',
    lastResult: {
      id: 'qa-102',
      deliverableId: 'del-002',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
      status: 'passed',
      score: 100,
      checklist: generateChecklist('api_endpoint').map(i => ({...i, status: 'passed', logs: undefined, evidence: 'Verified'})),
    }
  },
  {
    id: 'del-003',
    name: 'Weekly Digest Email',
    type: 'email_template',
    version: 'v1.5',
    owner: 'Growth Team',
    lastResult: {
      id: 'qa-103',
      deliverableId: 'del-003',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
      status: 'passed',
      score: 100,
      checklist: generateChecklist('email_template'),
    }
  }
];

export const runMockQA = async (deliverableId: string, currentType: string): Promise<QAResult> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  const isPass = Math.random() > 0.3; // 70% chance to pass
  const baseList = generateChecklist(currentType);
  
  const newList = baseList.map(item => ({
    ...item,
    status: isPass ? 'passed' : (Math.random() > 0.8 ? 'failed' : 'passed') as QAStatus,
    logs: isPass ? undefined : 'Random simulation failure log entry...',
  }));

  const overallStatus = newList.some(i => i.status === 'failed') ? 'failed' : 'passed';
  const score = Math.floor((newList.filter(i => i.status === 'passed').length / newList.length) * 100);

  return {
    id: `qa-${Date.now()}`,
    deliverableId,
    timestamp: new Date().toISOString(),
    status: overallStatus,
    score,
    checklist: newList,
    automatedSummary: overallStatus === 'passed' ? 'All systems go. Ready for deployment.' : 'Validation failed. Check logs for details.',
  };
};