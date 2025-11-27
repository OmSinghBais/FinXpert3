-- Client segments lookup table (optional normalization)
create table if not exists client_segments (
  segment text primary key,
  description text,
  min_aum numeric,
  created_at timestamptz default now()
);

