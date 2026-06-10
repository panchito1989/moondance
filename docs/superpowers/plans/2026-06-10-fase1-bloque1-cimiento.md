# MoonDance Studio — Fase 1 · Bloque 1: Cimiento, base de datos y autenticación · Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dejar el proyecto Next.js + Supabase funcionando y desplegable, con la base de datos completa de Fase 1, seguridad por roles (RLS) y login operativo para la dueña y los maestros.

**Architecture:** App Next.js (App Router, TypeScript) en Vercel, conectada a Supabase (Postgres + Auth). El esquema relacional vive en una migración SQL versionada. La autenticación usa `@supabase/ssr` (sesión por cookies, refrescada en middleware). Las rutas bajo `/admin` quedan protegidas; las páginas públicas quedan libres. La lógica pura (permisos, formato de dinero) se prueba con Vitest (TDD); la UI y la base de datos se verifican manualmente con pasos explícitos.

**Tech Stack:** Next.js (App Router) · TypeScript · Tailwind CSS · Supabase (`@supabase/ssr`, `@supabase/supabase-js`) · Vitest · Vercel.

**Testing strategy:** TDD con Vitest para funciones puras (`lib/`). Para componentes/UI y migraciones SQL, cada tarea incluye pasos de **verificación manual** (correr la app o consultar Supabase y confirmar un resultado esperado). No se inventan tests de UI sin valor.

**Alcance de este bloque (Fase 1, Bloque 1 de 4):**
1. **Bloque 1 (este):** setup + base de datos + RLS + login. ← entrega: poder iniciar sesión y ver el panel vacío.
2. Bloque 2: Alumnas + Grupos (CRUD).
3. Bloque 3: Conceptos + Pagos + Estado de cuenta.
4. Bloque 4: Cobro + Asistencia (pantalla diaria).

---

## Estructura de archivos (lo que crea este bloque)

```
E:\MoonDance\
├─ app/
│  ├─ layout.tsx                  (raíz, ya generado por create-next-app)
│  ├─ page.tsx                    (home temporal: link a /login)
│  ├─ login/
│  │  ├─ page.tsx                 (formulario de login)
│  │  └─ actions.ts              (server action: login)
│  └─ admin/
│     ├─ layout.tsx               (protege /admin, nav + datos de usuario)
│     ├─ page.tsx                 (dashboard: "Bienvenida, <nombre>")
│     └─ actions.ts              (server action: signOut)
├─ lib/
│  ├─ supabase/
│  │  ├─ client.ts                (cliente para componentes de navegador)
│  │  ├─ server.ts                (cliente para server components/actions)
│  │  └─ middleware.ts            (refresco de sesión + protección de rutas)
│  ├─ permissions.ts              (reglas de rol — funciones puras)
│  ├─ permissions.test.ts
│  ├─ money.ts                    (formato MXN — función pura)
│  └─ money.test.ts
├─ middleware.ts                  (engancha el refresco de sesión)
├─ supabase/
│  └─ migrations/
│     ├─ 0001_schema.sql          (tablas + tipos)
│     ├─ 0002_security.sql        (RLS + is_duena + trigger de perfiles)
│     └─ 0003_seed.sql            (conceptos por defecto)
├─ vitest.config.ts
├─ .env.local                     (no se commitea)
└─ .env.example
```

---

### Task 1: Inicializar el proyecto Next.js

**Files:**
- Create: todo el scaffold de Next.js en `E:\MoonDance\` (mantiene la carpeta `docs/` existente)
- Modify: `app/page.tsx`

- [ ] **Step 1: Crear la app Next.js en la carpeta del proyecto**

Run (en `E:\MoonDance`):
```
npx create-next-app@latest . --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*"
```
Si pregunta por sobrescribir, acepta. Si avisa que la carpeta no está vacía por `docs/`, continúa (no hay conflicto).
Expected: se generan `app/`, `package.json`, `tsconfig.json`, `tailwind.config.*`, `next.config.*`.

- [ ] **Step 2: Verificar que arranca**

Run:
```
npm run dev
```
Abre `http://localhost:3000`.
Expected: se ve la página por defecto de Next.js. Detén el server (Ctrl+C).

- [ ] **Step 3: Reemplazar el home por uno temporal**

Reemplaza el contenido de `app/page.tsx` por:
```tsx
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-3xl font-bold">MoonDance Studio 🌙</h1>
      <p className="text-gray-500">Sistema de administración (en construcción)</p>
      <Link
        href="/login"
        className="rounded-lg bg-black px-5 py-2.5 text-white hover:opacity-90"
      >
        Iniciar sesión
      </Link>
    </main>
  );
}
```

- [ ] **Step 4: Inicializar git y primer commit**

Run:
```
git init
git add -A
git commit -m "chore: inicializa proyecto Next.js con Tailwind"
```
Expected: commit creado en la rama por defecto.

---

### Task 2: Configurar Vitest

**Files:**
- Create: `vitest.config.ts`
- Modify: `package.json` (scripts)

- [ ] **Step 1: Instalar Vitest**

Run:
```
npm install -D vitest
```

- [ ] **Step 2: Crear la configuración**

Create `vitest.config.ts`:
```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["lib/**/*.test.ts"],
  },
});
```

- [ ] **Step 3: Agregar scripts de test**

En `package.json`, dentro de `"scripts"`, agrega:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 4: Verificar que Vitest corre (sin tests aún)**

Run:
```
npm test
```
Expected: Vitest arranca y reporta "No test files found" (es correcto: aún no hay tests).

- [ ] **Step 5: Commit**

```
git add -A
git commit -m "chore: configura Vitest"
```

---

### Task 3: Clientes de Supabase

**Files:**
- Create: `lib/supabase/client.ts`, `lib/supabase/server.ts`, `.env.local`, `.env.example`

- [ ] **Step 1: Instalar dependencias de Supabase**

Run:
```
npm install @supabase/supabase-js @supabase/ssr
```

- [ ] **Step 2: Crear el proyecto Supabase y obtener credenciales**

Crea un proyecto en Supabase (o usa el MCP de Supabase `create_project`). Anota:
- Project URL (ej. `https://xxxx.supabase.co`)
- Publishable / anon key

- [ ] **Step 3: Crear `.env.local`**

Create `.env.local` (NO se commitea):
```
NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=TU_ANON_O_PUBLISHABLE_KEY
```

- [ ] **Step 4: Crear `.env.example`**

Create `.env.example`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

- [ ] **Step 5: Confirmar que `.env.local` está en `.gitignore`**

`create-next-app` ya incluye `.env*.local` en `.gitignore`. Verifica que aparezca; si no, agrégalo.

- [ ] **Step 6: Cliente de navegador**

Create `lib/supabase/client.ts`:
```ts
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

- [ ] **Step 7: Cliente de servidor**

Create `lib/supabase/server.ts`:
```ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Llamado desde un Server Component: se puede ignorar si hay middleware.
          }
        },
      },
    }
  );
}
```

- [ ] **Step 8: Commit**

```
git add -A
git commit -m "feat: agrega clientes de Supabase (browser y server)"
```

---

### Task 4: Middleware de sesión y protección de rutas

**Files:**
- Create: `lib/supabase/middleware.ts`, `middleware.ts`

- [ ] **Step 1: Helper de refresco de sesión**

Create `lib/supabase/middleware.ts`:
```ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && request.nextUrl.pathname.startsWith("/admin")) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
```

- [ ] **Step 2: Enganchar el middleware**

Create `middleware.ts` (en la raíz):
```ts
import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

- [ ] **Step 3: Verificar protección**

Run `npm run dev` y visita `http://localhost:3000/admin`.
Expected: redirige a `/login` (aún no existe la página → 404 de Next, pero la URL cambia a `/login`). Eso confirma que el guardia funciona. Detén el server.

- [ ] **Step 4: Commit**

```
git add -A
git commit -m "feat: middleware de sesión y protección de /admin"
```

---

### Task 5: Migración del esquema de base de datos

**Files:**
- Create: `supabase/migrations/0001_schema.sql`

- [ ] **Step 1: Escribir el esquema**

Create `supabase/migrations/0001_schema.sql`:
```sql
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
  nombre text not null,
  precio numeric(10,2) not null default 0,
  tipo concept_type not null default 'otro',
  activo boolean not null default true,
  created_at timestamptz not null default now()
);

-- Pagos
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  concept_id uuid not null references public.payment_concepts(id),
  monto numeric(10,2) not null,
  fecha date not null default current_date,
  metodo payment_method not null default 'efectivo',
  nota text,
  registrado_por uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

-- Asistencias (1 por alumna por día)
create table public.attendance (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  fecha date not null default current_date,
  presente boolean not null default true,
  payment_id uuid references public.payments(id) on delete set null,
  registrado_por uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  unique (student_id, fecha)
);

-- Índices útiles
create index idx_students_group on public.students(group_id);
create index idx_payments_student on public.payments(student_id);
create index idx_payments_fecha on public.payments(fecha);
create index idx_attendance_fecha on public.attendance(fecha);
```

- [ ] **Step 2: Aplicar la migración**

Aplícala con el MCP de Supabase (`apply_migration`, name: `0001_schema`) o con la CLI:
```
supabase db push
```

- [ ] **Step 3: Verificar las tablas**

Con el MCP `list_tables` (o en el Table Editor de Supabase).
Expected: aparecen `profiles`, `groups`, `students`, `payment_concepts`, `payments`, `attendance`.

- [ ] **Step 4: Commit**

```
git add -A
git commit -m "feat(db): esquema de Fase 1 (alumnas, grupos, conceptos, pagos, asistencia)"
```

---

### Task 6: Seguridad — RLS, `is_duena()` y trigger de perfiles

**Files:**
- Create: `supabase/migrations/0002_security.sql`

- [ ] **Step 1: Escribir la migración de seguridad**

Create `supabase/migrations/0002_security.sql`:
```sql
-- Crear perfil automáticamente al registrarse un usuario (rol maestro por defecto)
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

-- groups: cualquier staff autenticado puede leer y gestionar
create policy "groups_staff_all" on public.groups
  for all to authenticated
  using (true) with check (true);

-- students: cualquier staff autenticado puede leer y gestionar
create policy "students_staff_all" on public.students
  for all to authenticated
  using (true) with check (true);

-- payment_concepts: todos leen; solo la dueña crea/edita/elimina
create policy "concepts_read" on public.payment_concepts
  for select to authenticated using (true);
create policy "concepts_duena_write" on public.payment_concepts
  for all to authenticated
  using (public.is_duena()) with check (public.is_duena());

-- payments: staff lee y registra; solo la dueña edita/elimina
create policy "payments_staff_read" on public.payments
  for select to authenticated using (true);
create policy "payments_staff_insert" on public.payments
  for insert to authenticated with check (true);
create policy "payments_duena_update" on public.payments
  for update to authenticated using (public.is_duena()) with check (public.is_duena());
create policy "payments_duena_delete" on public.payments
  for delete to authenticated using (public.is_duena());

-- attendance: cualquier staff autenticado puede gestionar
create policy "attendance_staff_all" on public.attendance
  for all to authenticated
  using (true) with check (true);
```

- [ ] **Step 2: Aplicar la migración**

Con el MCP `apply_migration` (name: `0002_security`) o `supabase db push`.

- [ ] **Step 3: Verificar advisors de seguridad**

Con el MCP de Supabase `get_advisors` (type: "security").
Expected: sin advertencias de "RLS disabled" en las tablas públicas.

- [ ] **Step 4: Commit**

```
git add -A
git commit -m "feat(db): RLS por rol, is_duena() y trigger de perfiles"
```

---

### Task 7: Reglas de permisos por rol (TDD)

**Files:**
- Create: `lib/permissions.ts`, `lib/permissions.test.ts`

- [ ] **Step 1: Escribir el test que falla**

Create `lib/permissions.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import {
  canManageConcepts,
  canViewReports,
  canManageUsers,
  canManageStudents,
  canChargeAndAttend,
} from "./permissions";

describe("permisos por rol", () => {
  it("solo la dueña gestiona conceptos/precios", () => {
    expect(canManageConcepts("duena")).toBe(true);
    expect(canManageConcepts("maestro")).toBe(false);
  });

  it("solo la dueña ve reportes globales", () => {
    expect(canViewReports("duena")).toBe(true);
    expect(canViewReports("maestro")).toBe(false);
  });

  it("solo la dueña administra usuarios", () => {
    expect(canManageUsers("duena")).toBe(true);
    expect(canManageUsers("maestro")).toBe(false);
  });

  it("dueña y maestro gestionan alumnas", () => {
    expect(canManageStudents("duena")).toBe(true);
    expect(canManageStudents("maestro")).toBe(true);
  });

  it("dueña y maestro cobran y marcan asistencia", () => {
    expect(canChargeAndAttend("duena")).toBe(true);
    expect(canChargeAndAttend("maestro")).toBe(true);
  });
});
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run:
```
npm test
```
Expected: FAIL — no encuentra el módulo `./permissions`.

- [ ] **Step 3: Implementar**

Create `lib/permissions.ts`:
```ts
export type Rol = "duena" | "maestro";

export function canManageConcepts(rol: Rol): boolean {
  return rol === "duena";
}

export function canViewReports(rol: Rol): boolean {
  return rol === "duena";
}

export function canManageUsers(rol: Rol): boolean {
  return rol === "duena";
}

export function canManageStudents(rol: Rol): boolean {
  return rol === "duena" || rol === "maestro";
}

export function canChargeAndAttend(rol: Rol): boolean {
  return rol === "duena" || rol === "maestro";
}
```

- [ ] **Step 4: Correr el test y verificar que pasa**

Run:
```
npm test
```
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```
git add -A
git commit -m "feat: reglas de permisos por rol (con tests)"
```

---

### Task 8: Formato de dinero MXN (TDD)

**Files:**
- Create: `lib/money.ts`, `lib/money.test.ts`

- [ ] **Step 1: Escribir el test que falla**

Create `lib/money.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { formatMXN } from "./money";

describe("formatMXN", () => {
  it("formatea enteros con dos decimales y signo de pesos", () => {
    expect(formatMXN(150)).toBe("$150.00");
  });

  it("formatea miles con separador", () => {
    expect(formatMXN(1500)).toBe("$1,500.00");
  });

  it("formatea cero", () => {
    expect(formatMXN(0)).toBe("$0.00");
  });
});
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run:
```
npm test
```
Expected: FAIL — no encuentra `./money`.

- [ ] **Step 3: Implementar**

Create `lib/money.ts`:
```ts
const formatter = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  minimumFractionDigits: 2,
});

export function formatMXN(amount: number): string {
  return formatter.format(amount);
}
```

- [ ] **Step 4: Correr el test y verificar que pasa**

Run:
```
npm test
```
Expected: PASS (los 3 nuevos + los 5 de permisos = 8 en total).

- [ ] **Step 5: Commit**

```
git add -A
git commit -m "feat: formato de dinero MXN (con tests)"
```

---

### Task 9: Página de login

**Files:**
- Create: `app/login/page.tsx`, `app/login/actions.ts`

- [ ] **Step 1: Server action de login**

Create `app/login/actions.ts`:
```ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  const supabase = await createClient();
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect("/login?error=" + encodeURIComponent("Correo o contraseña incorrectos"));
  }

  redirect("/admin");
}
```

- [ ] **Step 2: Página de login**

Create `app/login/page.tsx`:
```tsx
import { login } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <form
        action={login}
        className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm border border-gray-100 flex flex-col gap-4"
      >
        <div className="text-center">
          <h1 className="text-2xl font-bold">MoonDance Studio 🌙</h1>
          <p className="text-sm text-gray-500">Acceso para staff</p>
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}

        <label className="flex flex-col gap-1 text-sm">
          Correo
          <input
            name="email"
            type="email"
            required
            className="rounded-lg border border-gray-300 px-3 py-2"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Contraseña
          <input
            name="password"
            type="password"
            required
            className="rounded-lg border border-gray-300 px-3 py-2"
          />
        </label>

        <button
          type="submit"
          className="mt-2 rounded-lg bg-black px-4 py-2.5 text-white hover:opacity-90"
        >
          Entrar
        </button>
      </form>
    </main>
  );
}
```

- [ ] **Step 3: Verificación manual (se completa tras la Task 11)**

Por ahora solo confirma que la página renderiza: `npm run dev` → `http://localhost:3000/login`.
Expected: se ve el formulario. (El login real se prueba en la Task 11, cuando exista la cuenta de la dueña.)

- [ ] **Step 4: Commit**

```
git add -A
git commit -m "feat: página y acción de login"
```

---

### Task 10: Panel de administración protegido

**Files:**
- Create: `app/admin/layout.tsx`, `app/admin/page.tsx`, `app/admin/actions.ts`

- [ ] **Step 1: Server action de cerrar sesión**

Create `app/admin/actions.ts`:
```ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
```

- [ ] **Step 2: Layout protegido con datos del usuario**

Create `app/admin/layout.tsx`:
```tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { signOut } from "./actions";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("nombre, rol")
    .eq("id", user.id)
    .single();

  const nombre = profile?.nombre ?? user.email;
  const rol = profile?.rol ?? "maestro";

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between border-b border-gray-200 px-6 py-3">
        <span className="font-bold">MoonDance Studio 🌙</span>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-600">
            {nombre} · <span className="capitalize">{rol}</span>
          </span>
          <form action={signOut}>
            <button className="rounded-lg border border-gray-300 px-3 py-1.5 hover:bg-gray-50">
              Cerrar sesión
            </button>
          </form>
        </div>
      </header>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
```

- [ ] **Step 3: Dashboard temporal**

Create `app/admin/page.tsx`:
```tsx
import { createClient } from "@/lib/supabase/server";

export default async function AdminHome() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("nombre")
    .eq("id", user!.id)
    .single();

  return (
    <div>
      <h1 className="text-2xl font-bold">
        Bienvenida, {profile?.nombre ?? user!.email} 👋
      </h1>
      <p className="mt-2 text-gray-500">
        Aquí irán Alumnas, Cobro &amp; Asistencia, Pagos y Reportes.
      </p>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```
git add -A
git commit -m "feat: panel admin protegido con datos de usuario y cerrar sesión"
```

---

### Task 11: Seed — cuenta de la dueña y conceptos por defecto

**Files:**
- Create: `supabase/migrations/0003_seed.sql`

- [ ] **Step 1: Conceptos por defecto**

Create `supabase/migrations/0003_seed.sql`:
```sql
-- Conceptos iniciales (la dueña ajusta precios después)
insert into public.payment_concepts (nombre, precio, tipo) values
  ('Clase', 150, 'clase'),
  ('Anualidad', 500, 'anualidad'),
  ('Vestuario', 800, 'vestuario')
on conflict do nothing;
```
Aplícala con el MCP `apply_migration` (name: `0003_seed`) o `supabase db push`.

- [ ] **Step 2: Crear la cuenta de la dueña**

En el dashboard de Supabase → Authentication → Users → **Add user**, crea el usuario con el correo y contraseña de la dueña (marca "Auto Confirm User"). El trigger creará su perfil con rol `maestro`.

- [ ] **Step 3: Promover a dueña**

Ejecuta (MCP `execute_sql` o SQL Editor), sustituyendo el correo:
```sql
update public.profiles
set rol = 'duena', nombre = 'Nombre de la dueña'
where id = (select id from auth.users where email = 'correo-de-la-duena@ejemplo.com');
```

- [ ] **Step 4: Verificación manual del flujo completo**

Run `npm run dev`. Ve a `http://localhost:3000/login`, inicia sesión con la cuenta de la dueña.
Expected:
- Redirige a `/admin`.
- Muestra "Bienvenida, &lt;nombre&gt;" y en el header "&lt;nombre&gt; · Duena".
- El botón "Cerrar sesión" regresa a `/login`.
- Visitar `/admin` sin sesión redirige a `/login`.

- [ ] **Step 5: Commit**

```
git add -A
git commit -m "feat(db): seed de conceptos por defecto"
```

---

### Task 12: Despliegue en Vercel

**Files:** ninguno (configuración de plataforma)

- [ ] **Step 1: Subir el repo y conectar a Vercel**

Sube el repositorio a GitHub y conéctalo en Vercel, o usa el MCP de Vercel (`deploy_to_vercel`).

- [ ] **Step 2: Configurar variables de entorno en Vercel**

Agrega en el proyecto de Vercel:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
(los mismos valores de `.env.local`).

- [ ] **Step 3: Desplegar y verificar**

Lanza el deploy.
Expected: la URL de Vercel abre el home; `/login` funciona y se puede iniciar sesión como la dueña contra el mismo Supabase.

- [ ] **Step 4: Verificación final del bloque**

Confirma la checklist de entrega de Bloque 1:
- [ ] `npm test` pasa (8 tests).
- [ ] Login y logout funcionan en local y en Vercel.
- [ ] `/admin` está protegido.
- [ ] Las 6 tablas existen con RLS activo y sin advisors de seguridad.
- [ ] Existen 3 conceptos por defecto y la cuenta de la dueña tiene rol `duena`.

---

## Fin del Bloque 1

Al terminar, el sistema tiene cimiento, base de datos segura y autenticación. El siguiente plan (**Bloque 2: Alumnas + Grupos**) construye el primer CRUD sobre esta base.
