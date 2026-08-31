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

delete from public.file_generator_document_generations
where source = 'demo';

with active_users as (
  select id, row_number() over (order by email) as rn
  from public.file_generator_profiles
  where access_status = 'active'
),
document_types as (
  select *
  from (
    values
      (1, 'etp', 'Estudo Tecnico Preliminar'),
      (2, 'tr', 'Termo de Referencia'),
      (3, 'edital_licitacao', 'Edital de Licitacao'),
      (4, 'mapa_riscos', 'Mapa de Riscos'),
      (5, 'processo_dispensa', 'Processo de Dispensa e Inexigibilidade'),
      (6, 'pesquisa_precos', 'Pesquisa de Precos'),
      (7, 'parecer_juridico', 'Parecer Juridico de Compras'),
      (8, 'decreto_portaria', 'Decreto Executivo e Portaria'),
      (9, 'minuta_contrato', 'Minuta de Contrato Administrativo'),
      (10, 'projeto_lei', 'Projeto de Lei'),
      (11, 'requerimento_legislativo', 'Requerimento e Indicacao'),
      (12, 'parecer_comissao', 'Parecer de Comissao'),
      (13, 'emenda_parlamentar', 'Emenda Parlamentar'),
      (14, 'justificativa_projeto_lei', 'Justificativa de Projeto de Lei')
  ) as docs(ord, document_kind, document_name)
),
organizations as (
  select *
  from (
    values
      (1, 'Sobral/CE', 'Secretaria Municipal de Administracao'),
      (2, 'Sobral/CE', 'Secretaria Municipal de Educacao'),
      (3, 'Sobral/CE', 'Secretaria Municipal de Saude'),
      (4, 'Sobral/CE', 'Procuradoria Geral do Municipio'),
      (5, 'Sobral/CE', 'Camara Municipal'),
      (6, 'Sobral/CE', 'Secretaria Municipal de Obras')
  ) as orgs(ord, municipality, organization)
),
numbered as (
  select generate_series(1, 96) as n
),
user_count as (
  select greatest(count(*), 1) as total
  from active_users
)
insert into public.file_generator_document_generations (
  user_id,
  document_kind,
  document_name,
  source,
  risk,
  status,
  municipality,
  organization,
  prompt_tokens,
  output_length,
  created_at
)
select
  active_users.id,
  document_types.document_kind,
  document_types.document_name,
  'demo',
  case
    when numbered.n % 13 = 0 then 'medio'
    when numbered.n % 7 = 0 then 'baixo'
    else null
  end,
  case
    when numbered.n % 5 = 0 then 'reviewed'
    when numbered.n % 13 = 0 then 'forced_generation'
    else 'generated'
  end,
  organizations.municipality,
  organizations.organization,
  2400 + numbered.n * 37,
  6500 + numbered.n * 113,
  now() - ((numbered.n % 30) || ' days')::interval - ((numbered.n % 9) || ' hours')::interval
from numbered
cross join user_count
join active_users on active_users.rn = ((numbered.n - 1) % user_count.total) + 1
join document_types on document_types.ord = ((numbered.n - 1) % 14) + 1
join organizations on organizations.ord = ((numbered.n - 1) % 6) + 1;
