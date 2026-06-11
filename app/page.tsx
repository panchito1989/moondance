import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { formatMXN } from "@/lib/money";

const WHATSAPP = "5215500000000"; // TODO: número real del estudio
const WA_LINK = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(
  "¡Hola! Quiero información de las clases de MoonDance Studio 🌙"
)}`;

import { sendInvitation } from "./invitar-action";
import GaleriaLightbox from "./galeria-lightbox";

export const revalidate = 300; // refresca eventos cada 5 min

const DEMO_FOTOS = [
  "/galeria/g1.jpg",
  "/galeria/g2.jpg",
  "/galeria/g3.jpg",
  "/galeria/g4.jpg",
  "/galeria/g5.jpg",
  "/galeria/g6.jpg",
];

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ invitacion?: string }>;
}) {
  const { invitacion } = await searchParams;
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);
  const [{ data: events }, { data: fotos, count: totalFotos }, { data: logros }] =
    await Promise.all([
      supabase
        .from("events")
        .select("titulo, descripcion, precio, fecha, slug")
        .eq("activo", true)
        .or(`fecha.gte.${today},fecha.is.null`)
        .order("fecha", { ascending: true, nullsFirst: false })
        .limit(3),
      supabase
        .from("gallery_photos")
        .select("url, titulo", { count: "exact" })
        .order("created_at", { ascending: false })
        .limit(9),
      supabase
        .from("achievements")
        .select("titulo, descripcion, anio")
        .eq("activo", true)
        .order("created_at", { ascending: false })
        .limit(6),
    ]);
  const proximos = events ?? [];
  const fotosReales = fotos ?? [];
  const usaDemo = fotosReales.length === 0;
  const galeria = usaDemo
    ? DEMO_FOTOS.map((src) => ({ url: src, titulo: null as string | null }))
    : fotosReales;
  const reconocimientos = logros ?? [];

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Nav */}
      <nav className="sticky top-0 z-10 bg-black/85 backdrop-blur border-b border-zinc-900">
        <div className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto">
          <span className="font-bold tracking-wide">
            MOONDANCE <span className="text-fuchsia-500">STUDIO</span> 🌙
          </span>
          <div className="flex items-center gap-5 text-sm text-gray-300">
            <a href="#clases" className="hover:text-fuchsia-400 hidden sm:inline">
              Clases
            </a>
            <a href="#eventos" className="hover:text-fuchsia-400 hidden sm:inline">
              Eventos
            </a>
            <a href="#galeria" className="hover:text-fuchsia-400 hidden sm:inline">
              Galería
            </a>
            <a href="#contacto" className="hover:text-fuchsia-400 hidden sm:inline">
              Contacto
            </a>
            <Link href="/login" className="text-xs text-gray-500 hover:text-fuchsia-400">
              Staff
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <Image
          src="/hero.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-40"
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.55), rgba(0,0,0,0.35) 50%, #000 100%), radial-gradient(ellipse 60% 50% at 50% 0%, rgba(217,70,239,0.30), transparent), radial-gradient(ellipse 50% 40% at 80% 60%, rgba(34,211,238,0.15), transparent)",
          }}
        />
        <div className="relative px-6 pt-28 pb-32 text-center max-w-4xl mx-auto">
          <p className="text-xs tracking-[0.4em] text-cyan-400 mb-6">
            ACADEMIA DE DANZA
          </p>
          <h1 className="text-5xl sm:text-7xl font-extrabold leading-tight">
            Donde el baile{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 via-purple-400 to-cyan-400">
              brilla de noche
            </span>
          </h1>
          <p className="mt-6 text-lg text-gray-300 max-w-2xl mx-auto">
            Formamos bailarinas con técnica, disciplina y amor por el escenario.
            Grupos por edad y nivel, en un ambiente cercano y divertido.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <a
              href={WA_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl bg-fuchsia-600 px-8 py-3.5 font-semibold shadow-[0_0_25px_rgba(217,70,239,0.55)] hover:bg-fuchsia-500 transition"
            >
              Pide informes por WhatsApp →
            </a>
            <a
              href="#clases"
              className="rounded-xl border border-cyan-400/50 px-8 py-3.5 font-semibold text-cyan-300 hover:bg-cyan-400/10 transition"
            >
              Ver clases
            </a>
          </div>
        </div>
      </section>

      {/* Clases */}
      <section id="clases" className="px-6 py-20 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold mb-2 text-center">
          Nuestras <span className="text-cyan-400">clases</span>
        </h2>
        <p className="text-gray-400 text-center mb-10">
          Pregunta por horarios y grupos disponibles para tu edad.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            {
              t: "Baby Ballet",
              d: "Primeros pasos para las más pequeñas: ritmo, coordinación y diversión.",
              c: "border-fuchsia-500/40 shadow-[0_0_18px_rgba(217,70,239,0.18)]",
              e: "🎀",
              img: "/clases/babyballet.jpg",
            },
            {
              t: "Ballet",
              d: "Técnica clásica desde nivel inicial. Postura, gracia y disciplina.",
              c: "border-purple-400/40 shadow-[0_0_18px_rgba(168,85,247,0.18)]",
              e: "🩰",
              img: "/clases/ballet.jpg",
            },
            {
              t: "K-Pop",
              d: "Coreografías de tus grupos favoritos, energía idol y mucho estilo.",
              c: "border-cyan-400/40 shadow-[0_0_18px_rgba(34,211,238,0.18)]",
              e: "🎤",
              img: "/clases/kpop.jpg",
            },
            {
              t: "Jazz / Moderno",
              d: "Energía, estilo y coreografías actuales para brillar en el escenario.",
              c: "border-lime-400/40 shadow-[0_0_18px_rgba(163,230,53,0.18)]",
              e: "✨",
              img: "/clases/jazz.jpg",
            },
          ].map((x) => (
            <div
              key={x.t}
              className={`rounded-2xl border bg-zinc-950 overflow-hidden ${x.c}`}
            >
              <div className="relative h-44 w-full">
                <Image
                  src={x.img}
                  alt={`Clase de ${x.t}`}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
                <div className="absolute bottom-2 left-3 text-2xl">{x.e}</div>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-lg">{x.t}</h3>
                <p className="mt-2 text-sm text-gray-400">{x.d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Eventos próximos (en vivo desde la base de datos) */}
      {proximos.length > 0 && (
        <section id="eventos" className="px-6 py-20 max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold mb-2 text-center">
            Próximos <span className="text-fuchsia-500">eventos</span>
          </h2>
          <p className="text-gray-400 text-center mb-10">
            No te pierdas lo que viene en MoonDance.
          </p>
          <div className="grid sm:grid-cols-3 gap-5">
            {proximos.map((e) => (
              <Link
                key={e.slug}
                href={`/evento/${e.slug}`}
                className="rounded-2xl border border-purple-500/40 bg-zinc-950 p-6 hover:border-fuchsia-500 transition shadow-[0_0_18px_rgba(168,85,247,0.15)]"
              >
                <p className="text-xs tracking-[0.25em] text-cyan-400 mb-2">
                  {e.fecha ? `📅 ${e.fecha}` : "PRÓXIMAMENTE"}
                </p>
                <h3 className="font-bold text-lg">{e.titulo}</h3>
                {Number(e.precio) > 0 && (
                  <p className="mt-2 text-lime-400 font-semibold">
                    {formatMXN(Number(e.precio))}
                  </p>
                )}
                {e.descripcion && (
                  <p className="mt-2 text-sm text-gray-400 line-clamp-2">
                    {e.descripcion}
                  </p>
                )}
                <p className="mt-3 text-sm text-fuchsia-400">Ver más →</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Galería */}
      <section id="galeria" className="px-6 py-20 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold mb-2 text-center">
          Nuestra <span className="text-lime-400">galería</span>
        </h2>
        <p className="text-gray-400 text-center mb-10 text-sm">
          Momentos que brillan. ✨{" "}
          {usaDemo && (
            <span className="text-gray-600">(fotos de demostración)</span>
          )}
        </p>
        <GaleriaLightbox fotos={galeria} />
        {(totalFotos ?? 0) > 9 && (
          <div className="text-center mt-8">
            <Link
              href="/galeria"
              className="inline-block rounded-xl border border-lime-400/50 px-8 py-3 font-semibold text-lime-300 hover:bg-lime-400/10 transition"
            >
              Ver toda la galería ({totalFotos} fotos) →
            </Link>
          </div>
        )}
      </section>

      {/* Logros y reconocimientos */}
      {reconocimientos.length > 0 && (
        <section id="logros" className="px-6 py-20 max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold mb-2 text-center">
            Logros y <span className="text-amber-400">reconocimientos</span>
          </h2>
          <p className="text-gray-400 text-center mb-10 text-sm">
            El esfuerzo de nuestras alumnas brilla en el escenario. 🏆
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {reconocimientos.map((l) => (
              <div
                key={l.titulo}
                className="rounded-2xl border border-amber-400/30 bg-zinc-950 p-6 shadow-[0_0_18px_rgba(251,191,36,0.12)]"
              >
                <div className="text-3xl mb-3">🏆</div>
                <h3 className="font-bold">
                  {l.titulo}
                  {l.anio && (
                    <span className="ml-2 text-xs text-amber-400">{l.anio}</span>
                  )}
                </h3>
                {l.descripcion && (
                  <p className="mt-2 text-sm text-gray-400">{l.descripcion}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Invítanos a tu evento */}
      <section
        id="invitar"
        className="px-6 py-20 bg-zinc-950/60 border-y border-zinc-900"
      >
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-3xl font-bold">
            ¿Quieres a MoonDance en{" "}
            <span className="text-fuchsia-500">tu evento</span>?
          </h2>
          <p className="mt-3 text-gray-400 text-sm">
            Llevamos presentaciones y exhibiciones a festivales, escuelas y
            eventos. Cuéntanos y te contactamos. 💌
          </p>

          {invitacion === "ok" && (
            <p className="mt-6 rounded-lg bg-green-500/10 border border-green-500/40 px-4 py-3 text-sm text-green-400">
              ¡Gracias! Recibimos tu invitación y te contactaremos pronto. 🌙
            </p>
          )}
          {invitacion === "error" && (
            <p className="mt-6 rounded-lg bg-red-500/10 border border-red-500/40 px-4 py-3 text-sm text-red-400">
              No pudimos enviar tu mensaje. Revisa tus datos o escríbenos por
              WhatsApp.
            </p>
          )}

          <form
            action={sendInvitation}
            className="mt-8 grid gap-3 text-left rounded-2xl border border-zinc-800 bg-zinc-950 p-6"
          >
            <input
              type="text"
              name="web"
              tabIndex={-1}
              autoComplete="off"
              className="hidden"
              aria-hidden="true"
            />
            <input
              name="nombre"
              required
              placeholder="Tu nombre *"
              className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm"
            />
            <input
              name="contacto"
              required
              placeholder="Tu teléfono o correo *"
              className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm"
            />
            <textarea
              name="mensaje"
              rows={3}
              placeholder="Cuéntanos del evento: fecha, lugar, tipo de presentación…"
              className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm"
            />
            <button className="rounded-xl bg-fuchsia-600 px-6 py-3 font-semibold shadow-[0_0_20px_rgba(217,70,239,0.4)] hover:bg-fuchsia-500 transition">
              Enviar invitación ✨
            </button>
          </form>
        </div>
      </section>

      {/* Por qué */}
      <section className="px-6 py-20 bg-zinc-950/60 border-y border-zinc-900">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center">
            ¿Por qué <span className="text-fuchsia-500">MoonDance</span>?
          </h2>
          <div className="mt-10 grid sm:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl mb-3">💜</div>
              <h3 className="font-semibold">Atención cercana</h3>
              <p className="mt-2 text-sm text-gray-400">
                Grupos reducidos por edad y nivel; cada alumna avanza a su ritmo.
              </p>
            </div>
            <div>
              <div className="text-4xl mb-3">🎭</div>
              <h3 className="font-semibold">Escenario real</h3>
              <p className="mt-2 text-sm text-gray-400">
                Festivales y eventos durante el año para perder el miedo y brillar.
              </p>
            </div>
            <div>
              <div className="text-4xl mb-3">🌙</div>
              <h3 className="font-semibold">Comunidad</h3>
              <p className="mt-2 text-sm text-gray-400">
                Más que clases: amistades, confianza y amor por la danza.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contacto */}
      <section id="contacto" className="px-6 py-24 text-center max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold">
          ¿Lista para <span className="text-cyan-400">bailar</span>?
        </h2>
        <p className="mt-4 text-gray-300">
          Escríbenos y te contamos horarios, precios y cómo apartar tu lugar.
          La primera clase muestra es con gusto. 💫
        </p>
        <a
          href={WA_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-8 rounded-xl bg-green-600 px-10 py-4 font-semibold shadow-[0_0_25px_rgba(22,163,74,0.5)] hover:bg-green-500 transition"
        >
          💬 WhatsApp del estudio
        </a>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950">
        <div className="max-w-5xl mx-auto px-6 py-14 grid sm:grid-cols-3 gap-10">
          <div>
            <p className="font-bold tracking-wide">
              MOONDANCE <span className="text-fuchsia-500">STUDIO</span> 🌙
            </p>
            <p className="mt-3 text-sm text-gray-400">
              Academia de danza para niñas y jóvenes. Técnica, confianza y
              escenario.
            </p>
            <p className="mt-4 text-sm text-gray-500">
              ✨ Baby Ballet · Ballet · K-Pop · Jazz
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-300 mb-3 tracking-wider">
              EXPLORA
            </p>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a href="#clases" className="hover:text-fuchsia-400">
                  Clases
                </a>
              </li>
              <li>
                <a href="#eventos" className="hover:text-fuchsia-400">
                  Eventos
                </a>
              </li>
              <li>
                <a href="#contacto" className="hover:text-fuchsia-400">
                  Contacto
                </a>
              </li>
              <li>
                <Link href="/login" className="hover:text-fuchsia-400">
                  Acceso staff
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-300 mb-3 tracking-wider">
              CONTACTO
            </p>
            <a
              href={WA_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded-lg bg-green-600/90 px-4 py-2 text-sm font-medium hover:bg-green-500"
            >
              💬 WhatsApp
            </a>
            <p className="mt-4 text-sm text-gray-500">
              Pregunta por horarios y tu clase muestra. 💫
            </p>
          </div>
        </div>
        <div className="border-t border-zinc-900">
          <div className="max-w-5xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-600">
            <p>
              © {new Date().getFullYear()} MoonDance Studio · Hecho con 💜
            </p>
            <p className="text-[10px] text-gray-700">
              Fotos de demostración:{" "}
              <Link href="/creditos" className="underline hover:text-gray-500">
                créditos
              </Link>
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
