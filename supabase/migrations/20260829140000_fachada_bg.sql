-- Cor configurável da fachada
alter table public.site_config
  add column if not exists fachada_bg text not null default '#69dd69';
