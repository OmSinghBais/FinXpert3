-- ============================================
-- FinXpert Complete Database Setup Script (FIXED)
-- Run this entire script in Supabase SQL Editor
-- This version includes all fixes for existing policies
-- ============================================

-- ============================================
-- 1. CREATE BASE TABLES
-- ============================================

-- Product positions (if not already created)
create table if not exists product_positions (
  client_id text not null,
  product_code text not null,
  product_name text not null,
  type text not null check (type in ('MUTUAL_FUND','LOAN','INSURANCE')),
  amount_invested numeric default 0,
  current_value numeric default 0,
  metadata jsonb,
  primary key (client_id, product_code)
);

-- Agent logs (if not already created)
create table if not exists agent_logs (
  id bigserial primary key,
  created_at timestamptz default now(),
  scope text not null,
  prompt text,
  payload jsonb,
  error text
);

-- Clients
create table if not exists clients (
  id text primary key,
  name text not null,
  segment text not null,
  notes text,
  created_at timestamptz default now()
);

-- Client tasks
create table if not exists client_tasks (
  id uuid primary key default gen_random_uuid(),
  client_id text references clients(id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'OPEN' check (status in ('OPEN','IN_PROGRESS','DONE')),
  due_date date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Compliance flags
create table if not exists compliance_flags (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  severity text not null check (severity in ('Low', 'Medium', 'High')),
  status text not null default 'OPEN',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Campaign templates
create table if not exists campaign_templates (
  id uuid primary key default gen_random_uuid(),
  channel text not null check (channel in ('WhatsApp', 'SMS', 'Email')),
  title text not null,
  body text not null,
  cta text,
  created_at timestamptz default now()
);

-- Client segments lookup table
create table if not exists client_segments (
  segment text primary key,
  description text,
  min_aum numeric,
  created_at timestamptz default now()
);

-- ============================================
-- 2. ENABLE RLS & CREATE POLICIES
-- ============================================

-- Product positions RLS
alter table if exists product_positions enable row level security;

drop policy if exists "product_positions_service_role_full_access" on product_positions;
create policy "product_positions_service_role_full_access"
on product_positions
as permissive
for all
to service_role
using (true)
with check (true);

drop policy if exists "product_positions_public_read" on product_positions;
create policy "product_positions_public_read"
on product_positions
as permissive
for select
to public
using (
  true -- TODO: restrict using advisor_id or tenant_id once available
);

-- Agent logs RLS
alter table if exists agent_logs enable row level security;

drop policy if exists "agent_logs_service_role_full_access" on agent_logs;
create policy "agent_logs_service_role_full_access"
on agent_logs
as permissive
for all
to service_role
using (true)
with check (true);

drop policy if exists "agent_logs_public_insert" on agent_logs;
create policy "agent_logs_public_insert"
on agent_logs
as permissive
for insert
to service_role
with check (true);

drop policy if exists "agent_logs_public_read" on agent_logs;
create policy "agent_logs_public_read"
on agent_logs
as permissive
for select
to service_role
using (true);

-- ============================================
-- 3. SEED DATA
-- ============================================

-- Client segments
insert into client_segments (segment, description, min_aum)
values
  ('HNI','High Net Worth Individual - AUM > ₹50L',5000000),
  ('Mass Affluent','Mass Affluent - AUM ₹10L-50L',1000000),
  ('Retail','Retail Investor - AUM < ₹10L',0)
on conflict (segment) do nothing;

-- Clients
insert into clients (id, name, segment, notes)
values
  ('CLT-001','Riya Malhotra','HNI','Owns MF + LAP; open to PMS'),
  ('CLT-002','Arjun Sinha','Mass Affluent','Hybrid MF SIP plus protection'),
  ('CLT-003','Sanjay Iyer','HNI','Large home loan; rate switch opportunity')
on conflict (id) do nothing;

-- Product positions (Mutual Funds + Loans)
insert into product_positions (client_id, product_code, product_name, type, amount_invested, current_value, metadata)
values
  ('CLT-001','MF-BAL-01','Balanced Advantage Fund','MUTUAL_FUND',250000,272500,'{"recommendation":"Hold"}'::jsonb),
  ('CLT-002','MF-LS-02','Large & Midcap Fund','MUTUAL_FUND',100000,121000,'{"recommendation":"Review"}'::jsonb),
  ('CLT-003','LOAN-HL-01','Home Loan','LOAN',0,-3200000,'{"status":"ON_TRACK","interestRate":0.085}'::jsonb),
  ('CLT-001','LOAN-LAP-07','Loan Against Property','LOAN',0,-850000,'{"status":"ATTENTION","interestRate":0.099}'::jsonb)
on conflict (client_id, product_code) do nothing;

-- Client tasks
insert into client_tasks (client_id, title, description, status, due_date)
values
  ('CLT-001','Rebalance MF allocation','Shift profits into debt funds','OPEN', current_date),
  ('CLT-001','Loan EMI strategy review','Evaluate LAP rate switch opportunity','IN_PROGRESS', current_date + interval '3 days'),
  ('CLT-002','Upsell to Hybrid MF','Introduce hybrid fund for better diversification','OPEN', current_date + interval '7 days'),
  ('CLT-003','Home loan rate negotiation','Contact bank for rate reduction','OPEN', current_date + interval '5 days')
on conflict do nothing;

-- Compliance flags
insert into compliance_flags (title, description, severity, status)
values
  ('SEBI Risk Profile Refresh','12 clients have outdated risk profiles (>12 months). Collect updated MFD declarations.','High','OPEN'),
  ('AMFI ARN Renewal','ARN-12345 expires in 45 days. Submit documents to avoid MF transaction blocks.','Medium','OPEN'),
  ('Loan KYC Mismatch','2 LAP applications missing PAN copies. Upload before disbursal.','Low','OPEN'),
  ('IRDAI Policy Statement Update','5 insurance policies need updated statements for annual review.','Medium','OPEN')
on conflict do nothing;

-- Campaign templates
insert into campaign_templates (channel, title, body, cta)
values
  ('WhatsApp','MF Top-Up Reminder','Hi {{name}}, your SIP is on track. Invest an extra ₹5K this month to stay ahead of your retirement target.','Launch Campaign'),
  ('SMS','Loan EMI Alert','Reminder: EMI for {{product}} is due on {{date}}. Reply YES to schedule auto-pay.','Launch Campaign'),
  ('Email','AIF Discovery Call','Invite HNI clients to a 15-min call on curated AIF opportunities with higher yield potential.','Launch Campaign'),
  ('WhatsApp','Insurance Review','Hi {{name}}, your term insurance policy is up for annual review. Let''s discuss coverage updates.','Schedule Call'),
  ('SMS','MF Dividend Alert','Your {{fund}} has declared a dividend. Check your account for details.','View Details')
on conflict do nothing;

-- Agent logs (test entry - normally populated by app)
insert into agent_logs (scope, prompt, payload)
values
  ('finxpert-agent','Test: Surface the most urgent advisor actions for today.',jsonb_build_object('test', true, 'timestamp', now()::text))
on conflict do nothing;

-- ============================================
-- 4. VERIFY COUNTS
-- ============================================

select 'clients' as table_name, count(*) as row_count from clients
union all
select 'product_positions', count(*) from product_positions
union all
select 'client_tasks', count(*) from client_tasks
union all
select 'compliance_flags', count(*) from compliance_flags
union all
select 'campaign_templates', count(*) from campaign_templates
union all
select 'client_segments', count(*) from client_segments
union all
select 'agent_logs', count(*) from agent_logs;

-- ============================================
-- 5. MIGRATION: Add Advisor/Tenant Isolation
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

-- Create advisors table
create table if not exists advisors (
  id text primary key,
  name text not null,
  email text,
  tenant_id text,
  created_at timestamptz default now()
);

-- Migrate existing data (assign to default advisor)
update clients set advisor_id = 'ADV-001', tenant_id = 'TENANT-001' where advisor_id is null;
update product_positions set advisor_id = 'ADV-001', tenant_id = 'TENANT-001' where advisor_id is null;
update client_tasks set advisor_id = 'ADV-001', tenant_id = 'TENANT-001' where advisor_id is null;
update compliance_flags set advisor_id = 'ADV-001', tenant_id = 'TENANT-001' where advisor_id is null;
update campaign_templates set advisor_id = 'ADV-001', tenant_id = 'TENANT-001' where advisor_id is null;
update agent_logs set advisor_id = 'ADV-001', tenant_id = 'TENANT-001' where advisor_id is null;

-- ============================================
-- 6. UPDATE RLS POLICIES WITH ADVISOR FILTERS
-- ============================================

-- Drop ALL existing policies first (to avoid conflicts)
drop policy if exists "product_positions_public_read" on product_positions;
drop policy if exists "product_positions_advisor_access" on product_positions;
drop policy if exists "agent_logs_public_insert" on agent_logs;
drop policy if exists "agent_logs_public_read" on agent_logs;
drop policy if exists "agent_logs_advisor_access" on agent_logs;
drop policy if exists "clients_advisor_access" on clients;
drop policy if exists "client_tasks_advisor_access" on client_tasks;

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
-- 7. SEED DEFAULT ADVISOR
-- ============================================

insert into advisors (id, name, email, tenant_id)
values
  ('ADV-001','Default Advisor','advisor@finxpert.com','TENANT-001')
on conflict (id) do nothing;

-- ============================================
-- 8. HELPER FUNCTION: Set advisor context
-- ============================================

create or replace function set_advisor_context(adv_id text, t_id text)
returns void as $$
begin
  perform set_config('app.current_advisor_id', adv_id, false);
  perform set_config('app.current_tenant_id', t_id, false);
end;
$$ language plpgsql security definer;

-- ============================================
-- 9. AUTH SETUP: User metadata trigger
-- ============================================

-- Create a function to automatically set advisor_id on user creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  -- Set default advisor_id from user ID if not provided
  update auth.users
  set raw_user_meta_data = coalesce(
    raw_user_meta_data,
    '{}'::jsonb
  ) || jsonb_build_object(
    'advisor_id', new.id,
    'tenant_id', 'TENANT-001'
  )
  where id = new.id;
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger to run on new user signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Grant necessary permissions
grant usage on schema public to anon, authenticated;
grant all on public.advisors to authenticated;

