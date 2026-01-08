export enum AssetType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  DOCUMENT = 'DOCUMENT',
  UNKNOWN = 'UNKNOWN'
}

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
  dueDate: string;
  status: 'active' | 'archived' | 'completed';
}

export interface AssetVersion {
  version: number;
  createdAt: string;
  size: number;
  checksum: string; // E.g., SHA-256
  url: string;
}

export interface Asset {
  id: string;
  filename: string;
  type: AssetType;
  mimeType: string;
  size: number;
  uploadedAt: string;
  updatedAt: string;
  status: ProcessingStatus;
  
  // Relations
  clientId?: string;
  deliverableId?: string;
  
  // Versioning
  currentVersion: number;
  versions: AssetVersion[];
  
  // Metadata
  width?: number;
  height?: number;
  duration?: number; // seconds
  tags: string[];
  description?: string;
  
  // Mock Storage
  previewUrl: string; // Presigned URL simulation
  checksum: string;
}

export interface UploadProgress {
  id: string;
  filename: string;
  progress: number; // 0-100
  status: 'uploading' | 'completed' | 'error';
  url?: string;
}