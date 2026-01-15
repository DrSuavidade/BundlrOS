import { Factory, Status, LogEntry, Deliverable, DeliverableType } from '../types';
import { PIPELINE_TEMPLATES, DELIVERABLES_LIBRARY } from '../constants';
import { DeliverablesApi, ProjectsApi } from '../../lib/supabase/api';
import { supabase } from '../../lib/supabase/client';

export const generateId = () => Math.random().toString(36).substr(2, 9);

export const createFactory = (contractId: string, clientName: string, templateId: string): Factory => {
  // Handle 'null' template case (e.g. from automatic contract creation)
  if (templateId === 'null') {
    return {
      id: generateId(),
      contractId,
      clientName,
      templateId: 'null',
      currentStageId: '', // No stage yet
      status: Status.IDLE,
      deliverables: [],
      blockers: [],
      logs: [
        {
          id: generateId(),
          timestamp: new Date().toISOString(),
          event: 'BOOTSTRAP',
          message: `Factory initialized pending template selection.`
        }
      ],
      startedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };
  }

  const template = PIPELINE_TEMPLATES.find(t => t.id === templateId);
  if (!template) throw new Error(`Template not found: ${templateId}`);

  // Gather unique deliverables from all stages
  const requiredIds = Array.from(new Set(template.stages.flatMap(s => s.requiredDeliverables)));

  const deliverables: Deliverable[] = requiredIds.map(reqId => {
    const def = DELIVERABLES_LIBRARY[reqId];
    return {
      id: reqId,
      name: def ? def.name : reqId,
      type: def ? def.type : DeliverableType.DOCUMENT,
      status: 'PENDING'
    };
  });

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

export const hydrateFactory = (factory: Factory, templateId: string): Factory => {
  const fresh = createFactory(factory.contractId, factory.clientName, templateId);
  return {
    ...fresh,
    id: factory.id, // Preserve ID
    logs: [
      ...factory.logs,
      {
        id: generateId(),
        timestamp: new Date().toISOString(),
        event: 'UPDATE',
        message: `Template applied: ${templateId}`
      }
    ]
  };
};

export const checkBlockers = (factory: Factory): string[] => {
  const template = PIPELINE_TEMPLATES.find(t => t.id === factory.templateId);
  if (!template) {
    if (factory.templateId === 'null') return ['Pending Template Selection'];
    return ['Configuration Error: Template Missing'];
  }

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
  if (Math.random() > 0.99) {
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

const getDeliverableTypeFromTemplate = (templateId: string): 'document' | 'design' | 'software' | 'report' | 'video' => {
  const t = templateId.toUpperCase();
  if (t.includes('WEBSITE') || t.includes('AI') || t.includes('AUTOMATION') || t.includes('CHATBOT') || t.includes('WEB')) return 'software';
  if (t.includes('DESIGN') || t.includes('ASSETS') || t.includes('CONTENT') || t.includes('CREATIVE')) return 'design';
  if (t.includes('REPORT') || t.includes('AUDIT')) return 'report';
  return 'document';
};

export const createFinalDeliverable = async (factory: Factory): Promise<Factory> => {
  const type = getDeliverableTypeFromTemplate(factory.templateId);

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 7);

  try {

    let projectId = factory.contractId;

    // 1. Try to find existing project for this contract
    const { data: existingProject } = await supabase
      .from('projects')
      .select('id')
      .eq('contract_id', factory.contractId)
      .single();

    if (existingProject) {
      projectId = existingProject.id;
    } else {
      // 2. Fallback: Create project if it doesn't exist
      const { data: contract } = await supabase
        .from('contracts')
        .select('client_id')
        .eq('id', factory.contractId)
        .single();

      if (contract && contract.client_id) {
        const project = await ProjectsApi.create({
          client_id: contract.client_id,
          contract_id: factory.contractId,
          name: `${factory.clientName} - ${factory.templateId}`,
          status: 'active',
          external_tool: null,
          external_id: null
        });
        projectId = project.id;
      } else {
        console.warn("Could not resolve contract to project. attempting to use contractId as project_id directly.");
      }
    }

    await DeliverablesApi.create({
      project_id: projectId,
      title: `${factory.clientName}-${factory.templateId}`,
      type: type,
      status: 'awaiting_approval',
      version: 'v1.0',
      due_date: dueDate.toISOString(),
    });

    return {
      ...factory,
      status: Status.DELIVERED,
      logs: [
        {
          id: generateId(),
          timestamp: new Date().toISOString(),
          event: 'ADVANCE',
          message: `Pipeline completed. Created deliverable: ${factory.clientName}-${factory.templateId}`
        },
        ...factory.logs
      ]
    };
  } catch (e) {
    const errorMessage = (e as Error).message || String(e);
    console.error("Failed to create deliverable", e);
    return {
      ...factory,
      status: Status.BLOCKED,
      blockers: [`Failed to create deliverable: ${errorMessage}`],
      logs: [
        {
          id: generateId(),
          timestamp: new Date().toISOString(),
          event: 'BLOCK',
          message: `Failed to create deliverable: ${errorMessage}`
        },
        ...factory.logs
      ]
    };
  }
};
