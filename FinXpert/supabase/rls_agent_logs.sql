alter table if exists agent_logs enable row level security;

create policy if not exists "agent_logs_service_role_full_access"
on agent_logs
as permissive
for all
to service_role
using (true)
with check (true);

create policy if not exists "agent_logs_public_insert"
on agent_logs
as permissive
for insert
to service_role
with check (true);

create policy if not exists "agent_logs_public_read"
on agent_logs
as permissive
for select
to service_role
using (true);

