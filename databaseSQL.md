-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.approvals (
deliverable_id uuid NOT NULL,
token text NOT NULL UNIQUE,
client_email text,
history jsonb DEFAULT '[]'::jsonb,
created_at timestamp with time zone DEFAULT now(),
updated_at timestamp with time zone DEFAULT now(),
title text,
description text,
asset_url text,
asset_name text,
version text,
status text,
CONSTRAINT approvals_pkey PRIMARY KEY (deliverable_id),
CONSTRAINT approvals_deliverable_id_fkey FOREIGN KEY (deliverable_id) REFERENCES public.deliverables(id)
);
CREATE TABLE public.audit_logs (
id uuid NOT NULL DEFAULT uuid_generate_v4(),
action text NOT NULL,
performer_id uuid,
target_id uuid,
details jsonb,
created_at timestamp with time zone DEFAULT now(),
CONSTRAINT audit_logs_pkey PRIMARY KEY (id),
CONSTRAINT audit_logs_performer_id_fkey FOREIGN KEY (performer_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.automation_runs (
id uuid NOT NULL DEFAULT uuid_generate_v4(),
event_id uuid,
workflow_id text,
status text DEFAULT 'running'::text,
input jsonb,
output jsonb,
error jsonb,
attempt_count integer DEFAULT 1,
started_at timestamp with time zone DEFAULT now(),
completed_at timestamp with time zone,
CONSTRAINT automation_runs_pkey PRIMARY KEY (id),
CONSTRAINT automation_runs_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.system_events(id)
);
CREATE TABLE public.budgets (
id uuid NOT NULL DEFAULT uuid_generate_v4(),
client_id uuid NOT NULL,
project_name text,
contract_id uuid,
items jsonb,
notes text,
created_at timestamp with time zone DEFAULT now(),
updated_at timestamp with time zone DEFAULT now(),
CONSTRAINT budgets_pkey PRIMARY KEY (id),
CONSTRAINT budgets_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id),
CONSTRAINT budgets_contract_id_fkey FOREIGN KEY (contract_id) REFERENCES public.contracts(id)
);
CREATE TABLE public.clients (
id uuid NOT NULL DEFAULT uuid_generate_v4(),
name text NOT NULL,
code text UNIQUE,
industry text,
status USER-DEFINED DEFAULT 'active'::client_status,
created_at timestamp with time zone DEFAULT now(),
updated_at timestamp with time zone DEFAULT now(),
CONSTRAINT clients_pkey PRIMARY KEY (id)
);
CREATE TABLE public.contacts (
id uuid NOT NULL DEFAULT uuid_generate_v4(),
client_id uuid NOT NULL,
name text NOT NULL,
email text,
role text,
created_at timestamp with time zone DEFAULT now(),
updated_at timestamp with time zone DEFAULT now(),
CONSTRAINT contacts_pkey PRIMARY KEY (id),
CONSTRAINT contacts_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id)
);
CREATE TABLE public.contracts (
id uuid NOT NULL DEFAULT uuid_generate_v4(),
client_id uuid NOT NULL,
title text NOT NULL,
start_date date,
end_date date,
value numeric,
status USER-DEFINED DEFAULT 'pending'::contract_status,
created_at timestamp with time zone DEFAULT now(),
updated_at timestamp with time zone DEFAULT now(),
CONSTRAINT contracts_pkey PRIMARY KEY (id),
CONSTRAINT contracts_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id)
);
CREATE TABLE public.deliverables (
id uuid NOT NULL DEFAULT uuid_generate_v4(),
project_id uuid NOT NULL,
title text NOT NULL,
type USER-DEFINED,
status USER-DEFINED DEFAULT 'draft'::deliverable_status,
version text,
due_date date,
created_at timestamp with time zone DEFAULT now(),
updated_at timestamp with time zone DEFAULT now(),
CONSTRAINT deliverables_pkey PRIMARY KEY (id),
CONSTRAINT deliverables_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id)
);
CREATE TABLE public.file_assets (
id uuid NOT NULL DEFAULT gen_random_uuid(),
filename text NOT NULL,
mime_type text,
size_bytes bigint,
public_url text,
preview_url text,
client_id uuid,
deliverable_id uuid,
tags ARRAY,
description text,
uploaded_at timestamp with time zone DEFAULT now(),
CONSTRAINT file_assets_pkey PRIMARY KEY (id),
CONSTRAINT file_assets_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id),
CONSTRAINT file_assets_deliverable_id_fkey FOREIGN KEY (deliverable_id) REFERENCES public.deliverables(id)
);
CREATE TABLE public.intake_items (
id uuid NOT NULL DEFAULT uuid_generate_v4(),
title text NOT NULL,
description text,
client_id uuid,
requestor text,
priority USER-DEFINED DEFAULT 'Medium'::intake_priority,
status USER-DEFINED DEFAULT 'New'::intake_status,
assignee_id uuid,
ai_analysis jsonb,
tags ARRAY,
sla_due_at timestamp with time zone,
created_at timestamp with time zone DEFAULT now(),
updated_at timestamp with time zone DEFAULT now(),
CONSTRAINT intake_items_pkey PRIMARY KEY (id),
CONSTRAINT intake_items_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id),
CONSTRAINT intake_items_assignee_id_fkey FOREIGN KEY (assignee_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.profiles (
id uuid NOT NULL,
email text NOT NULL,
role USER-DEFINED DEFAULT 'dev'::user_role,
status USER-DEFINED DEFAULT 'pending'::user_status,
organization_id uuid,
avatar_url text,
created_at timestamp with time zone DEFAULT now(),
updated_at timestamp with time zone DEFAULT now(),
password_hash text,
name text,
title text,
CONSTRAINT profiles_pkey PRIMARY KEY (id)
);
CREATE TABLE public.projects (
id uuid NOT NULL DEFAULT uuid_generate_v4(),
client_id uuid NOT NULL,
contract_id uuid,
name text NOT NULL,
status USER-DEFINED DEFAULT 'active'::project_status,
external_tool text,
external_id text,
created_at timestamp with time zone DEFAULT now(),
updated_at timestamp with time zone DEFAULT now(),
CONSTRAINT projects_pkey PRIMARY KEY (id),
CONSTRAINT projects_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id),
CONSTRAINT projects_contract_id_fkey FOREIGN KEY (contract_id) REFERENCES public.contracts(id)
);
CREATE TABLE public.service_factories (
id uuid NOT NULL DEFAULT gen_random_uuid(),
contract_id text NOT NULL,
client_name text NOT NULL,
template_id text NOT NULL,
current_stage_id text,
status text DEFAULT 'IDLE'::text,
deliverables jsonb DEFAULT '[]'::jsonb,
blockers ARRAY DEFAULT ARRAY[]::text[],
logs jsonb DEFAULT '[]'::jsonb,
started_at timestamp with time zone DEFAULT now(),
last_updated timestamp with time zone DEFAULT now(),
created_at timestamp with time zone DEFAULT now(),
CONSTRAINT service_factories_pkey PRIMARY KEY (id)
);
CREATE TABLE public.system_events (
id uuid NOT NULL DEFAULT uuid_generate_v4(),
type text NOT NULL,
client_id uuid,
payload jsonb,
idempotency_key text UNIQUE,
status text DEFAULT 'created'::text,
created_at timestamp with time zone DEFAULT now(),
CONSTRAINT system_events_pkey PRIMARY KEY (id),
CONSTRAINT system_events_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id)
);
