import { createClient } from "@/lib/supabase/server";
import { createEvent, updateEvent, deleteEvent } from "./actions";
import { formatMXN } from "@/lib/money";
import { SITE_URL } from "@/lib/site";

export default async function EventosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase.from("profiles").select("rol").eq("id", user.id).single()
    : { data: null };
  const esDuena = profile?.rol === "duena";

  const { data: events } = await supabase
    .from("events")
    .select("id, titulo, descripcion, precio, fecha, slug, activo")
    .order("created_at", { ascending: false });
  const lista = events ?? [];

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold mb-1">Eventos</h1>
      <p className="text-gray-500 mb-6">
        Crea un evento y compártelo por WhatsApp con el flyer.
      </p>

      {esDuena && (
        <form
          action={createEvent}
          className="grid sm:grid-cols-2 gap-2 mb-6 p-5 rounded-xl border border-gray-200 bg-white shadow-sm"
        >
          <input
            name="titulo"
            required
            placeholder="Título del evento *"
            className="rounded-lg border border-gray-300 px-3 py-2 sm:col-span-2"
          />
          <input
            name="descripcion"
            placeholder="Descripción"
            className="rounded-lg border border-gray-300 px-3 py-2 sm:col-span-2"
          />
          <label className="flex flex-col gap-1 text-sm">
            Precio
            <input
              name="precio"
              type="number"
              step="0.01"
              min="0"
              defaultValue="0"
              className="rounded-lg border border-gray-300 px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Fecha
            <input
              name="fecha"
              type="date"
              className="rounded-lg border border-gray-300 px-3 py-2"
            />
          </label>
          <button className="rounded-lg bg-black px-4 py-2 text-white hover:opacity-90 sm:col-span-2">
            Crear evento
          </button>
        </form>
      )}

      <div className="flex flex-col gap-3">
        {lista.length === 0 && (
          <p className="text-gray-400 text-sm">Aún no hay eventos.</p>
        )}
        {lista.map((e) => {
          const link = `${SITE_URL}/evento/${e.slug}`;
          const msg = encodeURIComponent(
            `🌙 *${e.titulo}*\n` +
              (e.fecha ? `📅 ${e.fecha}\n` : "") +
              (Number(e.precio) > 0
                ? `💲 ${formatMXN(Number(e.precio))}\n`
                : "") +
              (e.descripcion ? `${e.descripcion}\n` : "") +
              `\nMás info: ${link}`
          );
          return (
            <div key={e.id} className="p-5 rounded-xl border border-gray-200 bg-white">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <h3 className="font-bold">
                    {e.titulo}{" "}
                    {!e.activo && (
                      <span className="text-xs text-gray-400">(inactivo)</span>
                    )}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {e.fecha ? `📅 ${e.fecha} · ` : ""}
                    {Number(e.precio) > 0
                      ? `💲 ${formatMXN(Number(e.precio))}`
                      : "Gratis"}
                  </p>
                  {e.descripcion && (
                    <p className="text-sm text-gray-600 mt-1">{e.descripcion}</p>
                  )}
                </div>
                <div className="flex gap-2 flex-wrap">
                  <a
                    href={`https://wa.me/?text=${msg}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg bg-green-600 px-3 py-1.5 text-sm text-white hover:bg-green-500"
                  >
                    Compartir por WhatsApp
                  </a>
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50"
                  >
                    Ver página
                  </a>
                </div>
              </div>

              {esDuena && (
                <details className="mt-3">
                  <summary className="text-xs text-gray-500 cursor-pointer">
                    Editar / eliminar
                  </summary>
                  <div className="flex flex-wrap items-end gap-2 mt-2">
                    <form
                      action={updateEvent}
                      className="grid sm:grid-cols-2 gap-2 flex-1"
                    >
                      <input type="hidden" name="id" value={e.id} />
                      <input
                        name="titulo"
                        defaultValue={e.titulo}
                        required
                        className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm sm:col-span-2"
                      />
                      <input
                        name="descripcion"
                        defaultValue={e.descripcion ?? ""}
                        placeholder="Descripción"
                        className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm sm:col-span-2"
                      />
                      <input
                        name="precio"
                        type="number"
                        step="0.01"
                        min="0"
                        defaultValue={String(e.precio)}
                        className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
                      />
                      <input
                        name="fecha"
                        type="date"
                        defaultValue={e.fecha ?? ""}
                        className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
                      />
                      <label className="flex items-center gap-1 text-xs text-gray-600">
                        <input
                          type="checkbox"
                          name="activo"
                          defaultChecked={e.activo}
                        />{" "}
                        Activo
                      </label>
                      <button className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50">
                        Guardar
                      </button>
                    </form>
                    <form action={deleteEvent}>
                      <input type="hidden" name="id" value={e.id} />
                      <button className="rounded-lg border border-red-200 text-red-600 px-3 py-1.5 text-sm hover:bg-red-50">
                        Eliminar
                      </button>
                    </form>
                  </div>
                </details>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
