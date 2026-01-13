-- Create the bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('assets', 'assets', true)
on conflict (id) do nothing;

-- DROP Policies if they exist (to allow re-running)
drop policy if exists "Public Access" on storage.objects;
drop policy if exists "Allow Uploads" on storage.objects;
drop policy if exists "Allow Updates" on storage.objects;
drop policy if exists "Allow Deletes" on storage.objects;

-- ALLOW PUBLIC READ
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'assets' );

-- ALLOW UPLOAD (INSERT)
create policy "Allow Uploads"
on storage.objects for insert
with check ( bucket_id = 'assets' );

-- ALLOW UPDATE
create policy "Allow Updates"
on storage.objects for update
with check ( bucket_id = 'assets' );

-- ALLOW DELETE
create policy "Allow Deletes"
on storage.objects for delete
using ( bucket_id = 'assets' );

-- ==========================================
-- TABLE POLICIES for file_assets
-- ==========================================

-- Enable RLS
alter table public.file_assets enable row level security;

-- Drop existing policies on file_assets
drop policy if exists "Public Read Assets" on public.file_assets;
drop policy if exists "Allow Insert Assets" on public.file_assets;
drop policy if exists "Allow Update Assets" on public.file_assets;

-- Allow Read (All)
create policy "Public Read Assets"
on public.file_assets for select
using ( true );

-- Allow Insert (All or Authenticated)
create policy "Allow Insert Assets"
on public.file_assets for insert
with check ( true );

-- Allow Update
create policy "Allow Update Assets"
on public.file_assets for update
using ( true );

