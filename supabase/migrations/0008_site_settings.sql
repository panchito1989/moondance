-- Configuración pública del sitio (WhatsApp y redes sociales).
create table public.site_settings (
  id int primary key default 1 check (id = 1),
  whatsapp text,
  tiktok text,
  instagram text,
  facebook text,
  updated_at timestamptz not null default now()
);

insert into public.site_settings (id) values (1) on conflict do nothing;

alter table public.site_settings enable row level security;
create policy "settings_public_read" on public.site_settings
  for select to anon, authenticated using (true);
create policy "settings_staff_update" on public.site_settings
  for update to authenticated
  using (public.is_staff()) with check (public.is_staff());
