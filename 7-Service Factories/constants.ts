import { PipelineTemplate, DeliverableType, StageTemplate } from './types';

export const PIPELINE_TEMPLATES: PipelineTemplate[] = [
  {
    id: 'std-production-v1',
    name: 'Standard Production Line',
    stages: [
      {
        id: 'stage-raw',
        name: 'Raw Materials',
        order: 0,
        requiredDeliverables: ['bom-001', 'mat-check-001']
      },
      {
        id: 'stage-assembly',
        name: 'Assembly',
        order: 1,
        requiredDeliverables: ['assem-log-001']
      },
      {
        id: 'stage-qa',
        name: 'Quality Assurance',
        order: 2,
        requiredDeliverables: ['qa-cert-001']
      },
      {
        id: 'stage-shipping',
        name: 'Logistics & Shipping',
        order: 3,
        requiredDeliverables: ['ship-manifest-001']
      },
      {
        id: 'stage-done',
        name: 'Contract Fulfillment',
        order: 4,
        requiredDeliverables: []
      }
    ]
  },
  {
    id: 'fast-track-v2',
    name: 'Fast Track Prototype',
    stages: [
      {
        id: 'stage-design',
        name: 'Design Review',
        order: 0,
        requiredDeliverables: ['design-doc']
      },
      {
        id: 'stage-fab',
        name: 'Fabrication',
        order: 1,
        requiredDeliverables: ['proto-unit']
      },
      {
        id: 'stage-delivery',
        name: 'Delivery',
        order: 2,
        requiredDeliverables: []
      }
    ]
  }
];

export const INITIAL_DELIVERABLES_CONFIG: Record<string, Array<{name: string, type: DeliverableType, templateId: string}>> = {
  'std-production-v1': [
    { name: 'Bill of Materials', type: DeliverableType.DOCUMENT, templateId: 'bom-001' },
    { name: 'Material Inspection', type: DeliverableType.COMPONENT, templateId: 'mat-check-001' },
    { name: 'Assembly Log', type: DeliverableType.DOCUMENT, templateId: 'assem-log-001' },
    { name: 'QA Certification', type: DeliverableType.DOCUMENT, templateId: 'qa-cert-001' },
    { name: 'Shipping Manifest', type: DeliverableType.DOCUMENT, templateId: 'ship-manifest-001' },
  ],
  'fast-track-v2': [
    { name: 'Design Spec', type: DeliverableType.DOCUMENT, templateId: 'design-doc' },
    { name: 'Prototype Unit', type: DeliverableType.COMPONENT, templateId: 'proto-unit' },
  ]
};
