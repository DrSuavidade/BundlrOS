import { SystemEvent, AutomationRun, Status } from '../types';

const EVENT_TYPES = ['order.created', 'user.signup', 'subscription.renewed', 'payment.failed', 'ticket.opened'];
const CLIENTS = ['Client_Alpha', 'Client_Beta', 'Client_Gamma', 'Enterprise_X'];

const generateId = (prefix: string) => `${prefix}_${Math.random().toString(36).substr(2, 9)}`;

const randomDate = (start: Date, end: Date) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();
};

const createMockEvent = (forcedType?: string, forcedClient?: string): SystemEvent => {
  const type = forcedType || EVENT_TYPES[Math.floor(Math.random() * EVENT_TYPES.length)];
  const clientId = forcedClient || CLIENTS[Math.floor(Math.random() * CLIENTS.length)];
  
  return {
    id: generateId('evt'),
    type,
    clientId,
    idempotencyKey: generateId('idemp'),
    createdAt: randomDate(new Date(Date.now() - 86400000 * 2), new Date()),
    payload: {
      data: {
        userId: generateId('usr'),
        amount: Math.floor(Math.random() * 1000),
        currency: 'USD',
        items: Array.from({ length: Math.floor(Math.random() * 3) + 1 }).map((_, i) => ({
          sku: `SKU-${Math.floor(Math.random() * 9999)}`,
          qty: i + 1
        }))
      },
      meta: {
        source: 'web_webhook',
        version: '1.0'
      }
    },
    status: Status.CREATED
  };
};

const createMockRun = (event: SystemEvent): AutomationRun => {
  const isSuccess = Math.random() > 0.2;
  const isRunning = Math.random() > 0.9;
  
  let status = isSuccess ? Status.SUCCESS : Status.FAILED;
  if (isRunning) status = Status.RUNNING;
  if (Math.random() > 0.95) status = Status.WAITING;

  const run: AutomationRun = {
    id: generateId('run'),
    eventId: event.id,
    workflowId: `n8n-wf-${Math.floor(Math.random() * 100)}`,
    status,
    input: {
      event: event.payload,
      triggerTime: event.createdAt
    },
    attemptCount: status === Status.FAILED ? Math.floor(Math.random() * 3) + 1 : 1,
    startedAt: new Date(new Date(event.createdAt).getTime() + 2000).toISOString(),
  };

  if (status === Status.SUCCESS) {
    run.completedAt = new Date(new Date(run.startedAt).getTime() + Math.random() * 5000).toISOString();
    run.output = {
      result: 'processed',
      syncId: generateId('sync'),
      downstreamResponse: { code: 200, message: 'OK' }
    };
  } else if (status === Status.FAILED) {
    run.completedAt = new Date(new Date(run.startedAt).getTime() + Math.random() * 1000).toISOString();
    run.error = {
      message: 'Connection timeout to external CRM',
      code: 'ECONNRESET',
      stack: 'Error: Connection timeout\n    at WorkflowNode.execute (/n8n/nodes/Crm.js:45:12)'
    };
  }

  return run;
};

// Initial state
let events: SystemEvent[] = Array.from({ length: 25 }).map(() => createMockEvent()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
let runs: AutomationRun[] = events.flatMap(e => {
  // 1 to 2 runs per event
  return Array.from({ length: Math.floor(Math.random() * 2) + 1 }).map(() => createMockRun(e));
});

// Update event status based on runs
events = events.map(e => {
  const eventRuns = runs.filter(r => r.eventId === e.id);
  const anyFailed = eventRuns.some(r => r.status === Status.FAILED);
  const anyRunning = eventRuns.some(r => r.status === Status.RUNNING);
  const anyWaiting = eventRuns.some(r => r.status === Status.WAITING);
  
  let status = Status.SUCCESS;
  if (anyFailed) status = Status.FAILED;
  else if (anyRunning) status = Status.RUNNING;
  else if (anyWaiting) status = Status.WAITING;
  
  return { ...e, status };
});

export const MockService = {
  getEvents: () => Promise.resolve([...events]),
  getRuns: () => Promise.resolve([...runs]),
  getEvent: (id: string) => Promise.resolve(events.find(e => e.id === id)),
  getRunsByEvent: (eventId: string) => Promise.resolve(runs.filter(r => r.eventId === eventId)),
  getRun: (id: string) => Promise.resolve(runs.find(r => r.id === id)),
  
  // Simulate live incoming data
  addRandomEvent: () => {
    const newEvent = createMockEvent();
    newEvent.createdAt = new Date().toISOString();
    newEvent.status = Status.WAITING; // Starts waiting
    events.unshift(newEvent);
    
    // Simulate a run starting shortly after
    const newRun = createMockRun(newEvent);
    newRun.status = Status.RUNNING;
    newRun.startedAt = new Date().toISOString();
    delete newRun.completedAt;
    delete newRun.output;
    delete newRun.error;
    
    runs.unshift(newRun);
    
    return { event: newEvent, run: newRun };
  }
};
