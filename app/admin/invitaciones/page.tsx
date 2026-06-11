import { createClient } from "@/lib/supabase/server";
import { toggleRead, deleteInvitation } from "./actions";

export default async function InvitacionesPage() {
  const supabase = await createClient();
  const { data: invitations } = await supabase
    .from("event_invitations")
    .select("id, nombre, contacto, mensaje, leido, created_at")
    .order("created_at", { ascending: false });
  const lista = invitations ?? [];
  const nuevas = lista.filter((i) => !i.leido).length;

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold mb-1">
        Invitaciones {nuevas > 0 && (
          <span className="text-sm align-middle rounded-full bg-fuchsia-600 px-2.5 py-0.5 ml-2">
            {nuevas} nueva{nuevas !== 1 ? "s" : ""}
          </span>
        )}
      </h1>
      <p className="text-gray-400 mb-6">
        Personas que quieren llevar a MoonDance a su evento o exhibición. 💌
      </p>

      <div className="flex flex-col gap-2">
        {lista.length === 0 && (
          <p className="text-gray-400 text-sm">
            Aún no hay invitaciones. Llegarán desde el formulario de la página
            pública.
          </p>
        )}
        {lista.map((i) => (
          <div
            key={i.id}
            className={`p-4 rounded-xl border bg-zinc-900 ${
              i.leido ? "border-zinc-800 opacity-70" : "border-fuchsia-500/40"
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="font-semibold">{i.nombre}</span>{" "}
                <span className="text-sm text-cyan-400">{i.contacto}</span>
                <span className="text-xs text-gray-500 ml-2">
                  {new Date(i.created_at).toLocaleDateString("es-MX", {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
              </div>
              <div className="flex gap-2">
                <form action={toggleRead}>
                  <input type="hidden" name="id" value={i.id} />
                  <input type="hidden" name="leido" value={String(i.leido)} />
                  <button className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs hover:bg-zinc-800">
                    {i.leido ? "Marcar nueva" : "Marcar leída"}
                  </button>
                </form>
                <form action={deleteInvitation}>
                  <input type="hidden" name="id" value={i.id} />
                  <button className="rounded-lg border border-red-500/40 text-red-400 px-3 py-1.5 text-xs hover:bg-red-500/10">
                    Borrar
                  </button>
                </form>
              </div>
            </div>
            {i.mensaje && (
              <p className="mt-2 text-sm text-gray-300">{i.mensaje}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
