-- Update Approvals Table Schema
-- Adds missing columns for storing approval context independently of deliverables

ALTER TABLE public.approvals 
ADD COLUMN IF NOT EXISTS title text,
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS asset_url text, -- Link to specific file asset if applicable
ADD COLUMN IF NOT EXISTS asset_name text, -- Display name of the asset
ADD COLUMN IF NOT EXISTS version text, -- Snapshot version string (e.g. 'v1.2')
ADD COLUMN IF NOT EXISTS status text; -- Optional: To decouple from deliverable status if needed

-- Add comment to explain usage
COMMENT ON COLUMN public.approvals.description IS 'Specific message or context for the approver';
COMMENT ON COLUMN public.approvals.version IS 'Snapshot version of the deliverable at the time of request';
