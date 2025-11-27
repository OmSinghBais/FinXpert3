-- Enable RLS
alter table if exists product_positions enable row level security;

-- Allow the service role full access (implicit but keeps policies explicit)
create policy if not exists "product_positions_service_role_full_access"
on product_positions
as permissive
for all
to service_role
using (true)
with check (true);

-- Allow public/anon read access for now (replace condition with tenant logic later)
create policy if not exists "product_positions_public_read"
on product_positions
as permissive
for select
to public
using (
  true -- TODO: restrict using advisor_id or tenant_id once available
);

