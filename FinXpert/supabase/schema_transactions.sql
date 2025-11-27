-- Transactions table for logging all financial transactions
create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  client_id text not null references clients(id) on delete cascade,
  advisor_id text,
  tenant_id text,
  product_code text not null,
  transaction_type text not null check (transaction_type in ('PURCHASE','REDEMPTION','SWITCH','DISBURSEMENT','REPAYMENT','PREPAYMENT')),
  amount numeric not null,
  status text not null default 'PENDING' check (status in ('PENDING','COMPLETED','FAILED','CANCELLED')),
  external_transaction_id text,
  metadata jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Campaign sends table for tracking message delivery
create table if not exists campaign_sends (
  id uuid primary key default gen_random_uuid(),
  template_id uuid references campaign_templates(id) on delete set null,
  client_id text not null references clients(id) on delete cascade,
  advisor_id text,
  tenant_id text,
  channel text not null check (channel in ('WhatsApp', 'SMS', 'Email')),
  status text not null default 'PENDING' check (status in ('PENDING','SENT','FAILED','DELIVERED','READ')),
  message_id text,
  error text,
  sent_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz default now()
);

-- Indexes for performance
create index if not exists idx_transactions_client on transactions(client_id);
create index if not exists idx_transactions_advisor on transactions(advisor_id);
create index if not exists idx_transactions_status on transactions(status);
create index if not exists idx_campaign_sends_client on campaign_sends(client_id);
create index if not exists idx_campaign_sends_advisor on campaign_sends(advisor_id);
create index if not exists idx_campaign_sends_status on campaign_sends(status);

