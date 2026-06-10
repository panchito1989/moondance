import { createClient } from "@/lib/supabase/server";

export default async function AdminHome() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null; // El layout ya protege; esto solo acota el tipo.

  const { data: profile } = await supabase
    .from("profiles")
    .select("nombre")
    .eq("id", user.id)
    .single();

  return (
    <div>
      <h1 className="text-2xl font-bold">
        Bienvenida, {profile?.nombre ?? user.email} 👋
      </h1>
      <p className="mt-2 text-gray-500">
        Aquí irán Alumnas, Cobro &amp; Asistencia, Pagos y Reportes.
      </p>
    </div>
  );
}
