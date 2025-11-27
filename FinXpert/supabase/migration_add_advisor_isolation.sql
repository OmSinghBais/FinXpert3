-- ============================================
-- Migration: Add Advisor/Tenant Isolation
-- Run this after complete_setup.sql
-- ============================================

-- ============================================
-- 1. ADD ADVISOR/TENANT COLUMNS
-- ============================================

-- Add advisor_id and tenant_id to all sensitive tables
alter table clients 
add column if not exists advisor_id text,
add column if not exists tenant_id text;

alter table product_positions 
add column if not exists advisor_id text,
add column if not exists tenant_id text;

alter table client_tasks 
add column if not exists advisor_id text,
add column if not exists tenant_id text;

alter table compliance_flags 
add column if not exists advisor_id text,
add column if not exists tenant_id text;

alter table campaign_templates 
add column if not exists advisor_id text,
add column if not exists tenant_id text;

alter table agent_logs 
add column if not exists advisor_id text,
add column if not exists tenant_id text;

-- ============================================
-- 2. CREATE ADVISORS TABLE (optional lookup)
-- ============================================

create table if not exists advisors (
  id text primary key,
  name text not null,
  email text,
  tenant_id text,
  created_at timestamptz default now()
);

-- ============================================
-- 3. MIGRATE EXISTING DATA (assign to default advisor)
-- ============================================

-- Set default advisor for existing rows (replace 'ADV-001' with your actual default)
update clients set advisor_id = 'ADV-001', tenant_id = 'TENANT-001' where advisor_id is null;
update product_positions set advisor_id = 'ADV-001', tenant_id = 'TENANT-001' where advisor_id is null;
update client_tasks set advisor_id = 'ADV-001', tenant_id = 'TENANT-001' where advisor_id is null;
update compliance_flags set advisor_id = 'ADV-001', tenant_id = 'TENANT-001' where advisor_id is null;
update campaign_templates set advisor_id = 'ADV-001', tenant_id = 'TENANT-001' where advisor_id is null;
update agent_logs set advisor_id = 'ADV-001', tenant_id = 'TENANT-001' where advisor_id is null;

-- ============================================
-- 4. UPDATE RLS POLICIES WITH ADVISOR FILTERS
-- ============================================

-- Drop old policies
drop policy if exists "product_positions_public_read" on product_positions;
drop policy if exists "agent_logs_public_insert" on agent_logs;
drop policy if exists "agent_logs_public_read" on agent_logs;

-- Product positions: advisors can only see their own clients' data
create policy "product_positions_advisor_access"
on product_positions
as permissive
for select
to authenticated
using (
  advisor_id = current_setting('app.current_advisor_id', true)
  or tenant_id = current_setting('app.current_tenant_id', true)
);

-- Service role still has full access
drop policy if exists "product_positions_service_role_full_access" on product_positions;
create policy "product_positions_service_role_full_access"
on product_positions
as permissive
for all
to service_role
using (true)
with check (true);

-- Clients: advisors see only their clients
create policy "clients_advisor_access"
on clients
as permissive
for select
to authenticated
using (
  advisor_id = current_setting('app.current_advisor_id', true)
  or tenant_id = current_setting('app.current_tenant_id', true)
);

alter table clients enable row level security;

-- Client tasks: advisors see only their tasks
create policy "client_tasks_advisor_access"
on client_tasks
as permissive
for all
to authenticated
using (
  advisor_id = current_setting('app.current_advisor_id', true)
  or tenant_id = current_setting('app.current_tenant_id', true)
)
with check (
  advisor_id = current_setting('app.current_advisor_id', true)
  or tenant_id = current_setting('app.current_tenant_id', true)
);

alter table client_tasks enable row level security;

-- Agent logs: advisors see only their logs
create policy "agent_logs_advisor_access"
on agent_logs
as permissive
for select
to authenticated
using (
  advisor_id = current_setting('app.current_advisor_id', true)
  or tenant_id = current_setting('app.current_tenant_id', true)
);

-- Service role still has full access
drop policy if exists "agent_logs_service_role_full_access" on agent_logs;
create policy "agent_logs_service_role_full_access"
on agent_logs
as permissive
for all
to service_role
using (true)
with check (true);

-- ============================================
-- 5. SEED DEFAULT ADVISOR
-- ============================================

insert into advisors (id, name, email, tenant_id)
values
  ('ADV-001','Default Advisor','advisor@finxpert.com','TENANT-001')
on conflict (id) do nothing;

-- ============================================
-- 6. HELPER FUNCTION: Set advisor context
-- ============================================

create or replace function set_advisor_context(adv_id text, t_id text)
returns void as $$
begin
  perform set_config('app.current_advisor_id', adv_id, false);
  perform set_config('app.current_tenant_id', t_id, false);
end;
$$ language plpgsql security definer;

