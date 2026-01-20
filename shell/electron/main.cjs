"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const electron_updater_1 = require("electron-updater");
const path_1 = __importDefault(require("path"));
// Handle Squirrel.Windows events (for NSIS installer)
const handleSquirrelEvent = () => {
    if (process.argv.length === 1)
        return false;
    const squirrelEvent = process.argv[1];
    switch (squirrelEvent) {
        case '--squirrel-install':
        case '--squirrel-updated':
        case '--squirrel-uninstall':
        case '--squirrel-obsolete':
            electron_1.app.quit();
            return true;
    }
    return false;
};
if (handleSquirrelEvent()) {
    process.exit(0);
}
let mainWindow = null;
const isDev = !electron_1.app.isPackaged;
function createWindow() {
    mainWindow = new electron_1.BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1024,
        minHeight: 700,
        frame: false, // Frameless for custom titlebar
        titleBarStyle: 'hidden',
        backgroundColor: '#0a0a0f',
        show: false, // Don't show until ready
        webPreferences: {
            preload: path_1.default.join(__dirname, 'preload.cjs'),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: true,
        },
        icon: path_1.default.join(__dirname, '../build/icon.ico'),
    });
    // Load the app
    if (isDev) {
        mainWindow.loadURL('http://localhost:3000');
        mainWindow.webContents.openDevTools();
    }
    else {
        mainWindow.loadFile(path_1.default.join(__dirname, '../dist/index.html'));
    }
    // Show window when ready to prevent visual flash
    mainWindow.once('ready-to-show', () => {
        mainWindow?.show();
        mainWindow?.focus();
    });
    // Handle external links
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        electron_1.shell.openExternal(url);
        return { action: 'deny' };
    });
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}
// Window control IPC handlers
electron_1.ipcMain.handle('window:minimize', () => {
    mainWindow?.minimize();
});
electron_1.ipcMain.handle('window:maximize', () => {
    if (mainWindow?.isMaximized()) {
        mainWindow.unmaximize();
    }
    else {
        mainWindow?.maximize();
    }
});
electron_1.ipcMain.handle('window:close', () => {
    mainWindow?.close();
});
electron_1.ipcMain.handle('window:isMaximized', () => {
    return mainWindow?.isMaximized() ?? false;
});
// Auto-updater IPC handlers
electron_1.ipcMain.handle('updater:check', () => {
    if (!isDev) {
        electron_updater_1.autoUpdater.checkForUpdatesAndNotify();
    }
});
electron_1.ipcMain.handle('app:getVersion', () => {
    return electron_1.app.getVersion();
});
// Auto-updater events
electron_updater_1.autoUpdater.on('checking-for-update', () => {
    mainWindow?.webContents.send('updater:status', { status: 'checking' });
});
electron_updater_1.autoUpdater.on('update-available', (info) => {
    mainWindow?.webContents.send('updater:status', { status: 'available', info });
});
electron_updater_1.autoUpdater.on('update-not-available', () => {
    mainWindow?.webContents.send('updater:status', { status: 'not-available' });
});
electron_updater_1.autoUpdater.on('download-progress', (progress) => {
    mainWindow?.webContents.send('updater:status', { status: 'downloading', progress });
});
electron_updater_1.autoUpdater.on('update-downloaded', (info) => {
    mainWindow?.webContents.send('updater:status', { status: 'downloaded', info });
});
electron_updater_1.autoUpdater.on('error', (error) => {
    mainWindow?.webContents.send('updater:status', { status: 'error', error: error.message });
});
electron_1.ipcMain.handle('updater:install', () => {
    electron_updater_1.autoUpdater.quitAndInstall();
});
// App lifecycle
electron_1.app.whenReady().then(() => {
    createWindow();
    // Check for updates after launch (production only)
    if (!isDev) {
        setTimeout(() => {
            electron_updater_1.autoUpdater.checkForUpdatesAndNotify();
        }, 3000);
    }
    electron_1.app.on('activate', () => {
        if (electron_1.BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
// Maximize state change notification
electron_1.app.on('browser-window-created', (_, window) => {
    window.on('maximize', () => {
        window.webContents.send('window:maximizeChange', true);
    });
    window.on('unmaximize', () => {
        window.webContents.send('window:maximizeChange', false);
    });
});
//# sourceMappingURL=main.js.map