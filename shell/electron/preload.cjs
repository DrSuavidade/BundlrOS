"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
// Expose protected methods to the renderer process
electron_1.contextBridge.exposeInMainWorld('electronAPI', {
    // Window controls
    minimize: () => electron_1.ipcRenderer.invoke('window:minimize'),
    maximize: () => electron_1.ipcRenderer.invoke('window:maximize'),
    close: () => electron_1.ipcRenderer.invoke('window:close'),
    isMaximized: () => electron_1.ipcRenderer.invoke('window:isMaximized'),
    // Window state listeners
    onMaximizeChange: (callback) => {
        const handler = (_event, isMaximized) => callback(isMaximized);
        electron_1.ipcRenderer.on('window:maximizeChange', handler);
        return () => electron_1.ipcRenderer.removeListener('window:maximizeChange', handler);
    },
    // Auto-updater
    checkForUpdates: () => electron_1.ipcRenderer.invoke('updater:check'),
    installUpdate: () => electron_1.ipcRenderer.invoke('updater:install'),
    onUpdateStatus: (callback) => {
        const handler = (_event, status) => callback(status);
        electron_1.ipcRenderer.on('updater:status', handler);
        return () => electron_1.ipcRenderer.removeListener('updater:status', handler);
    },
    // App info
    getVersion: () => electron_1.ipcRenderer.invoke('app:getVersion'),
    // Platform info
    platform: process.platform,
});
//# sourceMappingURL=preload.js.map