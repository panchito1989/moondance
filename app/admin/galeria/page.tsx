/* eslint-disable @next/next/no-img-element */
import { createClient } from "@/lib/supabase/server";
import { uploadPhoto, deletePhoto } from "./actions";

export default async function GaleriaAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const { data: photos } = await supabase
    .from("gallery_photos")
    .select("id, url, path, titulo, created_at")
    .order("created_at", { ascending: false });
  const lista = photos ?? [];

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold mb-1">Galería</h1>
      <p className="text-gray-400 mb-6">
        Las fotos que subas aquí aparecen en la página pública. 📸
      </p>

      {error && (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400 mb-4">
          {error}
        </p>
      )}

      <form
        action={uploadPhoto}
        className="flex flex-wrap items-end gap-3 mb-8 p-5 rounded-xl border border-zinc-800 bg-zinc-900"
      >
        <label className="flex flex-col gap-1 text-sm">
          Foto (máx. 5MB)
          <input
            type="file"
            name="file"
            accept="image/*"
            required
            className="text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-fuchsia-600 file:px-3 file:py-1.5 file:text-white file:cursor-pointer"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Título (opcional)
          <input
            name="titulo"
            placeholder="Ej. Festival 2026"
            className="rounded-lg border border-zinc-700 px-3 py-2"
          />
        </label>
        <button className="rounded-lg bg-fuchsia-600 px-4 py-2 text-white hover:bg-fuchsia-500">
          Subir foto
        </button>
      </form>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {lista.length === 0 && (
          <p className="text-gray-400 text-sm col-span-full">
            Aún no hay fotos. Mientras no subas ninguna, la página pública
            muestra fotos de demostración.
          </p>
        )}
        {lista.map((p) => (
          <div
            key={p.id}
            className="rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900"
          >
            <img
              src={p.url}
              alt={p.titulo ?? "Foto de galería"}
              className="aspect-square w-full object-cover"
            />
            <div className="p-2 flex items-center justify-between gap-2">
              <span className="text-xs text-gray-400 truncate">
                {p.titulo ?? "Sin título"}
              </span>
              <form action={deletePhoto}>
                <input type="hidden" name="id" value={p.id} />
                <input type="hidden" name="path" value={p.path} />
                <button className="rounded-lg border border-red-500/40 text-red-400 px-2 py-1 text-xs hover:bg-red-500/10">
                  Borrar
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
