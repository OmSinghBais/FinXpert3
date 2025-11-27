-- Seed data for all FinXpert tables
-- Run this after creating all tables

-- 0. Client segments (run schema_client_segments.sql first)
insert into client_segments (segment, description, min_aum)
values
  ('HNI','High Net Worth Individual - AUM > ₹50L',5000000),
  ('Mass Affluent','Mass Affluent - AUM ₹10L-50L',1000000),
  ('Retail','Retail Investor - AUM < ₹10L',0)
on conflict (segment) do nothing;

-- 1. Clients
insert into clients (id, name, segment, notes)
values
  ('CLT-001','Riya Malhotra','HNI','Owns MF + LAP; open to PMS'),
  ('CLT-002','Arjun Sinha','Mass Affluent','Hybrid MF SIP plus protection'),
  ('CLT-003','Sanjay Iyer','HNI','Large home loan; rate switch opportunity')
on conflict (id) do nothing;

-- 2. Product positions (Mutual Funds + Loans)
insert into product_positions (client_id, product_code, product_name, type, amount_invested, current_value, metadata)
values
  ('CLT-001','MF-BAL-01','Balanced Advantage Fund','MUTUAL_FUND',250000,272500,'{"recommendation":"Hold"}'),
  ('CLT-002','MF-LS-02','Large & Midcap Fund','MUTUAL_FUND',100000,121000,'{"recommendation":"Review"}'),
  ('CLT-003','LOAN-HL-01','Home Loan','LOAN',0,-3200000,'{"status":"ON_TRACK","interestRate":0.085}'),
  ('CLT-001','LOAN-LAP-07','Loan Against Property','LOAN',0,-850000,'{"status":"ATTENTION","interestRate":0.099}')
on conflict (client_id, product_code) do nothing;

-- 3. Client tasks
insert into client_tasks (client_id, title, description, status, due_date)
values
  ('CLT-001','Rebalance MF allocation','Shift profits into debt funds','OPEN', current_date),
  ('CLT-001','Loan EMI strategy review','Evaluate LAP rate switch opportunity','IN_PROGRESS', current_date + interval '3 days'),
  ('CLT-002','Upsell to Hybrid MF','Introduce hybrid fund for better diversification','OPEN', current_date + interval '7 days'),
  ('CLT-003','Home loan rate negotiation','Contact bank for rate reduction','OPEN', current_date + interval '5 days')
on conflict do nothing;

-- 4. Compliance flags
insert into compliance_flags (title, description, severity, status)
values
  ('SEBI Risk Profile Refresh','12 clients have outdated risk profiles (>12 months). Collect updated MFD declarations.','High','OPEN'),
  ('AMFI ARN Renewal','ARN-12345 expires in 45 days. Submit documents to avoid MF transaction blocks.','Medium','OPEN'),
  ('Loan KYC Mismatch','2 LAP applications missing PAN copies. Upload before disbursal.','Low','OPEN'),
  ('IRDAI Policy Statement Update','5 insurance policies need updated statements for annual review.','Medium','OPEN')
on conflict do nothing;

-- 5. Campaign templates
insert into campaign_templates (channel, title, body, cta)
values
  ('WhatsApp','MF Top-Up Reminder','Hi {{name}}, your SIP is on track. Invest an extra ₹5K this month to stay ahead of your retirement target.','Launch Campaign'),
  ('SMS','Loan EMI Alert','Reminder: EMI for {{product}} is due on {{date}}. Reply YES to schedule auto-pay.','Launch Campaign'),
  ('Email','AIF Discovery Call','Invite HNI clients to a 15-min call on curated AIF opportunities with higher yield potential.','Launch Campaign'),
  ('WhatsApp','Insurance Review','Hi {{name}}, your term insurance policy is up for annual review. Let''s discuss coverage updates.','Schedule Call'),
  ('SMS','MF Dividend Alert','Your {{fund}} has declared a dividend. Check your account for details.','View Details')
on conflict do nothing;

-- 6. Agent logs (test entry - normally populated by app)
insert into agent_logs (scope, prompt, payload)
values
  ('finxpert-agent','Test: Surface the most urgent advisor actions for today.',('{"test":true,"timestamp":"' || now()::text || '"}')::jsonb)
on conflict do nothing;

-- Verify counts
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

