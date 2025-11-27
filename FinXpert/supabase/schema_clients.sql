create table if not exists clients (
  id text primary key,
  name text not null,
  segment text not null,
  notes text,
  created_at timestamptz default now()
);

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

