-- ============================================================================
-- BundlrOS - Add Password Column to Profiles
-- ============================================================================
-- Run this in Supabase SQL Editor
-- ============================================================================

-- Add password column (plain text for demo - NOT for production!)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Update the 3 test users with passwords
-- Password is same as email prefix for easy testing (e.g., pedrocosta)
UPDATE public.profiles 
SET password_hash = 'pedrocosta' 
WHERE email = 'pedrocosta@bundlr.pt';

UPDATE public.profiles 
SET password_hash = 'davisouza' 
WHERE email = 'davisouza@bundlr.pt';

UPDATE public.profiles 
SET password_hash = 'afonsolopes' 
WHERE email = 'afonsolopes@bundlr.pt';

-- Verify
SELECT email, password_hash, role, status FROM public.profiles ORDER BY email;
