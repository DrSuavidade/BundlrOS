export type AssetType = 'image' | 'video' | 'document';

export enum ProcessingStatus {
  PENDING = 'PENDING',
  UPLOADING = 'UPLOADING',
  PROCESSING = 'PROCESSING',
  READY = 'READY',
  ERROR = 'ERROR'
}

export interface Client {
  id: string;
  name: string;
  logoUrl?: string;
}

export interface Deliverable {
  id: string;
  clientId: string;
  name: string;
  dueDate?: string;
  status?: string;
}

export interface Asset {
  id: string;
  filename: string;
  url: string;
  type: AssetType;
  size: number; // in bytes
  uploadedAt: string;
  tags: string[];
  description?: string;
  previewUrl?: string;

  // Relations
  clientId?: string;
  deliverableId?: string;
}

export interface UploadProgress {
  id: string;
  filename: string;
  progress: number; // 0-100
  status: 'uploading' | 'completed' | 'error';
  url?: string;
}