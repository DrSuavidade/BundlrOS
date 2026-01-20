import { app, BrowserWindow, ipcMain, shell } from 'electron';
import { autoUpdater } from 'electron-updater';
import path from 'path';

// Handle Squirrel.Windows events (for NSIS installer)
const handleSquirrelEvent = () => {
    if (process.argv.length === 1) return false;
    const squirrelEvent = process.argv[1];
    switch (squirrelEvent) {
        case '--squirrel-install':
        case '--squirrel-updated':
        case '--squirrel-uninstall':
        case '--squirrel-obsolete':
            app.quit();
            return true;
    }
    return false;
};

if (handleSquirrelEvent()) {
    process.exit(0);
}

let mainWindow: BrowserWindow | null = null;

const isDev = !app.isPackaged;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1024,
        minHeight: 700,
        frame: false, // Frameless for custom titlebar
        titleBarStyle: 'hidden',
        backgroundColor: '#0a0a0f',
        show: false, // Don't show until ready
        webPreferences: {
            preload: path.join(__dirname, 'preload.cjs'),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: true,
        },
        icon: path.join(__dirname, '../build/icon.ico'),
    });

    // Load the app
    if (isDev) {
        mainWindow.loadURL('http://localhost:3000');
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }

    // Show window when ready to prevent visual flash
    mainWindow.once('ready-to-show', () => {
        mainWindow?.show();
        mainWindow?.focus();
    });

    // Handle external links
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// Window control IPC handlers
ipcMain.handle('window:minimize', () => {
    mainWindow?.minimize();
});

ipcMain.handle('window:maximize', () => {
    if (mainWindow?.isMaximized()) {
        mainWindow.unmaximize();
    } else {
        mainWindow?.maximize();
    }
});

ipcMain.handle('window:close', () => {
    mainWindow?.close();
});

ipcMain.handle('window:isMaximized', () => {
    return mainWindow?.isMaximized() ?? false;
});

// Auto-updater IPC handlers
ipcMain.handle('updater:check', () => {
    if (!isDev) {
        autoUpdater.checkForUpdatesAndNotify();
    }
});

ipcMain.handle('app:getVersion', () => {
    return app.getVersion();
});

// Auto-updater events
autoUpdater.on('checking-for-update', () => {
    mainWindow?.webContents.send('updater:status', { status: 'checking' });
});

autoUpdater.on('update-available', (info) => {
    mainWindow?.webContents.send('updater:status', { status: 'available', info });
});

autoUpdater.on('update-not-available', () => {
    mainWindow?.webContents.send('updater:status', { status: 'not-available' });
});

autoUpdater.on('download-progress', (progress) => {
    mainWindow?.webContents.send('updater:status', { status: 'downloading', progress });
});

autoUpdater.on('update-downloaded', (info) => {
    mainWindow?.webContents.send('updater:status', { status: 'downloaded', info });
});

autoUpdater.on('error', (error) => {
    mainWindow?.webContents.send('updater:status', { status: 'error', error: error.message });
});

ipcMain.handle('updater:install', () => {
    autoUpdater.quitAndInstall();
});

// App lifecycle
app.whenReady().then(() => {
    createWindow();

    // Check for updates after launch (production only)
    if (!isDev) {
        setTimeout(() => {
            autoUpdater.checkForUpdatesAndNotify();
        }, 3000);
    }

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// Maximize state change notification
app.on('browser-window-created', (_, window) => {
    window.on('maximize', () => {
        window.webContents.send('window:maximizeChange', true);
    });
    window.on('unmaximize', () => {
        window.webContents.send('window:maximizeChange', false);
    });
});
