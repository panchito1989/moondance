import { createClient } from "@/lib/supabase/server";
import { createConcept, updateConcept, deleteConcept } from "./actions";
import { formatMXN } from "@/lib/money";

const TIPOS = ["clase", "anualidad", "vestuario", "evento", "otro"];

export default async function ConceptosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase.from("profiles").select("rol").eq("id", user.id).single()
    : { data: null };
  const esDuena = profile?.rol === "duena";

  const { data: concepts } = await supabase
    .from("payment_concepts")
    .select("id, nombre, precio, tipo, activo")
    .order("nombre");
  const lista = concepts ?? [];

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold mb-1">Conceptos de pago</h1>
      <p className="text-gray-500 mb-6">
        {esDuena
          ? "Crea, edita o elimina conceptos y sus precios."
          : "Lista de conceptos (solo la dueña puede editarlos)."}
      </p>

      {esDuena && (
        <form
          action={createConcept}
          className="flex flex-wrap gap-2 items-end mb-6 p-5 rounded-xl border border-gray-200 bg-white shadow-sm"
        >
          <label className="flex flex-col gap-1 text-sm">
            Nombre
            <input
              name="nombre"
              required
              placeholder="Ej. Examen"
              className="rounded-lg border border-gray-300 px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Precio
            <input
              name="precio"
              type="number"
              step="0.01"
              min="0"
              defaultValue="0"
              className="rounded-lg border border-gray-300 px-3 py-2 w-28"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Tipo
            <select
              name="tipo"
              defaultValue="otro"
              className="rounded-lg border border-gray-300 px-3 py-2 bg-white"
            >
              {TIPOS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          <button className="rounded-lg bg-black px-4 py-2 text-white hover:opacity-90">
            Agregar concepto
          </button>
        </form>
      )}

      <div className="flex flex-col gap-2">
        {lista.map((c) =>
          esDuena ? (
            <div
              key={c.id}
              className="flex flex-wrap items-end gap-2 p-4 rounded-xl border border-gray-200 bg-white"
            >
              <form
                action={updateConcept}
                className="flex flex-wrap items-end gap-2 flex-1"
              >
                <input type="hidden" name="id" value={c.id} />
                <label className="flex flex-col gap-1 text-xs text-gray-500">
                  Nombre
                  <input
                    name="nombre"
                    defaultValue={c.nombre}
                    required
                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs text-gray-500">
                  Precio
                  <input
                    name="precio"
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue={String(c.precio)}
                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm w-24"
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs text-gray-500">
                  Tipo
                  <select
                    name="tipo"
                    defaultValue={c.tipo}
                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm bg-white"
                  >
                    {TIPOS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex items-center gap-1 text-xs text-gray-600">
                  <input
                    type="checkbox"
                    name="activo"
                    defaultChecked={c.activo}
                  />{" "}
                  Activo
                </label>
                <button className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50">
                  Guardar
                </button>
              </form>
              <form action={deleteConcept}>
                <input type="hidden" name="id" value={c.id} />
                <button className="rounded-lg border border-red-200 text-red-600 px-3 py-1.5 text-sm hover:bg-red-50">
                  Eliminar
                </button>
              </form>
            </div>
          ) : (
            <div
              key={c.id}
              className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-white"
            >
              <span>
                {c.nombre}{" "}
                <span className="text-xs text-gray-400">({c.tipo})</span>
              </span>
              <span className="font-medium">{formatMXN(Number(c.precio))}</span>
            </div>
          )
        )}
      </div>
    </div>
  );
}
