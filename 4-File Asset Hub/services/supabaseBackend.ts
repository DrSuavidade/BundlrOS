/**
 * File Asset Hub - Supabase Service
 * 
 * Provides Supabase-backed implementation for file asset management.
 * Uses clients and deliverables tables from the database.
 */

import {
    ClientsApi,
    DeliverablesApi,
    type Client as SupabaseClient,
    type Deliverable as SupabaseDeliverable,
} from '@bundlros/supabase';
import { Asset, AssetType, Client, Deliverable, ProcessingStatus } from '../types';

// Map Supabase Client to local Client type
const mapClient = (client: SupabaseClient): Client => ({
    id: client.id,
    name: client.name,
});

// Map Supabase Deliverable to local Deliverable type
// Note: Supabase deliverables link to projects, not clients directly
const mapDeliverable = (deliverable: SupabaseDeliverable): Deliverable => ({
    id: deliverable.id,
    clientId: deliverable.project_id || '', // Project ID serves as parent
    name: deliverable.title, // Supabase uses 'title' not 'name'
    dueDate: deliverable.due_date || new Date().toISOString(),
    status: mapDeliverableStatus(deliverable.status),
});

// Map Supabase deliverable status to local status
const mapDeliverableStatus = (status: string): 'active' | 'archived' | 'completed' | 'cancelled' => {
    switch (status) {
        case 'published':
        case 'approved':
            return 'completed';
        case 'archived':
            return 'archived';
        case 'draft':
        case 'in_progress':
        case 'awaiting_approval':
        case 'in_qa':
        case 'qa_failed':
        default:
            return 'active';
    }
};

// Note: Assets table doesn't exist in Supabase yet, we'll use mock for now
// but keep clients and deliverables from database

class SupabaseAssetService {
    private assets: Asset[] = []; // In-memory until we have assets table

    // === Clients from Supabase ===
    async getClients(): Promise<Client[]> {
        try {
            const clients = await ClientsApi.getAll();
            return clients.map(mapClient);
        } catch (error) {
            console.error('[AssetHub] Error fetching clients:', error);
            return [];
        }
    }

    // === Deliverables from Supabase ===
    // Note: In this module, clientId actually maps to projectId for filtering
    async getDeliverables(clientId?: string): Promise<Deliverable[]> {
        try {
            let deliverables: SupabaseDeliverable[];
            if (clientId) {
                // clientId here is treated as projectId for filtering
                deliverables = await DeliverablesApi.getByProjectId(clientId);
            } else {
                deliverables = await DeliverablesApi.getAll();
            }
            return deliverables.map(mapDeliverable);
        } catch (error) {
            console.error('[AssetHub] Error fetching deliverables:', error);
            return [];
        }
    }

    // === Assets (in-memory until we have assets table) ===
    async getAssets(filter?: { clientId?: string; deliverableId?: string }): Promise<Asset[]> {
        let result = [...this.assets];
        if (filter?.clientId) {
            result = result.filter(a => a.clientId === filter.clientId);
        }
        if (filter?.deliverableId) {
            result = result.filter(a => a.deliverableId === filter.deliverableId);
        }
        return result.sort((a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
    }

    async getPresignedUrl(filename: string, _mimeType: string): Promise<{ uploadUrl: string; key: string }> {
        // In production, this would call Supabase Storage for a presigned URL
        return {
            uploadUrl: `https://mock-storage.bundlros.io/upload/${Date.now()}_${filename}`,
            key: `${Date.now()}_${filename}`
        };
    }

    async uploadFileToMinIO(
        _uploadUrl: string,
        file: File,
        onProgress: (progress: number) => void
    ): Promise<string> {
        // Simulate upload progress
        const totalSteps = 10;
        for (let i = 1; i <= totalSteps; i++) {
            await new Promise(resolve => setTimeout(resolve, 200));
            onProgress(i * 10);
        }
        // Return a local object URL for preview
        return URL.createObjectURL(file);
    }

    async createAsset(
        file: File,
        key: string,
        previewUrl: string,
        metadata?: { clientId?: string; deliverableId?: string }
    ): Promise<Asset> {
        const type = file.type.startsWith('image/')
            ? AssetType.IMAGE
            : file.type.startsWith('video/')
                ? AssetType.VIDEO
                : AssetType.DOCUMENT;

        const newAsset: Asset = {
            id: crypto.randomUUID(),
            filename: file.name,
            type,
            mimeType: file.type,
            size: file.size,
            uploadedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            status: ProcessingStatus.READY,
            clientId: metadata?.clientId,
            deliverableId: metadata?.deliverableId,
            currentVersion: 1,
            checksum: crypto.randomUUID().slice(0, 16),
            previewUrl,
            tags: [],
            versions: [{
                version: 1,
                createdAt: new Date().toISOString(),
                size: file.size,
                checksum: crypto.randomUUID().slice(0, 16),
                url: previewUrl
            }]
        };

        // Check for versioning
        if (metadata?.deliverableId) {
            const existing = this.assets.find(a =>
                a.deliverableId === metadata.deliverableId &&
                a.filename === file.name
            );

            if (existing) {
                const newVersionNum = existing.currentVersion + 1;
                existing.currentVersion = newVersionNum;
                existing.updatedAt = new Date().toISOString();
                existing.size = file.size;
                existing.previewUrl = previewUrl;
                existing.versions.unshift({
                    version: newVersionNum,
                    createdAt: new Date().toISOString(),
                    size: file.size,
                    checksum: crypto.randomUUID().slice(0, 16),
                    url: previewUrl
                });
                return existing;
            }
        }

        this.assets.unshift(newAsset);
        return newAsset;
    }

    async attachAssetToDeliverable(assetId: string, deliverableId: string): Promise<Asset> {
        const asset = this.assets.find(a => a.id === assetId);
        if (!asset) throw new Error("Asset not found");

        asset.deliverableId = deliverableId;

        // Auto-assign client based on deliverable
        const deliverables = await this.getDeliverables();
        const deliverable = deliverables.find(d => d.id === deliverableId);
        if (deliverable && !asset.clientId) {
            asset.clientId = deliverable.clientId;
        }

        asset.updatedAt = new Date().toISOString();
        return { ...asset };
    }

    async updateAssetMetadata(assetId: string, tags: string[], description: string): Promise<Asset> {
        const asset = this.assets.find(a => a.id === assetId);
        if (!asset) throw new Error("Asset not found");

        asset.tags = tags;
        asset.description = description;
        return { ...asset };
    }
}

export const supabaseBackend = new SupabaseAssetService();
