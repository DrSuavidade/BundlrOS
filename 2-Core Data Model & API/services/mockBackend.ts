import { 
  Client, Contact, ServiceContract, Project, Deliverable, 
  DeliverableStatus, BaseEntity, SystemEvent 
} from '../types';

// Helper to generate IDs
const generateId = () => Math.random().toString(36).substr(2, 9);
const now = () => new Date().toISOString();

// Initial Data Seeding
const seedData = () => {
  if (localStorage.getItem('nexus_initialized')) return;

  const client1: Client = {
    id: 'cli_001',
    name: 'Acme Corp',
    code: 'ACM',
    industry: 'Technology',
    status: 'active',
    created_at: now(),
    updated_at: now(),
    created_by: 'admin'
  };

  const client2: Client = {
    id: 'cli_002',
    name: 'Globex Inc',
    code: 'GLB',
    industry: 'Manufacturing',
    status: 'active',
    created_at: now(),
    updated_at: now(),
    created_by: 'admin'
  };

  const contract1: ServiceContract = {
    id: 'con_001',
    client_id: client1.id,
    title: 'Q1 Development Retainer',
    start_date: '2024-01-01',
    end_date: '2024-03-31',
    value: 50000,
    status: 'active',
    created_at: now(),
    updated_at: now(),
    created_by: 'admin'
  };

  const project1: Project = {
    id: 'prj_001',
    client_id: client1.id,
    contract_id: contract1.id,
    name: 'Website Redesign',
    external_tool: 'Plane' as any,
    external_id: 'PRJ-12',
    status: 'active',
    created_at: now(),
    updated_at: now(),
    created_by: 'admin'
  };

  const deliverable1: Deliverable = {
    id: 'del_001',
    project_id: project1.id,
    title: 'Homepage Mockups',
    type: 'design',
    status: DeliverableStatus.DRAFT,
    version: 'v0.1',
    due_date: '2024-02-15',
    created_at: now(),
    updated_at: now(),
    created_by: 'admin'
  };
  
  const deliverable2: Deliverable = {
    id: 'del_002',
    project_id: project1.id,
    title: 'Backend API Spec',
    type: 'document',
    status: DeliverableStatus.APPROVED,
    version: 'v1.0',
    due_date: '2024-02-10',
    created_at: now(),
    updated_at: now(),
    created_by: 'admin'
  };

  localStorage.setItem('nexus_clients', JSON.stringify([client1, client2]));
  localStorage.setItem('nexus_contracts', JSON.stringify([contract1]));
  localStorage.setItem('nexus_projects', JSON.stringify([project1]));
  localStorage.setItem('nexus_deliverables', JSON.stringify([deliverable1, deliverable2]));
  localStorage.setItem('nexus_contacts', JSON.stringify([]));
  localStorage.setItem('nexus_events', JSON.stringify([]));
  localStorage.setItem('nexus_initialized', 'true');
};

// Generic CRUD helpers
const getCollection = <T>(key: string): T[] => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

const saveCollection = <T>(key: string, data: T[]) => {
  localStorage.setItem(key, JSON.stringify(data));
};

const logEvent = (type: string, entityId: string, details: string) => {
  const events = getCollection<SystemEvent>('nexus_events');
  const newEvent: SystemEvent = {
    id: generateId(),
    type,
    entity_id: entityId,
    timestamp: now(),
    details
  };
  saveCollection('nexus_events', [newEvent, ...events].slice(0, 100)); // Keep last 100
};

// --- API Simulation ---

export const MockAPI = {
  init: () => seedData(),

  // Clients
  getClients: async (): Promise<Client[]> => {
    return getCollection<Client>('nexus_clients');
  },
  createClient: async (data: Omit<Client, keyof BaseEntity>): Promise<Client> => {
    const clients = getCollection<Client>('nexus_clients');
    const newClient: Client = {
      ...data,
      id: `cli_${generateId()}`,
      created_at: now(),
      updated_at: now(),
      created_by: 'user' // mocking current user
    };
    saveCollection('nexus_clients', [...clients, newClient]);
    logEvent('client.created', newClient.id, `Created client ${newClient.name}`);
    return newClient;
  },

  // Contracts
  getContracts: async (): Promise<ServiceContract[]> => {
    return getCollection<ServiceContract>('nexus_contracts');
  },
  
  // Projects
  getProjects: async (): Promise<Project[]> => {
    return getCollection<Project>('nexus_projects');
  },

  // Deliverables
  getDeliverables: async (): Promise<Deliverable[]> => {
    return getCollection<Deliverable>('nexus_deliverables');
  },
  
  createDeliverable: async (data: Omit<Deliverable, keyof BaseEntity>): Promise<Deliverable> => {
    const items = getCollection<Deliverable>('nexus_deliverables');
    const newItem: Deliverable = {
      ...data,
      id: `del_${generateId()}`,
      created_at: now(),
      updated_at: now(),
      created_by: 'user'
    };
    saveCollection('nexus_deliverables', [...items, newItem]);
    logEvent('deliverable.created', newItem.id, `Created ${newItem.title}`);
    return newItem;
  },

  // State Machine Logic
  transitionDeliverable: async (id: string, newStatus: DeliverableStatus): Promise<Deliverable> => {
    const items = getCollection<Deliverable>('nexus_deliverables');
    const index = items.findIndex(i => i.id === id);
    if (index === -1) throw new Error('Item not found');

    const item = items[index];
    const oldStatus = item.status;
    
    // In a real app, we would validate the transition here strictly
    // For this UI demo, we trust the UI passed valid next states, but we'll log it.

    const updatedItem = {
      ...item,
      status: newStatus,
      updated_at: now()
    };
    
    items[index] = updatedItem;
    saveCollection('nexus_deliverables', items);
    logEvent('deliverable.status_changed', id, `Changed from ${oldStatus} to ${newStatus}`);
    return updatedItem;
  },
  
  getEvents: async (): Promise<SystemEvent[]> => {
    return getCollection<SystemEvent>('nexus_events');
  }
};