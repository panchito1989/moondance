# MoonDance Studio — Sistema de gestión · Documento de diseño

- **Fecha:** 2026-06-10
- **Estado:** Diseño aprobado por el cliente. Pendiente: plan de implementación.
- **Autor:** Issac (con Claude Code)

---

## 1. Objetivo

App web para la academia de baile **MoonDance Studio** que combine:

1. Una **landing page** pública (la cara del estudio).
2. Un **panel de administración** para la dueña y los maestros, con control de **cobro por clase**, **asistencia**, **conceptos de pago configurables** y **eventos** con difusión por WhatsApp.

El sistema lo usan **solo la dueña y los maestros**. Los papás y alumnas **no inician sesión**: únicamente ven las páginas públicas y reciben mensajes por WhatsApp.

---

## 2. Stack técnico

| Pieza | Tecnología |
|-------|-----------|
| Frontend / web | Next.js (App Router) |
| Hosting | Vercel |
| Base de datos | Supabase (PostgreSQL) |
| Autenticación | Supabase Auth |
| Almacenamiento de imágenes | Supabase Storage |
| Estilo de la landing | **Negro + colores neón** |

Razón de Supabase sobre Firebase: los datos son **relacionales** (alumnas ↔ grupos ↔ asistencias ↔ pagos) y se necesitan reportes tipo "quién no ha pagado" / "asistencia del grupo X", que en SQL salen en una sola consulta. Además el tooling de Supabase y Vercel ya está conectado.

---

## 3. Usuarios y roles

| Rol | Permisos |
|-----|----------|
| **Dueña** | Todo: configura conceptos y precios, ve reportes, administra maestros, gestiona alumnas, cobra, marca asistencia, crea eventos. |
| **Maestro** | Cobra la clase, marca asistencia y da de alta/edita alumnas. **No** cambia precios/conceptos, **no** ve reportes globales, **no** administra usuarios. |
| **Papás / alumnas** | No usan el sistema. Solo ven landing y páginas de evento; reciben WhatsApp. |

---

## 4. Modelo de cobro

- **Pago por clase**: monto fijo por clase. Cada vez que la alumna asiste, se cobra esa clase.
- **Conceptos adicionales** (se cobran solo cuando se solicitan): **Anualidad**, **Vestuario**, **Eventos**.
- **Conceptos personalizados**: la dueña puede **crear, editar y eliminar** conceptos y fijarles precio.
- **Registro manual**: el pago se marca a mano (efectivo / transferencia). No hay pasarela de pago en línea.
- Cada alumna tiene un **estado de cuenta**: qué ha pagado y qué debe.

---

## 5. Flujo principal — Cobro + Asistencia (el corazón)

La pantalla más usada. Flujo diario:

1. El maestro abre la vista **"Hoy"**.
2. (Opcional) filtra por grupo/clase.
3. Por cada alumna: **registra el pago de la clase** y **marca asistencia** en un mismo paso.

Cobro y asistencia van **acoplados**: marcar asistencia ocurre junto con (o justo después de) cobrar.

---

## 6. Módulos

### Público (sin login)
- **Landing page** — presentación de MoonDance Studio: qué es, clases/horarios, galería, contacto, botón de WhatsApp. Estética **negro + neón**.
- **Página de evento** — una por cada evento creado; provee la vista previa (Open Graph) que se ve al compartir el link por WhatsApp.

### Administración (dueña + maestros)
- **Login** — Supabase Auth para dueña y maestros.
- **Alumnas** — alta/edición: nombre, tutor, teléfono, grupo/clase, notas, estado (activa/inactiva).
- **Cobro + Asistencia** ⭐ — el flujo de la sección 5.
- **Pagos & Conceptos** — gestión de conceptos y precios (solo dueña) + registro de pagos + estado de cuenta por alumna.
- **Eventos + WhatsApp** — creación de eventos y difusión (sección 7).
- **Reportes** — ingresos del día/mes, adeudos (ej. anualidad pendiente), asistencias.

---

## 7. Eventos + WhatsApp

1. La dueña crea un evento: **título, descripción, precio, fecha**.
2. Se arma un **flyer con la plantilla del estudio** (datos sobre un diseño fijo y legible; render HTML → imagen). La dueña escribe los datos, no diseña.
3. Se publica una **página pública del evento** con metadatos Open Graph (el flyer como imagen de preview).
4. Botón **"Compartir por WhatsApp"** → abre WhatsApp (`wa.me`) con el **texto ya escrito + link del evento**. La dueña **elige el grupo y da enviar**. El flyer aparece como **vista previa del link**.

> **Nota técnica:** WhatsApp NO permite que un botón envíe automáticamente un mensaje a un grupo. Por eso el flujo es "texto pre-armado + la dueña elige el grupo". La WhatsApp Business API (envío automatizado) queda fuera de alcance por ahora (de paga, requiere aprobación de Meta).

---

## 8. Modelo de datos (tablas Supabase)

| Tabla | Campos principales |
|-------|--------------------|
| `profiles` | `id` (→ `auth.users`), `nombre`, `rol` (`duena` \| `maestro`) |
| `groups` | `id`, `nombre`, `horario`/descripción *(opcional; alumna puede no tener grupo)* |
| `students` | `id`, `nombre`, `tutor`, `telefono`, `group_id` (nullable), `notas`, `activa` |
| `payment_concepts` | `id`, `nombre`, `precio`, `tipo` (`clase` \| `anualidad` \| `vestuario` \| `evento` \| `otro`), `activo` |
| `payments` | `id`, `student_id`, `concept_id`, `monto`, `fecha`, `registrado_por` (→ profiles), `metodo`, `nota` |
| `attendance` | `id`, `student_id`, `fecha`, `presente`, `registrado_por`, `payment_id` (nullable) |
| `events` | `id`, `titulo`, `descripcion`, `precio`, `fecha`, `slug`, `flyer_url`, `creado_por` |

**Seguridad (RLS):** políticas por rol — la dueña accede a todo; el maestro a alumnas/pagos/asistencias (crear/leer), sin conceptos/precios, reportes globales ni gestión de usuarios.

---

## 9. Fases de construcción

1. **Fase 1 — núcleo operativo (lo más urgente):**
   login + alumnas + grupos + Cobro&Asistencia + Pagos/Conceptos + estado de cuenta.
   *Le sirve a la dueña desde el día 1.*
2. **Fase 2 — difusión:** Eventos + flyer con plantilla + página pública + botón WhatsApp.
3. **Fase 3 — imagen pública y análisis:** Landing (negro + neón) + galería + reportes finos.

---

## 10. Fuera de alcance (YAGNI)

- Portal/login para papás o alumnas.
- Pagos en línea / pasarela (el cobro es manual).
- WhatsApp Business API (envío automatizado).
- App móvil nativa (la web será responsive).

---

## 11. Decisiones abiertas / a confirmar al construir

- **Grupos/clases:** soportados y opcionales. Falta que el cliente pase los nombres reales de los grupos/horarios para cargarlos en Fase 1.
- **Paleta neón exacta** de la landing (ej. verde/cian/magenta sobre negro): se define al diseñar la Fase 3.
