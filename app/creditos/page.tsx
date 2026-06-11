import Link from "next/link";

export const metadata = {
  title: "Créditos de fotos · MoonDance Studio",
};

const CREDITS = [
  {
    foto: "Hero (zapatillas de ballet)",
    autor: "Lambtron",
    licencia: "CC BY-SA 4.0",
  },
  { foto: "Baby Ballet", autor: "Tommy Wong", licencia: "CC BY 2.0" },
  { foto: "Ballet (clase)", autor: "Andrey Trubin", licencia: "CC BY 4.0" },
  { foto: "K-Pop (concierto)", autor: "—", licencia: "CC0 (dominio público)" },
  { foto: "Jazz / Moderno", autor: "Joe Mabel", licencia: "CC BY-SA 3.0" },
  {
    foto: "Galería 1 y 2 (recital)",
    autor: "John Trainor (Roswell, GA, USA)",
    licencia: "CC BY 2.0",
  },
  { foto: "Galería 3 (hip hop)", autor: "Hansfotos", licencia: "CC BY-SA 4.0" },
  {
    foto: "Galería 4 (Don Quijote, Teatro Teresa Carreño)",
    autor: "—",
    licencia: "CC0 (dominio público)",
  },
  {
    foto: "Galería 5 (grand jeté)",
    autor: "jeff medaugh (Denver, US)",
    licencia: "CC BY-SA 2.0",
  },
  { foto: "Galería 6 (bailarina)", autor: "Stano Novak", licencia: "CC BY 2.5" },
];

export default function CreditosPage() {
  return (
    <main className="min-h-screen bg-black text-white px-6 py-16">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="text-sm text-gray-400 hover:text-white">
          ← Volver
        </Link>
        <h1 className="text-3xl font-bold mt-2 mb-2">Créditos de fotos</h1>
        <p className="text-gray-400 text-sm mb-8">
          Las fotos de demostración de este sitio provienen de{" "}
          <a
            href="https://commons.wikimedia.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:underline"
          >
            Wikimedia Commons
          </a>{" "}
          bajo licencias Creative Commons. Serán reemplazadas por fotos del
          estudio.
        </p>
        <div className="flex flex-col gap-2">
          {CREDITS.map((c) => (
            <div
              key={c.foto}
              className="flex flex-wrap justify-between gap-2 p-3 rounded-xl border border-zinc-800 bg-zinc-950 text-sm"
            >
              <span>{c.foto}</span>
              <span className="text-gray-400">
                {c.autor !== "—" ? `${c.autor} · ` : ""}
                {c.licencia}
              </span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
