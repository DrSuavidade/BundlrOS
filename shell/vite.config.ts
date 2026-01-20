import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    // Load .env from monorepo root
    envDir: path.resolve(__dirname, '..'),
    // Use relative paths for Electron production build
    base: process.env.ELECTRON_RENDERER_URL ? '/' : './',
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        port: 3000,
    },
    build: {
        outDir: 'dist',
        emptyOutDir: true,
    },
    define: {
        'process.env': {},
    },
});
