import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { signOut } from "./actions";

const NAV = [
  { href: "/admin", label: "Inicio", icon: "🏠" },
  { href: "/admin/cobro", label: "Cobro & Asistencia", icon: "💸" },
  { href: "/admin/alumnas", label: "Alumnas", icon: "👧" },
  { href: "/admin/grupos", label: "Grupos", icon: "👯" },
  { href: "/admin/conceptos", label: "Conceptos", icon: "💲" },
  { href: "/admin/eventos", label: "Eventos", icon: "🎉" },
];

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
  const nav =
    rol === "duena"
      ? [...NAV, { href: "/admin/reportes", label: "Reportes", icon: "📊" }]
      : NAV;

  return (
    <div className="min-h-screen md:flex bg-black">
      {/* Sidebar (escritorio) */}
      <aside className="hidden md:flex md:flex-col w-64 shrink-0 border-r border-zinc-800 bg-zinc-900 min-h-screen sticky top-0 max-h-screen">
        <Link href="/admin" className="px-6 py-5 font-bold text-lg border-b border-zinc-800">
          MoonDance <span className="text-fuchsia-600">Studio</span> 🌙
        </Link>
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-[15px] text-gray-300 hover:bg-fuchsia-500/10 hover:text-fuchsia-400 transition"
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-zinc-800 p-4">
          <Link
            href="/admin/cuenta"
            className="block rounded-xl px-4 py-2 hover:bg-zinc-800"
          >
            <div className="font-medium text-sm truncate">{nombre}</div>
            <div className="text-xs text-gray-400 capitalize">{rol} · Mi cuenta ⚙</div>
          </Link>
          <form action={signOut} className="mt-2">
            <button className="w-full rounded-xl border border-zinc-800 px-4 py-2 text-sm text-gray-300 hover:bg-zinc-800">
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>

      {/* Barra superior (móvil) */}
      <div className="md:hidden sticky top-0 z-10 bg-zinc-900 border-b border-zinc-800">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/admin" className="font-bold">
            MoonDance 🌙
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <Link href="/admin/cuenta" className="text-gray-300">
              {nombre} ⚙
            </Link>
            <form action={signOut}>
              <button className="rounded-lg border border-zinc-700 px-2.5 py-1 text-xs">
                Salir
              </button>
            </form>
          </div>
        </div>
        <nav className="flex gap-1 px-2 pb-2 overflow-x-auto text-sm">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap rounded-lg px-3 py-1.5 text-gray-300 hover:bg-zinc-800"
            >
              {item.icon} {item.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Contenido */}
      <main className="flex-1 min-w-0 p-5 md:p-10">{children}</main>
    </div>
  );
}
