alter table public.file_generator_profiles
add column if not exists allowed_modules text[] not null
default array['compras_licitacoes', 'atos_administrativos', 'legislativo', 'execucao_contratual'];

update public.file_generator_profiles
set allowed_modules = array['compras_licitacoes', 'atos_administrativos', 'legislativo', 'execucao_contratual']
where role = 'admin'
  and (
    allowed_modules is null
    or array_length(allowed_modules, 1) is null
  );

update public.file_generator_profiles
set allowed_modules = array_append(allowed_modules, 'execucao_contratual')
where role = 'admin'
  and not ('execucao_contratual' = any(allowed_modules));

update public.file_generator_profiles
set allowed_modules = array['compras_licitacoes']
where role = 'user'
  and (
    allowed_modules is null
    or array_length(allowed_modules, 1) is null
  );

create or replace function public.file_generator_handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  assigned_role public.file_generator_user_role;
begin
  assigned_role := case
    when not exists (select 1 from public.file_generator_profiles where role = 'admin') then 'admin'::public.file_generator_user_role
    else 'user'::public.file_generator_user_role
  end;

  insert into public.file_generator_profiles (id, email, full_name, role, access_status, allowed_modules)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), 'Sem nome'),
    assigned_role,
    'active'::public.file_generator_access_status,
    case
      when assigned_role = 'admin'::public.file_generator_user_role
        then array['compras_licitacoes', 'atos_administrativos', 'legislativo', 'execucao_contratual']
      else array['compras_licitacoes']
    end
  )
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = coalesce(public.file_generator_profiles.full_name, excluded.full_name);

  return new;
end;
$$;
