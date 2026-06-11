import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { formatMXN } from "@/lib/money";

type Props = { params: Promise<{ slug: string }> };

async function getEvent(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("events")
    .select("titulo, descripcion, precio, fecha, slug, activo")
    .eq("slug", slug)
    .eq("activo", true)
    .maybeSingle();
  return data;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEvent(slug);
  if (!event) return { title: "Evento no encontrado" };
  return {
    title: `${event.titulo} · MoonDance Studio`,
    description:
      event.descripcion ??
      `Evento de MoonDance Studio${event.fecha ? ` · ${event.fecha}` : ""}`,
  };
}

export default async function EventoPage({ params }: Props) {
  const { slug } = await params;
  const event = await getEvent(slug);
  if (!event) notFound();

  return (
    <main className="min-h-screen bg-black text-white flex flex-col">
      <nav className="px-6 py-4 max-w-3xl mx-auto w-full">
        <Link href="/" className="font-bold tracking-wide text-sm">
          MOONDANCE <span className="text-fuchsia-500">STUDIO</span> 🌙
        </Link>
      </nav>

      <section className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="max-w-xl w-full text-center rounded-3xl border border-fuchsia-500/40 bg-zinc-950 p-10 shadow-[0_0_40px_rgba(217,70,239,0.25)]">
          <p className="text-xs tracking-[0.3em] text-cyan-400 mb-4">
            EVENTO ESPECIAL
          </p>
          <h1 className="text-4xl font-extrabold leading-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 via-purple-400 to-cyan-400">
              {event.titulo}
            </span>
          </h1>
          {event.fecha && (
            <p className="mt-4 text-lg text-gray-300">📅 {event.fecha}</p>
          )}
          {Number(event.precio) > 0 && (
            <p className="mt-2 text-3xl font-bold text-lime-400">
              {formatMXN(Number(event.precio))}
            </p>
          )}
          {event.descripcion && (
            <p className="mt-4 text-gray-400">{event.descripcion}</p>
          )}
          <p className="mt-8 text-sm text-gray-500">
            Informes y reservación con tu maestra 🌙
          </p>
        </div>
      </section>

      <footer className="px-6 py-8 text-center text-xs text-gray-600">
        MoonDance Studio 🌙
      </footer>
    </main>
  );
}
