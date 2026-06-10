-- Crear perfil automáticamente al registrarse un usuario (rol maestro por defecto).
-- IMPORTANTE: el registro público debe estar DESACTIVADO en Supabase Auth;
-- las cuentas de staff las crea la dueña/admin. Este trigger ignora cualquier
-- rol que venga del cliente, así nadie puede auto-asignarse 'duena'.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, nombre, rol)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nombre', new.email),
    'maestro'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Helper: ¿el usuario actual es la dueña?
create or replace function public.is_duena()
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists(
    select 1 from public.profiles
    where id = auth.uid() and rol = 'duena'
  );
$$;

-- Helper: ¿el usuario actual es staff (tiene perfil)?
create or replace function public.is_staff()
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists(
    select 1 from public.profiles
    where id = auth.uid()
  );
$$;

-- Activar RLS
alter table public.profiles enable row level security;
alter table public.groups enable row level security;
alter table public.students enable row level security;
alter table public.payment_concepts enable row level security;
alter table public.payments enable row level security;
alter table public.attendance enable row level security;

-- profiles: cada quien lee su perfil; la dueña lee/gestiona todos
create policy "profiles_self_read" on public.profiles
  for select to authenticated
  using (auth.uid() = id or public.is_duena());
create policy "profiles_duena_manage" on public.profiles
  for all to authenticated
  using (public.is_duena()) with check (public.is_duena());

-- groups: solo staff lee y gestiona
create policy "groups_staff_all" on public.groups
  for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

-- students: solo staff lee y gestiona (protege la PII de las alumnas)
create policy "students_staff_all" on public.students
  for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

-- payment_concepts: staff lee; solo la dueña crea/edita/elimina
create policy "concepts_staff_read" on public.payment_concepts
  for select to authenticated using (public.is_staff());
create policy "concepts_duena_write" on public.payment_concepts
  for all to authenticated
  using (public.is_duena()) with check (public.is_duena());

-- payments: staff lee y registra (atribuido a sí mismo); solo la dueña edita/elimina
create policy "payments_staff_read" on public.payments
  for select to authenticated using (public.is_staff());
create policy "payments_staff_insert" on public.payments
  for insert to authenticated
  with check (public.is_staff() and registrado_por = auth.uid());
create policy "payments_duena_update" on public.payments
  for update to authenticated using (public.is_duena()) with check (public.is_duena());
create policy "payments_duena_delete" on public.payments
  for delete to authenticated using (public.is_duena());

-- attendance: solo staff; al escribir, queda atribuida al usuario actual
create policy "attendance_staff_all" on public.attendance
  for all to authenticated
  using (public.is_staff())
  with check (public.is_staff() and registrado_por = auth.uid());
