-- ============================================================================
-- BundlrOS - Seed Users for Testing
-- ============================================================================
-- 
-- IMPORTANT: Your profiles table has a foreign key to auth.users.
-- This means you have TWO options:
--
-- OPTION 1: Create users via Supabase Dashboard (RECOMMENDED)
--   Go to Authentication > Users > Add User (email + password)
--   Then the profile will be auto-created via trigger, OR run INSERT below
--
-- OPTION 2: Temporarily disable the foreign key (for testing only)
--   Run the script below
-- ============================================================================

-- ============================================================================
-- OPTION 2: Disable FK constraint, insert, then re-enable
-- ============================================================================

-- Step 1: Temporarily drop the foreign key constraint
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Step 2: Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Step 3: Insert test profiles
INSERT INTO public.profiles (id, email, role, status, organization_id, avatar_url, created_at, updated_at)
VALUES 
  (
    'a0000000-0000-0000-0000-000000000001',
    'pedrocosta@bundlr.pt',
    'admin',
    'active',
    NULL,
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Pedro',
    NOW(),
    NOW()
  ),
  (
    'a0000000-0000-0000-0000-000000000002',
    'davisouza@bundlr.pt',
    'dev',
    'active',
    NULL,
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Davi',
    NOW(),
    NOW()
  ),
  (
    'a0000000-0000-0000-0000-000000000003',
    'afonsolopes@bundlr.pt',
    'designer',
    'active',
    NULL,
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Afonso',
    NOW(),
    NOW()
  )
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  status = EXCLUDED.status,
  avatar_url = EXCLUDED.avatar_url,
  updated_at = NOW();

-- Step 4: Verify the inserted users
SELECT id, email, role, status, created_at FROM public.profiles ORDER BY email;

-- ============================================================================
-- NOTE: If you want to restore the foreign key later (not recommended for demo):
-- ALTER TABLE public.profiles 
--   ADD CONSTRAINT profiles_id_fkey 
--   FOREIGN KEY (id) REFERENCES auth.users(id);
-- ============================================================================
