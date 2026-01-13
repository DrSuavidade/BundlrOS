-- BundlrOS Seed Data
-- This script populates all tables with sample data for development
-- Run after seed_users.sql (profiles already have 3 entries)

-- ============================================================================
-- CLIENTS (2 entries)
-- ============================================================================
INSERT INTO public.clients (id, name, code, industry, status) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Acme Corporation', 'ACME', 'Technology', 'active'),
  ('22222222-2222-2222-2222-222222222222', 'Globex Industries', 'GLOBEX', 'Manufacturing', 'active');

-- ============================================================================
-- CONTACTS (2 entries - references clients)
-- ============================================================================
INSERT INTO public.contacts (id, client_id, name, email, role) VALUES
  ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'John Smith', 'john.smith@acme.com', 'Project Manager'),
  ('44444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', 'Jane Doe', 'jane.doe@globex.com', 'Account Executive');

-- ============================================================================
-- CONTRACTS (2 entries - references clients)
-- ============================================================================
INSERT INTO public.contracts (id, client_id, title, start_date, end_date, value, status) VALUES
  ('55555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111', 'Acme Q1 2026 Retainer', '2026-01-01', '2026-03-31', 45000.00, 'active'),
  ('66666666-6666-6666-6666-666666666666', '22222222-2222-2222-2222-222222222222', 'Globex Website Redesign', '2026-01-15', '2026-06-30', 120000.00, 'active');

-- ============================================================================
-- PROJECTS (2 entries - references clients, contracts)
-- ============================================================================
INSERT INTO public.projects (id, client_id, contract_id, name, status, external_tool, external_id) VALUES
  ('77777777-7777-7777-7777-777777777777', '11111111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555555', 'Acme Brand Refresh', 'active', 'asana', 'ASN-001'),
  ('88888888-8888-8888-8888-888888888888', '22222222-2222-2222-2222-222222222222', '66666666-6666-6666-6666-666666666666', 'Globex E-commerce Platform', 'active', 'monday', 'MON-042');

-- ============================================================================
-- DELIVERABLES (2 entries - references projects)
-- Valid types: document, software, design, report
-- Valid statuses: draft, approved, etc. (check: SELECT enum_range(NULL::deliverable_status))
-- ============================================================================
INSERT INTO public.deliverables (id, project_id, title, type, status, version, due_date) VALUES
  ('99999999-9999-9999-9999-999999999999', '77777777-7777-7777-7777-777777777777', 'Brand Guidelines Document', 'document', 'draft', 'v1.2', '2026-02-15'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '88888888-8888-8888-8888-888888888888', 'Homepage Hero Design', 'design', 'approved', 'v2.0', '2026-02-01');

-- ============================================================================
-- INTAKE_ITEMS (2 entries - references clients, profiles)
-- Valid priorities: Low, Medium, High, Critical
-- Valid statuses: New, Triaged, In Progress, Done, Archived
-- ============================================================================
INSERT INTO public.intake_items (id, title, description, client_id, requestor, priority, status, assignee_id, tags, sla_due_at) VALUES
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'New Logo Variants Request', 'Client needs 3 additional logo color variants for dark backgrounds', '11111111-1111-1111-1111-111111111111', 'John Smith', 'High', 'New', NULL, ARRAY['design', 'branding', 'urgent'], '2026-01-20 17:00:00+00'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Social Media Content Calendar', 'Monthly content calendar for Q1 2026 social media campaigns', '22222222-2222-2222-2222-222222222222', 'Jane Doe', 'Medium', 'In Progress', NULL, ARRAY['marketing', 'social', 'content'], '2026-01-25 17:00:00+00');

-- ============================================================================
-- SYSTEM_EVENTS (2 entries - references clients)
-- ============================================================================
INSERT INTO public.system_events (id, type, client_id, payload, idempotency_key, status) VALUES
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'client.contract_signed', '11111111-1111-1111-1111-111111111111', '{"contract_id": "55555555-5555-5555-5555-555555555555", "value": 45000}', 'evt-acme-contract-001', 'processed'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'deliverable.status_changed', '22222222-2222-2222-2222-222222222222', '{"deliverable_id": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", "old_status": "in_progress", "new_status": "awaiting_approval"}', 'evt-globex-del-001', 'processed');

-- ============================================================================
-- AUTOMATION_RUNS (2 entries - references system_events)
-- ============================================================================
INSERT INTO public.automation_runs (id, event_id, workflow_id, status, input, output, attempt_count, started_at, completed_at) VALUES
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'onboarding_flow', 'completed', '{"client_id": "11111111-1111-1111-1111-111111111111"}', '{"tasks_created": 5, "emails_sent": 2}', 1, '2026-01-10 10:00:00+00', '2026-01-10 10:02:30+00'),
  ('00000000-0000-0000-0000-000000000001', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'approval_notification', 'completed', '{"deliverable_id": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"}', '{"notification_sent": true, "recipient": "jane.doe@globex.com"}', 1, '2026-01-11 14:30:00+00', '2026-01-11 14:30:05+00');

-- ============================================================================
-- AUDIT_LOGS (2 entries - references profiles)
-- Using profile IDs from seed_users.sql:
--   pedrocosta@bundlr.pt = a0000000-0000-0000-0000-000000000001
--   davisouza@bundlr.pt  = a0000000-0000-0000-0000-000000000002
-- ============================================================================
INSERT INTO public.audit_logs (id, action, performer_id, target_id, details) VALUES
  ('00000000-0000-0000-0000-000000000002', 'client.created', 'a0000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', '{"client_name": "Acme Corporation", "created_by": "pedrocosta@bundlr.pt"}'),
  ('00000000-0000-0000-0000-000000000003', 'contract.activated', 'a0000000-0000-0000-0000-000000000002', '55555555-5555-5555-5555-555555555555', '{"contract_title": "Acme Q1 2026 Retainer", "activated_by": "davisouza@bundlr.pt"}');

-- ============================================================================
-- BUDGETS (2 entries - references clients, contracts)
-- ============================================================================
INSERT INTO public.budgets (id, client_id, project_name, contract_id, items, notes) VALUES
  ('00000000-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 'Acme Brand Refresh Budget', '55555555-5555-5555-5555-555555555555', '[{"serviceId": "branding-logo", "tier": "standard"}, {"serviceId": "branding-guidelines", "tier": "pro"}]', 'Initial proposal for brand refresh project'),
  ('00000000-0000-0000-0000-000000000005', '22222222-2222-2222-2222-222222222222', 'Globex Website Budget', '66666666-6666-6666-6666-666666666666', '[{"serviceId": "web-landing", "tier": "pro"}, {"serviceId": "web-ecommerce", "tier": "pro"}, {"serviceId": "design-ui", "tier": "standard"}]', 'Full e-commerce platform development proposal');

-- ============================================================================
-- Summary
-- ============================================================================
-- Tables seeded:
--   ✓ clients: 2 entries
--   ✓ contacts: 2 entries  
--   ✓ contracts: 2 entries
--   ✓ projects: 2 entries
--   ✓ deliverables: 2 entries
--   ✓ intake_items: 2 entries
--   ✓ system_events: 2 entries
--   ✓ automation_runs: 2 entries
--   ✓ audit_logs: 2 entries
--   ✓ budgets: 2 entries
--   ⊘ profiles: Already has 3 entries from seed_users.sql
