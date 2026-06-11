import Link from "next/link";

const WHATSAPP = "5215500000000"; // TODO: número real del estudio

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto">
        <span className="font-bold tracking-wide">
          MOONDANCE <span className="text-fuchsia-500">STUDIO</span> 🌙
        </span>
        <Link
          href="/login"
          className="text-xs text-gray-400 hover:text-fuchsia-400"
        >
          Staff
        </Link>
      </nav>

      {/* Hero */}
      <section className="px-6 py-24 text-center max-w-3xl mx-auto">
        <h1 className="text-5xl sm:text-6xl font-extrabold leading-tight">
          Donde el baile{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 via-purple-400 to-cyan-400">
            brilla de noche
          </span>
        </h1>
        <p className="mt-6 text-lg text-gray-300">
          Academia de danza para niñas y jóvenes. Técnica, confianza y escenario
          — con el sello MoonDance.
        </p>
        <a
          href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(
            "¡Hola! Quiero información de las clases de MoonDance Studio 🌙"
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-8 rounded-xl bg-fuchsia-600 px-8 py-3.5 font-semibold text-white shadow-[0_0_25px_rgba(217,70,239,0.55)] hover:bg-fuchsia-500 transition"
        >
          Pide informes por WhatsApp →
        </a>
      </section>

      {/* Clases */}
      <section className="px-6 py-16 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold mb-8 text-center">
          Nuestras <span className="text-cyan-400">clases</span>
        </h2>
        <div className="grid sm:grid-cols-3 gap-5">
          {[
            {
              t: "Ballet",
              d: "Técnica clásica desde nivel inicial.",
              c: "border-fuchsia-500/40 shadow-[0_0_18px_rgba(217,70,239,0.18)]",
            },
            {
              t: "Jazz / Moderno",
              d: "Energía, estilo y coreografías actuales.",
              c: "border-cyan-400/40 shadow-[0_0_18px_rgba(34,211,238,0.18)]",
            },
            {
              t: "Eventos y concursos",
              d: "Presentaciones, vestuario y escenario real.",
              c: "border-lime-400/40 shadow-[0_0_18px_rgba(163,230,53,0.18)]",
            },
          ].map((x) => (
            <div
              key={x.t}
              className={`rounded-2xl border bg-zinc-950 p-6 ${x.c}`}
            >
              <h3 className="font-bold text-lg">{x.t}</h3>
              <p className="mt-2 text-sm text-gray-400">{x.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Por qué */}
      <section className="px-6 py-16 max-w-3xl mx-auto text-center">
        <h2 className="text-2xl font-bold">
          ¿Por qué <span className="text-fuchsia-500">MoonDance</span>?
        </h2>
        <ul className="mt-6 space-y-3 text-gray-300">
          <li>✨ Grupos por edad y nivel, atención cercana</li>
          <li>🩰 Maestras con experiencia en escenario</li>
          <li>🎭 Festivales y eventos durante el año</li>
        </ul>
      </section>

      {/* Footer / contacto */}
      <footer className="px-6 py-12 border-t border-zinc-800 text-center text-sm text-gray-500">
        <p>
          MoonDance Studio 🌙 ·{" "}
          <a
            href={`https://wa.me/${WHATSAPP}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:underline"
          >
            WhatsApp
          </a>
        </p>
        <p className="mt-2">
          <Link href="/login" className="hover:text-gray-300">
            Acceso staff
          </Link>
        </p>
      </footer>
    </main>
  );
}
