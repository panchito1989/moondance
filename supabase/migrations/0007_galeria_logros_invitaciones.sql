-- Galería administrable (fotos subidas por el staff, visibles en la landing)
create table public.gallery_photos (
  id uuid primary key default gen_random_uuid(),
  path text not null,
  url text not null,
  titulo text,
  subido_por uuid references public.profiles(id) default auth.uid(),
  created_at timestamptz not null default now()
);
alter table public.gallery_photos enable row level security;
create policy "gallery_public_read" on public.gallery_photos
  for select to anon, authenticated using (true);
create policy "gallery_staff_insert" on public.gallery_photos
  for insert to authenticated with check (public.is_staff());
create policy "gallery_staff_update" on public.gallery_photos
  for update to authenticated using (public.is_staff()) with check (public.is_staff());
create policy "gallery_staff_delete" on public.gallery_photos
  for delete to authenticated using (public.is_staff());

-- Logros y reconocimientos
create table public.achievements (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  descripcion text,
  anio text,
  activo boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.achievements enable row level security;
create policy "achievements_public_read" on public.achievements
  for select to anon, authenticated using (activo = true);
create policy "achievements_staff_all" on public.achievements
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- Invitaciones a eventos/exhibiciones (formulario público de la landing)
create table public.event_invitations (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  contacto text not null,
  mensaje text,
  leido boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.event_invitations enable row level security;
create policy "invitations_public_insert" on public.event_invitations
  for insert to anon, authenticated with check (true);
create policy "invitations_staff_read" on public.event_invitations
  for select to authenticated using (public.is_staff());
create policy "invitations_staff_update" on public.event_invitations
  for update to authenticated using (public.is_staff()) with check (public.is_staff());
create policy "invitations_staff_delete" on public.event_invitations
  for delete to authenticated using (public.is_staff());

-- Bucket público para las fotos de la galería
insert into storage.buckets (id, name, public)
values ('galeria', 'galeria', true)
on conflict (id) do nothing;

create policy "galeria_public_read" on storage.objects
  for select to anon, authenticated using (bucket_id = 'galeria');
create policy "galeria_staff_upload" on storage.objects
  for insert to authenticated with check (bucket_id = 'galeria' and public.is_staff());
create policy "galeria_staff_delete" on storage.objects
  for delete to authenticated using (bucket_id = 'galeria' and public.is_staff());
