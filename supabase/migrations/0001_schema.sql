-- Tipos
create type user_role as enum ('duena', 'maestro');
create type concept_type as enum ('clase', 'anualidad', 'vestuario', 'evento', 'otro');
create type payment_method as enum ('efectivo', 'transferencia', 'otro');

-- Perfiles (1:1 con auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre text not null,
  rol user_role not null default 'maestro',
  created_at timestamptz not null default now()
);

-- Grupos / clases (opcionales)
create table public.groups (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  horario text,
  activo boolean not null default true,
  created_at timestamptz not null default now()
);

-- Alumnas
create table public.students (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  tutor text,
  telefono text,
  group_id uuid references public.groups(id) on delete set null,
  notas text,
  activa boolean not null default true,
  created_at timestamptz not null default now()
);

-- Conceptos de pago (configurables por la dueña)
create table public.payment_concepts (
  id uuid primary key default gen_random_uuid(),
  nombre text not null unique,
  precio numeric(10,2) not null default 0 check (precio >= 0),
  tipo concept_type not null default 'otro',
  activo boolean not null default true,
  created_at timestamptz not null default now()
);

-- Pagos
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  concept_id uuid not null references public.payment_concepts(id),
  monto numeric(10,2) not null check (monto >= 0),
  fecha date not null default current_date,
  metodo payment_method not null default 'efectivo',
  nota text,
  registrado_por uuid references public.profiles(id) default auth.uid(),
  created_at timestamptz not null default now()
);

-- Asistencias (1 por alumna por día)
create table public.attendance (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  fecha date not null default current_date,
  presente boolean not null default true,
  payment_id uuid references public.payments(id) on delete set null,
  registrado_por uuid references public.profiles(id) default auth.uid(),
  created_at timestamptz not null default now(),
  unique (student_id, fecha)
);

-- Índices útiles
create index idx_students_group on public.students(group_id);
create index idx_payments_student on public.payments(student_id);
create index idx_payments_fecha on public.payments(fecha);
create index idx_attendance_fecha on public.attendance(fecha);
