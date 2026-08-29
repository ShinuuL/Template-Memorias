-- ============================================================
-- Site de Memórias — Schema Supabase
-- Como usar:
--   1. Crie um projeto no Supabase (https://supabase.com)
--   2. Abra o SQL Editor do seu projeto
--   3. Cole TODO este arquivo e execute (Run)
--   4. Depois, crie o usuário ADMIN (veja etapa 5 no fim)
-- ============================================================

-- ------------------------------------------------------------
-- 0. Extensões
-- ------------------------------------------------------------
create extension if not exists "uuid-ossp";

-- ------------------------------------------------------------
-- 1. Tabela: profiles (papel do usuário: admin | viewer)
--    Criada automaticamente para cada usuário autenticado.
--    Para promover alguém a admin, rode:
--      update public.profiles set role = 'admin' where id = '<auth uid>';
-- ------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'viewer' check (role in ('admin', 'viewer')),
  created_at timestamptz not null default now()
);

-- Trigger: insere um profile automaticamente no signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, role)
  values (new.id, 'viewer')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS para profiles: o usuário só enxerga a própria linha;
-- admin pode ler todas (para conceder acesso).
alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

-- ------------------------------------------------------------
-- 2. Tabela: memories (cada memória: carta + playlist + tema)
-- ------------------------------------------------------------
create table if not exists public.memories (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  date text,
  letter text,
  -- Array de track IDs do Spotify, ex: ["28jyMOvRd82hQp95Z9ftXw", "..."]
  spotify_tracks jsonb not null default '[]'::jsonb,
  -- Tema por memória (cores e fontes)
  theme jsonb not null default '{
    "bg": "#89cff0",
    "text": "#1a1a1a",
    "accent": "#e91e63",
    "fontHeading": "Sofia",
    "fontBody": "Shadows Into Light",
    "polaroidBg": "#ffffff"
  }'::jsonb,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.memories enable row level security;

-- Leitura: para qualquer pessoa autenticada (admin) ou anônima que
-- passou pela fachada (anônimo). Aqui liberamos leitura para todos
-- (anon e authed); o controle de "quem destravou" fica no app via cookie.
drop policy if exists "memories_select_all" on public.memories;
create policy "memories_select_all"
  on public.memories for select
  using (true);

-- Escrita (insert/update/delete): somente admin
drop policy if exists "memories_insert_admin" on public.memories;
create policy "memories_insert_admin"
  on public.memories for insert
  with check (exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  ));

drop policy if exists "memories_update_admin" on public.memories;
create policy "memories_update_admin"
  on public.memories for update
  using (exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  ));

drop policy if exists "memories_delete_admin" on public.memories;
create policy "memories_delete_admin"
  on public.memories for delete
  using (exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  ));

-- ------------------------------------------------------------
-- 3. Tabela: photos (álbum de cada memória)
-- ------------------------------------------------------------
create table if not exists public.photos (
  id uuid primary key default uuid_generate_v4(),
  memory_id uuid not null references public.memories (id) on delete cascade,
  storage_path text not null,
  caption text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.photos enable row level security;

drop policy if exists "photos_select_all" on public.photos;
create policy "photos_select_all"
  on public.photos for select
  using (true);

drop policy if exists "photos_insert_admin" on public.photos;
create policy "photos_insert_admin"
  on public.photos for insert
  with check (exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  ));

drop policy if exists "photos_update_admin" on public.photos;
create policy "photos_update_admin"
  on public.photos for update
  using (exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  ));

drop policy if exists "photos_delete_admin" on public.photos;
create policy "photos_delete_admin"
  on public.photos for delete
  using (exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  ));

-- ------------------------------------------------------------
-- 4. Tabela: site_config (configuração da "fachada":
--    a pergunta secreta que destrava a entrada do visualizador)
--    Sempre tem exatamente 1 linha (id = 1).
-- ------------------------------------------------------------
create table if not exists public.site_config (
  id int primary key default 1 check (id = 1),
  pergunta text not null default 'Acerta a data Neném',
  resposta text not null default '2025-07-04',
  fachada_bg text not null default '#69dd69',
  updated_at timestamptz not null default now()
);

alter table public.site_config enable row level security;

drop policy if exists "site_config_select_all" on public.site_config;
create policy "site_config_select_all"
  on public.site_config for select
  using (true);

drop policy if exists "site_config_update_admin" on public.site_config;
create policy "site_config_update_admin"
  on public.site_config for update
  using (exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  ));

-- Seed da configuração da fachada
insert into public.site_config (id, pergunta, resposta, fachada_bg)
values (1, 'Acerta a data Neném', '2025-07-04', '#69dd69')
on conflict (id) do nothing;

-- ------------------------------------------------------------
-- 5. Bucket de fotos no Storage
--    Fotos ficam em 'fotos/<memory_id>/<arquivo>'
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('fotos', 'fotos', true)
on conflict (id) do nothing;

-- Política: qualquer um pode LER fotos do bucket 'fotos'
drop policy if exists "fotos_select_public" on storage.objects;
create policy "fotos_select_public"
  on storage.objects for select
  using (bucket_id = 'fotos');

-- Política: apenas admin pode ENVIAR/ATUALIZAR/APAGAR no bucket 'fotos'
drop policy if exists "fotos_insert_admin" on storage.objects;
create policy "fotos_insert_admin"
  on storage.objects for insert
  with check (
    bucket_id = 'fotos'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

drop policy if exists "fotos_update_admin" on storage.objects;
create policy "fotos_update_admin"
  on storage.objects for update
  using (
    bucket_id = 'fotos'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

drop policy if exists "fotos_delete_admin" on storage.objects;
create policy "fotos_delete_admin"
  on storage.objects for delete
  using (
    bucket_id = 'fotos'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- ------------------------------------------------------------
-- 5b. (IMPORTANTE) Aplicar RLS também nas tabelas de auth do Supabase
--     pode ser feito na UI, mas o essencial já está coberto acima.
-- ------------------------------------------------------------

-- ------------------------------------------------------------
-- 5c. Expor as tabelas à API (PostgREST).
--     Tabelas criadas via SQL não ficam acessíveis pela API
--     automaticamente. Concedemos:
--       - anon (visitante não autenticado): apenas LEITURA
--       - authenticated (admin): leitura + escrita
--     As RLS policies acima continuam controlando quais LINHAS
--     cada um enxerga/altera (ex.: admin só se role = 'admin').
-- ------------------------------------------------------------
grant usage on schema public to anon, authenticated;

grant select on public.memories, public.photos, public.site_config to anon;
grant select, insert, update, delete
  on public.memories, public.photos, public.site_config to authenticated;

grant select on public.profiles to authenticated;

-- ============================================================
-- COMO CRIAR O USUÁRIO ADMIN (após rodar o schema):
--
-- 1) Na aba Authentication > Users, clique em "Add user"
--    e crie o email/senha do ADMIN (pode usar um convite).
-- 2) Copie o UUID do usuário criado.
-- 3) Rode no SQL Editor:
--      update public.profiles set role = 'admin'
--      where id = '<UUID do usuário>';
--    (Se o profile ainda não existir, rode antes:
--      insert into public.profiles (id, role)
--      values ('<UUID do usuário>', 'admin')
--      on conflict (id) do update set role = excluded.role; )
-- ============================================================
