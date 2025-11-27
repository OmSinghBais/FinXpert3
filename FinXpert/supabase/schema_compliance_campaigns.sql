create table if not exists compliance_flags (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  severity text not null check (severity in ('Low', 'Medium', 'High')),
  status text not null default 'OPEN',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists campaign_templates (
  id uuid primary key default gen_random_uuid(),
  channel text not null check (channel in ('WhatsApp', 'SMS', 'Email')),
  title text not null,
  body text not null,
  cta text,
  created_at timestamptz default now()
);

