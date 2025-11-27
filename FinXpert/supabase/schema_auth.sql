-- Enable Supabase Auth (usually enabled by default)
-- This script sets up user metadata to store advisor_id and tenant_id

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

