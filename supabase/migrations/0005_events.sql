-- Eventos (Fase 2): creados por la dueña, con página pública para compartir.
create table public.events (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  descripcion text,
  precio numeric(10,2) not null default 0 check (precio >= 0),
  fecha date,
  slug text not null unique,
  activo boolean not null default true,
  creado_por uuid references public.profiles(id) default auth.uid(),
  created_at timestamptz not null default now()
);

alter table public.events enable row level security;

-- Página pública del evento: cualquiera puede leer eventos activos.
create policy "events_public_read" on public.events
  for select to anon, authenticated using (activo = true);

-- El staff ve todos (incluidos inactivos).
create policy "events_staff_read" on public.events
  for select to authenticated using (public.is_staff());

-- Solo la dueña crea/edita/elimina.
create policy "events_duena_write" on public.events
  for all to authenticated using (public.is_duena()) with check (public.is_duena());
