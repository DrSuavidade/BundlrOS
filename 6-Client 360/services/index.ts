/**
 * Client 360 - Service Index
 * 
 * Environment-aware service that switches between mock and Supabase backends.
 * Set VITE_USE_MOCK_BACKEND=true to use mock data.
 */

import { fetchClientData as mockFetchClientData, MOCK_CLIENT } from './mockData';
import { Client360Service } from './supabaseService';
import type { ClientData } from '../types';

// Check if we should use mock backend
const useMockBackend = import.meta.env.VITE_USE_MOCK_BACKEND === 'true';

// Unified service interface
interface IClient360Service {
    fetchClientData: (clientId: string) => Promise<ClientData | null>;
    getClientList: () => Promise<Array<{ id: string; name: string }>>;
}

// Mock service wrapper
const MockClient360Service: IClient360Service = {
    fetchClientData: mockFetchClientData,
    getClientList: async () => [{ id: MOCK_CLIENT.id, name: MOCK_CLIENT.name }],
};

// Export the appropriate service based on environment
export const ClientService: IClient360Service = useMockBackend
    ? MockClient360Service
    : Client360Service;

// Named export for backward compatibility
export const fetchClientData = ClientService.fetchClientData;

// Also export for direct access if needed
export { MockClient360Service, Client360Service };

console.log(`[Client360] Using ${useMockBackend ? 'MOCK' : 'SUPABASE'} backend`);
