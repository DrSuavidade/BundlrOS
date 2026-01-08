import { Factory, Status, LogEntry, Deliverable, DeliverableType } from '../types';
import { PIPELINE_TEMPLATES, INITIAL_DELIVERABLES_CONFIG } from '../constants';

export const generateId = () => Math.random().toString(36).substr(2, 9);

export const createFactory = (contractId: string, clientName: string, templateId: string): Factory => {
  const template = PIPELINE_TEMPLATES.find(t => t.id === templateId);
  if (!template) throw new Error('Template not found');

  const initialDeliverablesConfig = INITIAL_DELIVERABLES_CONFIG[templateId] || [];
  
  const deliverables: Deliverable[] = initialDeliverablesConfig.map(d => ({
    id: d.templateId, // Using template ID as instance ID for simplicity in this demo, in real app would be unique
    name: d.name,
    type: d.type,
    status: 'PENDING'
  }));

  const initialLog: LogEntry = {
    id: generateId(),
    timestamp: new Date().toISOString(),
    event: 'BOOTSTRAP',
    message: `Factory bootstrapped for ${clientName} using template ${template.name}`
  };

  return {
    id: generateId(),
    contractId,
    clientName,
    templateId,
    currentStageId: template.stages[0].id,
    status: Status.ACTIVE,
    deliverables,
    blockers: [],
    logs: [initialLog],
    startedAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString()
  };
};

export const checkBlockers = (factory: Factory): string[] => {
  const template = PIPELINE_TEMPLATES.find(t => t.id === factory.templateId);
  if (!template) return ['Configuration Error: Template Missing'];

  const currentStageIndex = template.stages.findIndex(s => s.id === factory.currentStageId);
  const currentStage = template.stages[currentStageIndex];

  if (!currentStage) return ['Configuration Error: Stage Missing'];

  const blockers: string[] = [];

  // Rule: All required deliverables for this stage must be READY or APPROVED
  const missingDeliverables = currentStage.requiredDeliverables.filter(reqId => {
    const d = factory.deliverables.find(del => del.id === reqId);
    return !d || d.status === 'PENDING';
  });

  if (missingDeliverables.length > 0) {
    blockers.push(`Missing deliverables: ${missingDeliverables.join(', ')}`);
  }

  // Random Simulated External Blockers (e.g. Machine Breakdown)
  // In a real app, this would come from external sensors/APIs
  if (Math.random() > 0.95) {
     blockers.push('External: Supply Chain Delay Detected');
  }

  return blockers;
};

export const advanceStage = (factory: Factory): Factory => {
  const template = PIPELINE_TEMPLATES.find(t => t.id === factory.templateId);
  if (!template) return factory;

  const currentStageIndex = template.stages.findIndex(s => s.id === factory.currentStageId);
  
  // Check if already done
  if (currentStageIndex === -1 || currentStageIndex === template.stages.length - 1) {
    return {
      ...factory,
      status: Status.COMPLETED,
      logs: [
        {
          id: generateId(),
          timestamp: new Date().toISOString(),
          event: 'ADVANCE',
          message: 'Pipeline completed successfully.'
        },
        ...factory.logs
      ]
    };
  }

  // Check blockers
  const blockers = checkBlockers(factory);
  if (blockers.length > 0) {
    return {
      ...factory,
      status: Status.BLOCKED,
      blockers,
      logs: [
        {
          id: generateId(),
          timestamp: new Date().toISOString(),
          event: 'BLOCK',
          message: `Cannot advance: ${blockers.join('; ')}`
        },
        ...factory.logs
      ]
    };
  }

  const nextStage = template.stages[currentStageIndex + 1];

  return {
    ...factory,
    currentStageId: nextStage.id,
    status: Status.ACTIVE,
    blockers: [],
    lastUpdated: new Date().toISOString(),
    logs: [
      {
        id: generateId(),
        timestamp: new Date().toISOString(),
        event: 'ADVANCE',
        message: `Advanced to stage: ${nextStage.name}`
      },
      ...factory.logs
    ]
  };
};

export const updateDeliverableStatus = (factory: Factory, deliverableId: string, status: 'PENDING' | 'READY' | 'APPROVED'): Factory => {
  const newDeliverables = factory.deliverables.map(d => 
    d.id === deliverableId ? { ...d, status } : d
  );

  return {
    ...factory,
    deliverables: newDeliverables,
    // Re-evaluate blockers immediately upon update
    status: Status.ACTIVE, // Optimistically reset to active to clear old blocks, checkBlockers will re-block if needed on next tick or check
    blockers: [] 
  };
};
