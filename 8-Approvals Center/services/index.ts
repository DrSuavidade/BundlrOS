/**
 * Approvals Center - Service Index
 * 
 * Environment-aware service that switches between mock and Supabase backends.
 * Set VITE_USE_MOCK_BACKEND=true to use mock data.
 */

import { ApprovalService as MockApprovalService } from './approvalService';
import { SupabaseApprovalService } from './supabaseService';
import type { ApprovalRequest, ApprovalStatus, Stats } from '../types';

// Check if we should use mock backend
const useMockBackend = import.meta.env.VITE_USE_MOCK_BACKEND === 'true';

// Unified service interface
interface IApprovalService {
    init: () => void;
    getCurrentUser: () => Promise<any>;
    getAll: () => Promise<ApprovalRequest[]>;
    getById: (id: string) => Promise<ApprovalRequest | undefined>;
    getByToken: (token: string) => Promise<ApprovalRequest | undefined>;
    updateStatus: (id: string, status: ApprovalStatus, comment: string, actor: string) => Promise<ApprovalRequest>;
    addComment: (id: string, comment: string, actor: string) => Promise<ApprovalRequest>;
    sendReminder: (id: string) => Promise<void>;
    getStats: () => Promise<Stats>;
}

// Export the appropriate service based on environment
export const ApprovalService: IApprovalService = useMockBackend
    ? MockApprovalService
    : SupabaseApprovalService;

// Initialize the service
ApprovalService.init();

// Also export for direct access if needed
export { MockApprovalService, SupabaseApprovalService };

console.log(`[Approvals] Using ${useMockBackend ? 'MOCK' : 'SUPABASE'} backend`);
