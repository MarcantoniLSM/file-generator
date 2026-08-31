create extension if not exists "pgcrypto";

do $$
begin
  create type public.file_generator_user_role as enum ('admin', 'user');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.file_generator_access_status as enum ('active', 'blocked');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.file_generator_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  role public.file_generator_user_role not null default 'user',
  access_status public.file_generator_access_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.file_generator_profiles enable row level security;

create or replace function public.file_generator_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists file_generator_profiles_touch_updated_at on public.file_generator_profiles;
create trigger file_generator_profiles_touch_updated_at
before update on public.file_generator_profiles
for each row execute function public.file_generator_touch_updated_at();

create or replace function public.file_generator_handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.file_generator_profiles (id, email, full_name, role, access_status)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), 'Sem nome'),
    case
      when not exists (select 1 from public.file_generator_profiles where role = 'admin') then 'admin'::public.file_generator_user_role
      else 'user'::public.file_generator_user_role
    end,
    'active'::public.file_generator_access_status
  )
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = coalesce(public.file_generator_profiles.full_name, excluded.full_name);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.file_generator_handle_new_user();

drop policy if exists "file_generator_profiles_select_own_or_admin" on public.file_generator_profiles;
create policy "file_generator_profiles_select_own_or_admin"
on public.file_generator_profiles
for select
to authenticated
using (
  auth.uid() = id
  or exists (
    select 1
    from public.file_generator_profiles admin_profile
    where admin_profile.id = auth.uid()
      and admin_profile.role = 'admin'
      and admin_profile.access_status = 'active'
  )
);

drop policy if exists "file_generator_profiles_update_own_or_admin" on public.file_generator_profiles;
drop policy if exists "file_generator_profiles_update_admin_only" on public.file_generator_profiles;
create policy "file_generator_profiles_update_admin_only"
on public.file_generator_profiles
for update
to authenticated
using (
  exists (
    select 1
    from public.file_generator_profiles admin_profile
    where admin_profile.id = auth.uid()
      and admin_profile.role = 'admin'
      and admin_profile.access_status = 'active'
  )
)
with check (
  exists (
    select 1
    from public.file_generator_profiles admin_profile
    where admin_profile.id = auth.uid()
      and admin_profile.role = 'admin'
      and admin_profile.access_status = 'active'
  )
);
