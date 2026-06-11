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
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-1">Grupos / Clases</h1>
      <p className="text-gray-500 mb-6">Organiza a las alumnas por grupo y horario.</p>

      <form
        action={createGroup}
        className="flex flex-wrap gap-2 items-end mb-6 p-4 rounded-xl border border-gray-200 bg-gray-50"
      >
        <label className="flex flex-col gap-1 text-sm">
          Nombre
          <input
            name="nombre"
            required
            placeholder="Ej. Ballet Infantil"
            className="rounded-lg border border-gray-300 px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Horario
          <input
            name="horario"
            placeholder="Ej. Lun y Mié 5pm"
            className="rounded-lg border border-gray-300 px-3 py-2"
          />
        </label>
        <button className="rounded-lg bg-black px-4 py-2 text-white hover:opacity-90">
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
            className="flex flex-wrap items-end gap-2 p-3 rounded-xl border border-gray-200"
          >
            <form
              action={updateGroup}
              className="flex flex-wrap items-end gap-2 flex-1"
            >
              <input type="hidden" name="id" value={g.id} />
              <label className="flex flex-col gap-1 text-xs text-gray-500">
                Nombre
                <input
                  name="nombre"
                  defaultValue={g.nombre}
                  required
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-black"
                />
              </label>
              <label className="flex flex-col gap-1 text-xs text-gray-500">
                Horario
                <input
                  name="horario"
                  defaultValue={g.horario ?? ""}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-black"
                />
              </label>
              <label className="flex items-center gap-1 text-xs text-gray-600">
                <input type="checkbox" name="activo" defaultChecked={g.activo} />{" "}
                Activo
              </label>
              <button className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50">
                Guardar
              </button>
            </form>
            <form action={deleteGroup}>
              <input type="hidden" name="id" value={g.id} />
              <button className="rounded-lg border border-red-200 text-red-600 px-3 py-1.5 text-sm hover:bg-red-50">
                Eliminar
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
