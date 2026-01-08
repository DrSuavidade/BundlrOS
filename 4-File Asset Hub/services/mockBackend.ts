import { Asset, AssetType, AssetVersion, Client, Deliverable, ProcessingStatus } from '../types';

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
    type: AssetType.IMAGE,
    mimeType: 'image/jpeg',
    size: 2450000,
    uploadedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    status: ProcessingStatus.READY,
    clientId: 'c1',
    deliverableId: 'd1',
    currentVersion: 1,
    checksum: 'a1b2c3d4',
    previewUrl: 'https://picsum.photos/800/600?random=1',
    tags: ['banner', 'hero', 'campaign'],
    description: 'Main hero banner for the landing page.',
    versions: [
      { version: 1, createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), size: 2450000, checksum: 'a1b2c3d4', url: 'https://picsum.photos/800/600?random=1' }
    ]
  },
  {
    id: 'a2',
    filename: 'logo_transparent.png',
    type: AssetType.IMAGE,
    mimeType: 'image/png',
    size: 512000,
    uploadedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    status: ProcessingStatus.READY,
    clientId: 'c1',
    deliverableId: 'd2',
    currentVersion: 2,
    checksum: 'e5f6g7h8',
    previewUrl: 'https://picsum.photos/400/400?random=2',
    tags: ['logo', 'transparent'],
    description: 'Official logo with transparent background.',
    versions: [
      { version: 1, createdAt: new Date(Date.now() - 86400000 * 10).toISOString(), size: 480000, checksum: 'old_checksum', url: 'https://picsum.photos/400/400?random=20' },
      { version: 2, createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), size: 512000, checksum: 'e5f6g7h8', url: 'https://picsum.photos/400/400?random=2' }
    ]
  },
  {
    id: 'a3',
    filename: 'concept_art_final.png',
    type: AssetType.IMAGE,
    mimeType: 'image/png',
    size: 15400000,
    uploadedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: ProcessingStatus.READY,
    clientId: 'c2',
    deliverableId: 'd3',
    currentVersion: 1,
    checksum: 'i9j0k1l2',
    previewUrl: 'https://picsum.photos/1920/1080?random=3',
    tags: ['concept', 'art', 'scifi'],
    versions: [
        { version: 1, createdAt: new Date().toISOString(), size: 15400000, checksum: 'i9j0k1l2', url: 'https://picsum.photos/1920/1080?random=3' }
    ]
  }
];

// --- SERVICE ---

class MockBackendService {
  private assets: Asset[] = [...INITIAL_ASSETS];
  private clients: Client[] = [...MOCK_CLIENTS];
  private deliverables: Deliverable[] = [...MOCK_DELIVERABLES];

  // Helper to simulate network latency
  private async delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getClients(): Promise<Client[]> {
    await this.delay(300);
    return this.clients;
  }

  async getDeliverables(clientId?: string): Promise<Deliverable[]> {
    await this.delay(300);
    if (clientId) {
      return this.deliverables.filter(d => d.clientId === clientId);
    }
    return this.deliverables;
  }

  async getAssets(filter?: { clientId?: string; deliverableId?: string }): Promise<Asset[]> {
    await this.delay(500); // Simulate query time
    let result = this.assets;
    if (filter?.clientId) {
      result = result.filter(a => a.clientId === filter.clientId);
    }
    if (filter?.deliverableId) {
      result = result.filter(a => a.deliverableId === filter.deliverableId);
    }
    // Sort by newest
    return result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  // Simulate obtaining a presigned URL (S3/MinIO pattern)
  async getPresignedUrl(filename: string, mimeType: string): Promise<{ uploadUrl: string; key: string }> {
    await this.delay(600);
    return {
      uploadUrl: `https://mock-minio.lumina.io/upload/${Date.now()}_${filename}`,
      key: `${Date.now()}_${filename}`
    };
  }

  // Simulate the actual PUT request to MinIO
  async uploadFileToMinIO(uploadUrl: string, file: File, onProgress: (progress: number) => void): Promise<string> {
    // In a real app, this would be fetch(uploadUrl, { method: 'PUT', body: file })
    const totalSteps = 10;
    for (let i = 1; i <= totalSteps; i++) {
      await this.delay(200); // Simulate upload chunk
      onProgress(i * 10);
    }
    // Return a local object URL to visualize the upload immediately in this mock
    return URL.createObjectURL(file);
  }

  // Finalize upload in DB (create asset entity)
  async createAsset(
    file: File, 
    key: string, 
    previewUrl: string,
    metadata?: { clientId?: string; deliverableId?: string }
  ): Promise<Asset> {
    await this.delay(400);

    const type = file.type.startsWith('image/') 
      ? AssetType.IMAGE 
      : file.type.startsWith('video/') 
        ? AssetType.VIDEO 
        : AssetType.DOCUMENT;

    const newAsset: Asset = {
      id: Math.random().toString(36).substr(2, 9),
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
      checksum: Math.random().toString(36).substr(2, 16), // Mock checksum
      previewUrl,
      tags: [],
      versions: [
        {
          version: 1,
          createdAt: new Date().toISOString(),
          size: file.size,
          checksum: Math.random().toString(36).substr(2, 16),
          url: previewUrl
        }
      ]
    };

    // Check for versioning logic: If asset with same name exists in same deliverable
    if (metadata?.deliverableId) {
      const existing = this.assets.find(a => 
        a.deliverableId === metadata.deliverableId && 
        a.filename === file.name
      );

      if (existing) {
        // Version up the existing asset instead of creating new
        const newVersionNum = existing.currentVersion + 1;
        existing.currentVersion = newVersionNum;
        existing.updatedAt = new Date().toISOString();
        existing.size = file.size; // update to latest size
        existing.previewUrl = previewUrl; // update head pointer
        existing.versions.unshift({
          version: newVersionNum,
          createdAt: new Date().toISOString(),
          size: file.size,
          checksum: Math.random().toString(36).substr(2, 16),
          url: previewUrl
        });
        return existing;
      }
    }

    this.assets.unshift(newAsset);
    return newAsset;
  }

  async attachAssetToDeliverable(assetId: string, deliverableId: string): Promise<Asset> {
    await this.delay(300);
    const asset = this.assets.find(a => a.id === assetId);
    if (!asset) throw new Error("Asset not found");
    
    // If we were real, we'd check if moving it causes a version conflict here too.
    // For simplicity, we just move it.
    asset.deliverableId = deliverableId;
    
    // Auto-assign client if not present based on deliverable
    const deliverable = this.deliverables.find(d => d.id === deliverableId);
    if (deliverable && !asset.clientId) {
      asset.clientId = deliverable.clientId;
    }
    
    asset.updatedAt = new Date().toISOString();
    return { ...asset };
  }

  async updateAssetMetadata(assetId: string, tags: string[], description: string): Promise<Asset> {
    await this.delay(300);
    const asset = this.assets.find(a => a.id === assetId);
    if (!asset) throw new Error("Asset not found");
    
    asset.tags = tags;
    asset.description = description;
    return { ...asset };
  }
}

export const backend = new MockBackendService();