import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AdminHome() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null; // El layout ya protege; esto solo acota el tipo.

  const [{ data: profile }, { count: nAlumnas }, { count: nGrupos }] =
    await Promise.all([
      supabase.from("profiles").select("nombre").eq("id", user.id).single(),
      supabase.from("students").select("*", { count: "exact", head: true }),
      supabase.from("groups").select("*", { count: "exact", head: true }),
    ]);

  return (
    <div>
      <h1 className="text-2xl font-bold">
        Bienvenida, {profile?.nombre ?? user.email} 👋
      </h1>
      <p className="mt-2 text-gray-500">Panel de MoonDance Studio.</p>

      <div className="mt-6 grid sm:grid-cols-2 gap-4 max-w-xl">
        <Link
          href="/admin/alumnas"
          className="rounded-xl border border-gray-200 p-5 hover:bg-gray-50"
        >
          <div className="text-3xl font-bold">{nAlumnas ?? 0}</div>
          <div className="text-gray-600">Alumnas →</div>
        </Link>
        <Link
          href="/admin/grupos"
          className="rounded-xl border border-gray-200 p-5 hover:bg-gray-50"
        >
          <div className="text-3xl font-bold">{nGrupos ?? 0}</div>
          <div className="text-gray-600">Grupos →</div>
        </Link>
      </div>

      <p className="mt-8 text-sm text-gray-400">
        Próximamente: Cobro &amp; Asistencia, Pagos y Eventos.
      </p>
    </div>
  );
}
