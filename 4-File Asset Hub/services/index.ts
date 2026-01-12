/**
 * File Asset Hub - Service Index
 * 
 * Environment-aware service that switches between mock and Supabase backends.
 * Set VITE_USE_MOCK_BACKEND=true to use mock data.
 */

import { backend as mockBackend } from './mockBackend';
import { supabaseBackend } from './supabaseBackend';
import type { Asset, Client, Deliverable } from '../types';

// Define the backend interface
interface IAssetBackend {
    getClients(): Promise<Client[]>;
    getDeliverables(clientId?: string): Promise<Deliverable[]>;
    getAssets(filter?: { clientId?: string; deliverableId?: string }): Promise<Asset[]>;
    getPresignedUrl(filename: string, mimeType: string): Promise<{ uploadUrl: string; key: string }>;
    uploadFileToMinIO(uploadUrl: string, file: File, onProgress: (progress: number) => void): Promise<string>;
    createAsset(file: File, key: string, previewUrl: string, metadata?: { clientId?: string; deliverableId?: string }): Promise<Asset>;
    attachAssetToDeliverable(assetId: string, deliverableId: string): Promise<Asset>;
    updateAssetMetadata(assetId: string, tags: string[], description: string): Promise<Asset>;
}

// Check if we should use mock backend
const useMockBackend = import.meta.env.VITE_USE_MOCK_BACKEND === 'true';

// Export the appropriate backend based on environment
export const backend: IAssetBackend = useMockBackend ? mockBackend : supabaseBackend;

// Also export for direct access if needed
export { mockBackend, supabaseBackend };

console.log(`[AssetHub] Using ${useMockBackend ? 'MOCK' : 'SUPABASE'} backend`);
