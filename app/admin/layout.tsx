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
