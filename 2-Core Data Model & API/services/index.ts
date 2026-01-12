/**
 * Backend Service Export
 * 
 * This module exports the appropriate backend based on environment configuration.
 * Set VITE_USE_MOCK_BACKEND=true in .env to use localStorage mock data instead of Supabase.
 */

import { MockAPI } from './mockBackend';
import { SupabaseAPI } from './supabaseBackend';

// Check if we should use mock backend (for development without Supabase)
const useMockBackend = import.meta.env.VITE_USE_MOCK_BACKEND === 'true';

// Export the appropriate API
export const API = useMockBackend ? MockAPI : SupabaseAPI;

// Also export individual backends for testing
export { MockAPI, SupabaseAPI };

// Log which backend is being used
if (import.meta.env.DEV) {
    console.log(`[Backend] Using ${useMockBackend ? 'Mock (localStorage)' : 'Supabase'} backend`);
}
