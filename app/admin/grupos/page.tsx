import { createClient } from "@/lib/supabase/server";
import { createGroup, updateGroup, deleteGroup } from "./actions";

export default async function GruposPage() {
  const supabase = await createClient();
  const { data: groups } = await supabase
    .from("groups")
    .select("id, nombre, horario, activo")
    .order("nombre");

  const lista = groups ?? [];

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold mb-1">Grupos / Clases</h1>
      <p className="text-gray-400 mb-6">Organiza a las alumnas por grupo y horario.</p>

      <form
        action={createGroup}
        className="flex flex-wrap gap-2 items-end mb-6 p-5 rounded-xl border border-zinc-800 bg-zinc-900"
      >
        <label className="flex flex-col gap-1 text-sm">
          Nombre
          <input
            name="nombre"
            required
            placeholder="Ej. Ballet Infantil"
            className="rounded-lg border border-zinc-700 px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Horario
          <input
            name="horario"
            placeholder="Ej. Lun y Mié 5pm"
            className="rounded-lg border border-zinc-700 px-3 py-2"
          />
        </label>
        <button className="rounded-lg bg-fuchsia-600 px-4 py-2 text-white hover:opacity-90">
          Agregar grupo
        </button>
      </form>

      <div className="flex flex-col gap-2">
        {lista.length === 0 && (
          <p className="text-gray-400 text-sm">
            Aún no hay grupos. Agrega el primero arriba.
          </p>
        )}
        {lista.map((g) => (
          <div
            key={g.id}
            className="flex flex-wrap items-end gap-2 p-4 rounded-xl border border-zinc-800 bg-zinc-900"
          >
            <form
              action={updateGroup}
              className="flex flex-wrap items-end gap-2 flex-1"
            >
              <input type="hidden" name="id" value={g.id} />
              <label className="flex flex-col gap-1 text-xs text-gray-400">
                Nombre
                <input
                  name="nombre"
                  defaultValue={g.nombre}
                  required
                  className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-white"
                />
              </label>
              <label className="flex flex-col gap-1 text-xs text-gray-400">
                Horario
                <input
                  name="horario"
                  defaultValue={g.horario ?? ""}
                  className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-white"
                />
              </label>
              <label className="flex items-center gap-1 text-xs text-gray-300">
                <input type="checkbox" name="activo" defaultChecked={g.activo} />{" "}
                Activo
              </label>
              <button className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm hover:bg-zinc-800">
                Guardar
              </button>
            </form>
            <form action={deleteGroup}>
              <input type="hidden" name="id" value={g.id} />
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
