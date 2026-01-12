/**
 * Unified Inbox - Mock Service
 * 
 * Provides mock data for development without Supabase connection.
 */

import { IntakeItem, Priority, Status } from '../types';

const clients = [
    "Acme Corp",
    "Globex",
    "Soylent Corp",
    "Initech",
    "Massive Dynamic",
];

const titles = [
    "Urgent: Server outage in US-East",
    "Request for new employee laptop setup",
    "Software license renewal inquiry",
    "Bug report: Login page 404",
    "Feature Request: Dark mode for dashboard",
    "VPN Access issues for remote team",
    "Database performance degradation",
    "Security alert: Suspicious login attempts",
    "Printer network configuration",
    "API Rate limit increase request",
];

const generateMockData = (): IntakeItem[] => {
    return Array.from({ length: 15 }).map((_, i) => {
        const priority = Object.values(Priority)[Math.floor(Math.random() * 4)];
        const status = Object.values(Status)[Math.floor(Math.random() * 6)];
        const client = clients[Math.floor(Math.random() * clients.length)];
        const now = new Date();
        const slaOffset = Math.random() * 60 - 12;
        const slaDueAt = new Date(
            now.getTime() + slaOffset * 60 * 60 * 1000
        ).toISOString();

        return {
            id: `INT-${1000 + i}`,
            title: titles[i % titles.length],
            description: `Detailed description for ${titles[i % titles.length]}. This issue is affecting productivity and requires attention.`,
            client,
            requestor: `user${i}@${client.toLowerCase().replace(" ", "")}.com`,
            priority,
            status,
            createdAt: new Date().toISOString(),
            slaDueAt,
            assignee: Math.random() > 0.6 ? "Jane Doe" : undefined,
            tags: ["IT", "Ops"],
        };
    });
};

// Store mock data in module scope
let mockItems = generateMockData();

export const MockInboxService = {
    getAll: async (): Promise<IntakeItem[]> => {
        return [...mockItems];
    },

    getById: async (id: string): Promise<IntakeItem | null> => {
        return mockItems.find(item => item.id === id) || null;
    },

    create: async (data: {
        title: string;
        description: string;
        client: string;
        requestor: string;
        priority: Priority;
    }): Promise<IntakeItem> => {
        const newItem: IntakeItem = {
            id: `INT-${1000 + mockItems.length}`,
            title: data.title,
            description: data.description || "No description provided.",
            client: data.client,
            requestor: data.requestor || "unknown@example.com",
            priority: data.priority,
            status: Status.NEW,
            createdAt: new Date().toISOString(),
            slaDueAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            assignee: undefined,
            tags: [],
        };

        mockItems = [newItem, ...mockItems];
        return newItem;
    },

    update: async (id: string, updates: Partial<IntakeItem>): Promise<IntakeItem> => {
        const index = mockItems.findIndex(item => item.id === id);
        if (index === -1) throw new Error('Item not found');

        mockItems[index] = { ...mockItems[index], ...updates };
        return mockItems[index];
    },

    delete: async (id: string): Promise<void> => {
        mockItems = mockItems.filter(item => item.id !== id);
    },

    getClients: async (): Promise<string[]> => {
        return clients;
    },
};
