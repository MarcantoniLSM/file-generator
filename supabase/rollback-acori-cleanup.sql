-- Rollback dos objetos criados por engano no Supabase local do projeto acori-front.
-- Mantem/restaura a funcao public.handle_new_user conforme migration do Acori
-- 20260603130000_signup_username.sql.

drop trigger if exists on_auth_user_created on auth.users;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path to ''
as $$
declare
  v_username text;
begin
  v_username := lower(trim(coalesce(new.raw_user_meta_data->>'username', '')));

  if v_username = ''
     or v_username !~ '^[a-z0-9]{3,30}$'
     or v_username in (
       'www','app','api','studio','corretor','dashboard','admin','auth',
       'static','assets','cdn','mail','acori','ronkaly','pablo'
     )
     or exists (select 1 from public.profiles where lower(username) = v_username)
  then
    v_username := null;
  end if;

  insert into public.profiles (id, full_name, phone, role, approval_status, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    'corretor',
    'pending',
    v_username
  );

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

drop policy if exists "file_generator_profiles_select_own_or_admin" on public.file_generator_profiles;
drop policy if exists "file_generator_profiles_update_own_or_admin" on public.file_generator_profiles;
drop policy if exists "file_generator_profiles_update_admin_only" on public.file_generator_profiles;
drop trigger if exists file_generator_profiles_touch_updated_at on public.file_generator_profiles;
drop table if exists public.file_generator_profiles;
drop type if exists public.file_generator_access_status;
drop type if exists public.file_generator_user_role;
