/**
 * Backend Service Export
 * 
 * This module exports the Supabase backend.
 */

import { SupabaseAPI } from './supabaseBackend';

// Export the appropriate API
export const API = SupabaseAPI;

// Also export individual backends for testing
export { SupabaseAPI };
