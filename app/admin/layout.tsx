import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
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
        <div className="flex items-center gap-6">
          <Link href="/admin" className="font-bold">
            MoonDance Studio 🌙
          </Link>
          <nav className="flex gap-4 text-sm text-gray-600">
            <Link href="/admin/cobro" className="hover:text-black">
              Cobro
            </Link>
            <Link href="/admin/alumnas" className="hover:text-black">
              Alumnas
            </Link>
            <Link href="/admin/grupos" className="hover:text-black">
              Grupos
            </Link>
            <Link href="/admin/conceptos" className="hover:text-black">
              Conceptos
            </Link>
            <Link href="/admin/eventos" className="hover:text-black">
              Eventos
            </Link>
            {rol === "duena" && (
              <Link href="/admin/reportes" className="hover:text-black">
                Reportes
              </Link>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/admin/cuenta" className="text-gray-600 hover:text-black">
            {nombre} · <span className="capitalize">{rol}</span> ⚙
          </Link>
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
