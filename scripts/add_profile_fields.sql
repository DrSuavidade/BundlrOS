-- ============================================================================
-- BundlrOS - Add Name and Title to Profiles
-- ============================================================================
-- Run this in Supabase SQL Editor to add name and title columns

-- Add the new columns
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS name text,
  ADD COLUMN IF NOT EXISTS title text;

-- Update existing profiles with names based on email (for seed data)
UPDATE public.profiles SET 
  name = 'Pedro Costa',
  title = 'Founder & CEO'
WHERE email = 'pedrocosta@bundlr.pt';

UPDATE public.profiles SET 
  name = 'Davi Souza',
  title = 'Lead Developer'
WHERE email = 'davisouza@bundlr.pt';

UPDATE public.profiles SET 
  name = 'Afonso Lopes',
  title = 'Creative Director'
WHERE email = 'afonsolopes@bundlr.pt';

-- Verify the changes
SELECT id, email, name, title, role, status FROM public.profiles;
