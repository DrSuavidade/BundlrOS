// Type definitions for Electron API exposed via preload
interface ElectronAPI {
    // Window controls
    minimize: () => Promise<void>;
    maximize: () => Promise<void>;
    close: () => Promise<void>;
    isMaximized: () => Promise<boolean>;
    onMaximizeChange: (callback: (isMaximized: boolean) => void) => () => void;

    // Auto-updater
    checkForUpdates: () => Promise<void>;
    installUpdate: () => Promise<void>;
    onUpdateStatus: (callback: (status: UpdateStatus) => void) => () => void;

    // App info
    getVersion: () => Promise<string>;

    // Platform info
    platform: NodeJS.Platform;
}

interface UpdateStatus {
    status: 'checking' | 'available' | 'not-available' | 'downloading' | 'downloaded' | 'error';
    progress?: { percent: number };
    info?: { version: string };
    error?: string;
}

declare global {
    interface Window {
        electronAPI: ElectronAPI;
    }
}

export { };
