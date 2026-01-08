import { ApprovalRequest, ApprovalStatus, ApprovalEvent, Stats } from '../types';
import { INITIAL_APPROVALS } from './mockData';

const STORAGE_KEY = 'zenapprove_data';

// Helper to simulate delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const ApprovalService = {
  // Initialize storage
  init: () => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_APPROVALS));
    }
  },

  getAll: async (): Promise<ApprovalRequest[]> => {
    await delay(300); // Simulate network
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  getById: async (id: string): Promise<ApprovalRequest | undefined> => {
    await delay(200);
    const all = await ApprovalService.getAll();
    return all.find(a => a.id === id);
  },

  getByToken: async (token: string): Promise<ApprovalRequest | undefined> => {
    await delay(400); // Slower for external access simulation
    const all = await ApprovalService.getAll();
    return all.find(a => a.token === token);
  },

  updateStatus: async (id: string, status: ApprovalStatus, comment: string, actor: string): Promise<ApprovalRequest> => {
    const all = await ApprovalService.getAll();
    const index = all.findIndex(a => a.id === id);
    if (index === -1) throw new Error("Approval not found");

    const approval = all[index];
    
    // Add event
    const newEvent: ApprovalEvent = {
      id: `evt-${Date.now()}`,
      type: 'STATUS_CHANGED',
      timestamp: new Date().toISOString(),
      description: `Status changed to ${status}${comment ? `: "${comment}"` : ''}`,
      actor
    };

    const updatedApproval = {
      ...approval,
      status,
      history: [newEvent, ...approval.history] // Newest first
    };

    all[index] = updatedApproval;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    return updatedApproval;
  },

  addComment: async (id: string, comment: string, actor: string): Promise<ApprovalRequest> => {
     const all = await ApprovalService.getAll();
    const index = all.findIndex(a => a.id === id);
    if (index === -1) throw new Error("Approval not found");

    const approval = all[index];
    
    const newEvent: ApprovalEvent = {
      id: `evt-${Date.now()}`,
      type: 'COMMENT_ADDED',
      timestamp: new Date().toISOString(),
      description: `Comment: ${comment}`,
      actor
    };

    const updatedApproval = {
      ...approval,
      history: [newEvent, ...approval.history]
    };

    all[index] = updatedApproval;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    return updatedApproval;
  },

  sendReminder: async (id: string): Promise<void> => {
    await delay(500);
    const all = await ApprovalService.getAll();
    const index = all.findIndex(a => a.id === id);
    if (index === -1) throw new Error("Approval not found");
    
    const approval = all[index];
    const newEvent: ApprovalEvent = {
        id: `evt-${Date.now()}`,
        type: 'REMINDER_SENT',
        timestamp: new Date().toISOString(),
        description: 'Automated reminder email sent to client.',
        actor: 'System'
    };
    
    const updatedApproval = {
        ...approval,
        history: [newEvent, ...approval.history]
    };
    
    all[index] = updatedApproval;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  },

  getStats: async (): Promise<Stats> => {
    const all = await ApprovalService.getAll();
    return {
      total: all.length,
      pending: all.filter(a => a.status === ApprovalStatus.PENDING).length,
      approved: all.filter(a => a.status === ApprovalStatus.APPROVED).length,
      rejected: all.filter(a => a.status === ApprovalStatus.REJECTED).length,
    };
  }
};

// Initialize on load
ApprovalService.init();