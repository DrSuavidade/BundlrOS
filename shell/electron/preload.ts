import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
    // Window controls
    minimize: () => ipcRenderer.invoke('window:minimize'),
    maximize: () => ipcRenderer.invoke('window:maximize'),
    close: () => ipcRenderer.invoke('window:close'),
    isMaximized: () => ipcRenderer.invoke('window:isMaximized'),

    // Window state listeners
    onMaximizeChange: (callback: (isMaximized: boolean) => void) => {
        const handler = (_event: Electron.IpcRendererEvent, isMaximized: boolean) => callback(isMaximized);
        ipcRenderer.on('window:maximizeChange', handler);
        return () => ipcRenderer.removeListener('window:maximizeChange', handler);
    },

    // Auto-updater
    checkForUpdates: () => ipcRenderer.invoke('updater:check'),
    installUpdate: () => ipcRenderer.invoke('updater:install'),
    onUpdateStatus: (callback: (status: any) => void) => {
        const handler = (_event: Electron.IpcRendererEvent, status: any) => callback(status);
        ipcRenderer.on('updater:status', handler);
        return () => ipcRenderer.removeListener('updater:status', handler);
    },

    // App info
    getVersion: () => ipcRenderer.invoke('app:getVersion'),

    // Platform info
    platform: process.platform,
});
