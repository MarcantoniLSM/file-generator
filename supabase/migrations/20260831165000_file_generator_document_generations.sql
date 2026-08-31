create table if not exists public.file_generator_document_generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  document_kind text not null,
  document_name text not null,
  source text not null default 'openai',
  risk text,
  status text not null default 'generated',
  municipality text,
  organization text,
  prompt_tokens integer,
  output_length integer,
  created_at timestamptz not null default now()
);

alter table public.file_generator_document_generations enable row level security;

drop policy if exists "file_generator_generations_select_admin_or_own" on public.file_generator_document_generations;
create policy "file_generator_generations_select_admin_or_own"
on public.file_generator_document_generations
for select
to authenticated
using (
  user_id = auth.uid()
  or exists (
    select 1
    from public.file_generator_profiles admin_profile
    where admin_profile.id = auth.uid()
      and admin_profile.role = 'admin'
      and admin_profile.access_status = 'active'
  )
);

drop policy if exists "file_generator_generations_insert_own" on public.file_generator_document_generations;
create policy "file_generator_generations_insert_own"
on public.file_generator_document_generations
for insert
to authenticated
with check (user_id = auth.uid());
