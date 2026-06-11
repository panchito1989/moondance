import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatMXN } from "@/lib/money";

const WHATSAPP = "5215500000000"; // TODO: número real del estudio
const WA_LINK = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(
  "¡Hola! Quiero información de las clases de MoonDance Studio 🌙"
)}`;

export const revalidate = 300; // refresca eventos cada 5 min

export default async function Home() {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);
  const { data: events } = await supabase
    .from("events")
    .select("titulo, descripcion, precio, fecha, slug")
    .eq("activo", true)
    .or(`fecha.gte.${today},fecha.is.null`)
    .order("fecha", { ascending: true, nullsFirst: false })
    .limit(3);
  const proximos = events ?? [];

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
      <section className="relative px-6 pt-24 pb-28 text-center max-w-4xl mx-auto">
        <div
          aria-hidden
          className="absolute inset-0 -z-0 opacity-30"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(217,70,239,0.35), transparent), radial-gradient(ellipse 50% 40% at 80% 60%, rgba(34,211,238,0.18), transparent)",
          }}
        />
        <div className="relative">
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
        <div className="grid sm:grid-cols-3 gap-5">
          {[
            {
              t: "Ballet",
              d: "Técnica clásica desde nivel inicial. Postura, gracia y disciplina.",
              c: "border-fuchsia-500/40 shadow-[0_0_18px_rgba(217,70,239,0.18)]",
              e: "🩰",
            },
            {
              t: "Jazz / Moderno",
              d: "Energía, estilo y coreografías actuales para brillar en el escenario.",
              c: "border-cyan-400/40 shadow-[0_0_18px_rgba(34,211,238,0.18)]",
              e: "✨",
            },
            {
              t: "Concursos y festivales",
              d: "Preparación para presentaciones, vestuario y experiencia escénica real.",
              c: "border-lime-400/40 shadow-[0_0_18px_rgba(163,230,53,0.18)]",
              e: "🏆",
            },
          ].map((x) => (
            <div key={x.t} className={`rounded-2xl border bg-zinc-950 p-6 ${x.c}`}>
              <div className="text-3xl mb-3">{x.e}</div>
              <h3 className="font-bold text-lg">{x.t}</h3>
              <p className="mt-2 text-sm text-gray-400">{x.d}</p>
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
      <footer className="px-6 py-10 border-t border-zinc-900 text-center text-sm text-gray-600">
        <p>
          MOONDANCE <span className="text-fuchsia-500/70">STUDIO</span> 🌙 —
          Academia de danza
        </p>
        <p className="mt-2">
          <Link href="/login" className="hover:text-gray-400">
            Acceso staff
          </Link>
        </p>
      </footer>
    </main>
  );
}
