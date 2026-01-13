import { Asset, Client, Deliverable } from '../types';

// --- MOCK DATA ---

const MOCK_CLIENTS: Client[] = [
  { id: 'c1', name: 'Acme Corp' },
  { id: 'c2', name: 'Nebula Studios' },
  { id: 'c3', name: 'Quantum Dynamics' },
];

const MOCK_DELIVERABLES: Deliverable[] = [
  { id: 'd1', clientId: 'c1', name: 'Q3 Marketing Campaign', dueDate: '2024-11-15', status: 'active' },
  { id: 'd2', clientId: 'c1', name: 'Website Rebrand Assets', dueDate: '2024-12-01', status: 'active' },
  { id: 'd3', clientId: 'c2', name: 'Teaser Trailer v1', dueDate: '2024-10-30', status: 'completed' },
  { id: 'd4', clientId: 'c3', name: 'Annual Report 2024', dueDate: '2025-01-20', status: 'active' },
];

const INITIAL_ASSETS: Asset[] = [
  {
    id: 'a1',
    filename: 'hero_banner_v1.jpg',
    type: 'image',
    url: 'https://picsum.photos/800/600?random=1',
    size: 2450000,
    uploadedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    clientId: 'c1',
    deliverableId: 'd1',
    previewUrl: 'https://picsum.photos/800/600?random=1',
    tags: ['banner', 'hero', 'campaign'],
    description: 'Main hero banner for the landing page.',
  },
  {
    id: 'a2',
    filename: 'logo_transparent.png',
    type: 'image',
    url: 'https://picsum.photos/400/400?random=2',
    size: 512000,
    uploadedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    clientId: 'c1',
    deliverableId: 'd2',
    previewUrl: 'https://picsum.photos/400/400?random=2',
    tags: ['logo', 'branding'],
    description: 'Transparent logo for web use.',
  },
  {
    id: 'a3',
    filename: 'product_teaser.mp4',
    type: 'video',
    url: 'https://example.com/video.mp4',
    size: 15000000,
    uploadedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    clientId: 'c2',
    deliverableId: 'd3',
    previewUrl: 'https://picsum.photos/800/450?random=3',
    tags: ['video', 'teaser', 'promo'],
    description: 'Product teaser video for social media.',
  },
  {
    id: 'a4',
    filename: 'data_visualization.pdf',
    type: 'document',
    url: 'https://example.com/report.pdf',
    size: 3200000,
    uploadedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    clientId: 'c3',
    previewUrl: undefined,
    tags: ['report', 'data', 'analytics'],
    description: 'Annual data visualization report.',
  },
];

// Simulated mutable store
let assets: Asset[] = [...INITIAL_ASSETS];

// --- MOCK BACKEND ---

export const backend = {
  getClients: async (): Promise<Client[]> => {
    await delay(200);
    return MOCK_CLIENTS;
  },

  getDeliverables: async (clientId?: string): Promise<Deliverable[]> => {
    await delay(200);
    if (clientId) {
      return MOCK_DELIVERABLES.filter(d => d.clientId === clientId);
    }
    return MOCK_DELIVERABLES;
  },

  getAssets: async (filter?: { clientId?: string; deliverableId?: string }): Promise<Asset[]> => {
    await delay(300);
    let result = [...assets];
    if (filter?.clientId) {
      result = result.filter(a => a.clientId === filter.clientId);
    }
    if (filter?.deliverableId) {
      result = result.filter(a => a.deliverableId === filter.deliverableId);
    }
    return result.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
  },

  getPresignedUrl: async (filename: string, mimeType: string): Promise<{ uploadUrl: string; key: string }> => {
    await delay(150);
    const key = `uploads/${Date.now()}_${filename.replace(/\s/g, '_')}`;
    return {
      uploadUrl: `https://mock-minio.local/bundlr-assets/${key}`,
      key
    };
  },

  uploadFileToMinIO: async (
    uploadUrl: string,
    file: File,
    onProgress: (progress: number) => void
  ): Promise<string> => {
    // Simulate upload progress
    for (let i = 0; i <= 100; i += 20) {
      await delay(100);
      onProgress(i);
    }

    // Return a mock preview URL (using picsum for images)
    const isImage = file.type.startsWith('image/');
    if (isImage) {
      return `https://picsum.photos/800/600?random=${Date.now()}`;
    }
    return uploadUrl; // For non-images, just return the URL
  },

  createAsset: async (
    file: File,
    key: string,
    previewUrl: string,
    metadata?: { clientId?: string; deliverableId?: string }
  ): Promise<Asset> => {
    await delay(200);

    const type = file.type.startsWith('image/')
      ? 'image'
      : file.type.startsWith('video/')
        ? 'video'
        : 'document';

    const newAsset: Asset = {
      id: `a${Date.now()}`,
      filename: file.name,
      type,
      url: previewUrl,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      clientId: metadata?.clientId,
      deliverableId: metadata?.deliverableId,
      previewUrl: previewUrl,
      tags: [],
      description: undefined,
    };

    assets.unshift(newAsset);
    return newAsset;
  },

  attachAssetToDeliverable: async (assetId: string, deliverableId: string): Promise<Asset> => {
    await delay(200);
    const index = assets.findIndex(a => a.id === assetId);
    if (index === -1) throw new Error('Asset not found');

    assets[index] = {
      ...assets[index],
      deliverableId,
    };
    return assets[index];
  },

  updateAssetMetadata: async (assetId: string, tags: string[], description: string): Promise<Asset> => {
    await delay(200);
    const index = assets.findIndex(a => a.id === assetId);
    if (index === -1) throw new Error('Asset not found');

    assets[index] = {
      ...assets[index],
      tags,
      description,
    };
    return assets[index];
  },
};

// Utility
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));