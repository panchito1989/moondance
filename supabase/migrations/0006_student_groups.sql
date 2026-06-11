-- Una alumna puede estar en varias clases/grupos (muchos-a-muchos).
create table public.student_groups (
  student_id uuid not null references public.students(id) on delete cascade,
  group_id uuid not null references public.groups(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (student_id, group_id)
);
create index idx_student_groups_group on public.student_groups(group_id);

alter table public.student_groups enable row level security;
create policy "student_groups_staff_all" on public.student_groups
  for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

-- Migrar el grupo actual de cada alumna a la nueva tabla.
insert into public.student_groups (student_id, group_id)
  select id, group_id from public.students where group_id is not null
on conflict do nothing;

-- Adiós a la columna vieja (la nueva tabla es la fuente de verdad).
alter table public.students drop column group_id;
