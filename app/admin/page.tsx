import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatMXN } from "@/lib/money";

export default async function AdminHome() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null; // El layout ya protege; esto solo acota el tipo.

  const hoy = new Date().toISOString().slice(0, 10);

  const [
    { data: profile },
    { count: nAlumnas },
    { count: nGrupos },
    { count: asistHoy },
    { data: pagosHoy },
  ] = await Promise.all([
    supabase.from("profiles").select("nombre, rol").eq("id", user.id).single(),
    supabase
      .from("students")
      .select("*", { count: "exact", head: true })
      .eq("activa", true),
    supabase
      .from("groups")
      .select("*", { count: "exact", head: true })
      .eq("activo", true),
    supabase
      .from("attendance")
      .select("*", { count: "exact", head: true })
      .eq("fecha", hoy)
      .eq("presente", true),
    supabase.from("payments").select("monto").eq("fecha", hoy),
  ]);

  const ingresosHoy = (pagosHoy ?? []).reduce(
    (s, p) => s + Number(p.monto),
    0
  );

  const stats = [
    { label: "Alumnas activas", value: String(nAlumnas ?? 0), icon: "👧" },
    { label: "Grupos activos", value: String(nGrupos ?? 0), icon: "👯" },
    { label: "Asistencias hoy", value: String(asistHoy ?? 0), icon: "✅" },
    { label: "Ingresos hoy", value: formatMXN(ingresosHoy), icon: "💵" },
  ];

  const modules = [
    {
      href: "/admin/alumnas",
      t: "Alumnas",
      d: "Alta, datos y estado de cuenta",
      icon: "👧",
    },
    {
      href: "/admin/grupos",
      t: "Grupos",
      d: "Clases y horarios",
      icon: "👯",
    },
    {
      href: "/admin/conceptos",
      t: "Conceptos",
      d: "Precios: clase, anualidad, vestuario…",
      icon: "💲",
    },
    {
      href: "/admin/eventos",
      t: "Eventos",
      d: "Crear y compartir por WhatsApp",
      icon: "🎉",
    },
  ];
  if (profile?.rol === "duena") {
    modules.push({
      href: "/admin/reportes",
      t: "Reportes",
      d: "Ingresos, asistencias y adeudos",
      icon: "📊",
    });
  }

  return (
    <div className="max-w-6xl">
      <h1 className="text-3xl font-bold">
        Bienvenida, {profile?.nombre ?? user.email} 👋
      </h1>
      <p className="mt-1 text-gray-400">
        {new Date().toLocaleDateString("es-MX", {
          weekday: "long",
          day: "numeric",
          month: "long",
        })}
      </p>

      <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6"
          >
            <div className="text-2xl">{s.icon}</div>
            <div className="mt-2 text-3xl font-bold">{s.value}</div>
            <div className="text-sm text-gray-400">{s.label}</div>
          </div>
        ))}
      </div>

      <Link
        href="/admin/cobro"
        className="mt-6 flex items-center justify-between rounded-2xl bg-gradient-to-r from-fuchsia-600 to-purple-700 text-white p-7 shadow-[0_0_25px_rgba(217,70,239,0.35)] hover:from-fuchsia-500 hover:to-purple-600 transition"
      >
        <div>
          <div className="text-xl font-semibold">
            💸 Cobro &amp; Asistencia de hoy
          </div>
          <div className="text-sm text-gray-300 mt-1">
            Cobra la clase y marca asistencia en un toque.
          </div>
        </div>
        <span className="text-3xl">→</span>
      </Link>

      <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map((m) => (
          <Link
            key={m.href}
            href={m.href}
            className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6 hover:border-fuchsia-500 hover:shadow-sm transition"
          >
            <div className="text-2xl">{m.icon}</div>
            <div className="mt-2 font-semibold">{m.t}</div>
            <div className="text-sm text-gray-400 mt-1">{m.d}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
