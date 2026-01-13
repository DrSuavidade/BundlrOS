-- ============================================================================
-- BundlrOS - Disable RLS or Add Policies for Development
-- ============================================================================
-- 
-- Supabase enables Row Level Security (RLS) by default.
-- Without policies, all SELECT queries return empty arrays.
-- 
-- OPTION 1: Disable RLS completely (for development only)
-- OPTION 2: Add permissive policies (better for production-like testing)
-- ============================================================================

-- ============================================================================
-- OPTION 1: DISABLE RLS (Quick fix for development)
-- ============================================================================

ALTER TABLE public.clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliverables DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.intake_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_runs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- ============================================================================
-- OPTION 2: ADD PERMISSIVE POLICIES (Better for testing with auth)
-- Uncomment below if you want RLS enabled but with open access
-- ============================================================================

/*
-- Allow all authenticated users to read all data
CREATE POLICY "Allow read access for all" ON public.clients FOR SELECT USING (true);
CREATE POLICY "Allow read access for all" ON public.contacts FOR SELECT USING (true);
CREATE POLICY "Allow read access for all" ON public.contracts FOR SELECT USING (true);
CREATE POLICY "Allow read access for all" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Allow read access for all" ON public.deliverables FOR SELECT USING (true);
CREATE POLICY "Allow read access for all" ON public.intake_items FOR SELECT USING (true);
CREATE POLICY "Allow read access for all" ON public.system_events FOR SELECT USING (true);
CREATE POLICY "Allow read access for all" ON public.automation_runs FOR SELECT USING (true);
CREATE POLICY "Allow read access for all" ON public.audit_logs FOR SELECT USING (true);
CREATE POLICY "Allow read access for all" ON public.budgets FOR SELECT USING (true);
CREATE POLICY "Allow read access for all" ON public.profiles FOR SELECT USING (true);

-- Allow all authenticated users to insert/update/delete
CREATE POLICY "Allow write access for all" ON public.clients FOR ALL USING (true);
CREATE POLICY "Allow write access for all" ON public.contacts FOR ALL USING (true);
CREATE POLICY "Allow write access for all" ON public.contracts FOR ALL USING (true);
CREATE POLICY "Allow write access for all" ON public.projects FOR ALL USING (true);
CREATE POLICY "Allow write access for all" ON public.deliverables FOR ALL USING (true);
CREATE POLICY "Allow write access for all" ON public.intake_items FOR ALL USING (true);
CREATE POLICY "Allow write access for all" ON public.system_events FOR ALL USING (true);
CREATE POLICY "Allow write access for all" ON public.automation_runs FOR ALL USING (true);
CREATE POLICY "Allow write access for all" ON public.audit_logs FOR ALL USING (true);
CREATE POLICY "Allow write access for all" ON public.budgets FOR ALL USING (true);
CREATE POLICY "Allow write access for all" ON public.profiles FOR ALL USING (true);
*/

-- ============================================================================
-- Verify RLS status
-- ============================================================================
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
