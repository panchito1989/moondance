import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import GaleriaLightbox from "../galeria-lightbox";

export const metadata = {
  title: "Galería · MoonDance Studio",
  description: "Todos los momentos que brillan en MoonDance Studio. 🌙",
};

export const revalidate = 300;

export default async function GaleriaCompletaPage() {
  const supabase = await createClient();
  const { data: fotos } = await supabase
    .from("gallery_photos")
    .select("url, titulo")
    .order("created_at", { ascending: false })
    .limit(500);
  const lista = fotos ?? [];

  return (
    <main className="min-h-screen bg-black text-white">
      <nav className="sticky top-0 z-10 bg-black/85 backdrop-blur border-b border-zinc-900">
        <div className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto">
          <Link href="/" className="font-bold tracking-wide">
            MOONDANCE <span className="text-fuchsia-500">STUDIO</span> 🌙
          </Link>
          <Link href="/" className="text-sm text-gray-400 hover:text-fuchsia-400">
            ← Volver al inicio
          </Link>
        </div>
      </nav>

      <section className="px-6 py-16 max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold mb-2 text-center">
          Nuestra <span className="text-lime-400">galería</span>
        </h1>
        <p className="text-gray-400 text-center mb-10 text-sm">
          {lista.length > 0
            ? `${lista.length} momentos que brillan ✨ — haz clic para verlas en grande`
            : "Muy pronto verás aquí los momentos de MoonDance ✨"}
        </p>
        {lista.length > 0 && <GaleriaLightbox fotos={lista} />}
      </section>

      <footer className="px-6 py-10 border-t border-zinc-900 text-center text-sm text-gray-600">
        MOONDANCE <span className="text-fuchsia-500/70">STUDIO</span> 🌙
      </footer>
    </main>
  );
}
