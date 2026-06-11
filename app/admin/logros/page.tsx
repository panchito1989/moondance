import { createClient } from "@/lib/supabase/server";
import {
  createAchievement,
  updateAchievement,
  deleteAchievement,
} from "./actions";

export default async function LogrosPage() {
  const supabase = await createClient();
  const { data: achievements } = await supabase
    .from("achievements")
    .select("id, titulo, descripcion, anio, activo")
    .order("created_at", { ascending: false });
  const lista = achievements ?? [];

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold mb-1">Logros y reconocimientos</h1>
      <p className="text-gray-400 mb-6">
        Premios, concursos y momentos de orgullo — se muestran en la página
        pública. 🏆
      </p>

      <form
        action={createAchievement}
        className="grid sm:grid-cols-2 gap-2 mb-6 p-5 rounded-xl border border-zinc-800 bg-zinc-900"
      >
        <input
          name="titulo"
          required
          placeholder="Título * (ej. 1er lugar regional de Jazz)"
          className="rounded-lg border border-zinc-700 px-3 py-2"
        />
        <input
          name="anio"
          placeholder="Año (ej. 2026)"
          className="rounded-lg border border-zinc-700 px-3 py-2"
        />
        <input
          name="descripcion"
          placeholder="Descripción (opcional)"
          className="rounded-lg border border-zinc-700 px-3 py-2 sm:col-span-2"
        />
        <button className="rounded-lg bg-fuchsia-600 px-4 py-2 text-white hover:bg-fuchsia-500 sm:col-span-2">
          Agregar logro
        </button>
      </form>

      <div className="flex flex-col gap-2">
        {lista.length === 0 && (
          <p className="text-gray-400 text-sm">Aún no hay logros capturados.</p>
        )}
        {lista.map((a) => (
          <div
            key={a.id}
            className="flex flex-wrap items-end gap-2 p-4 rounded-xl border border-zinc-800 bg-zinc-900"
          >
            <form
              action={updateAchievement}
              className="grid sm:grid-cols-2 gap-2 flex-1"
            >
              <input type="hidden" name="id" value={a.id} />
              <input
                name="titulo"
                defaultValue={a.titulo}
                required
                className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm"
              />
              <input
                name="anio"
                defaultValue={a.anio ?? ""}
                placeholder="Año"
                className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm"
              />
              <input
                name="descripcion"
                defaultValue={a.descripcion ?? ""}
                placeholder="Descripción"
                className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm sm:col-span-2"
              />
              <label className="flex items-center gap-1 text-xs text-gray-300">
                <input type="checkbox" name="activo" defaultChecked={a.activo} />{" "}
                Visible en la página
              </label>
              <button className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm hover:bg-zinc-800">
                Guardar
              </button>
            </form>
            <form action={deleteAchievement}>
              <input type="hidden" name="id" value={a.id} />
              <button className="rounded-lg border border-red-500/40 text-red-400 px-3 py-1.5 text-sm hover:bg-red-500/10">
                Eliminar
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
