create or replace function notify_agent_log()
returns trigger as $$
begin
  perform pg_notify('agent_log_channel', row_to_json(new)::text);
  return new;
end;
$$ language plpgsql;

drop trigger if exists agent_log_notify on agent_logs;

create trigger agent_log_notify
  after insert on agent_logs
  for each row execute function notify_agent_log();

