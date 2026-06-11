import { createClient } from "@/lib/supabase/server";
import { chargeAndAttend, attendOnly, undoDay } from "./actions";
import { formatMXN } from "@/lib/money";

export default async function CobroPage({
  searchParams,
}: {
  searchParams: Promise<{ fecha?: string; grupo?: string }>;
}) {
  const sp = await searchParams;
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);
  const fecha = sp.fecha || today;
  const grupo = sp.grupo || "";

  const [{ data: students }, { data: groups }, { data: clase }, { data: asis }] =
    await Promise.all([
      supabase
        .from("students")
        .select("id, nombre, student_groups(group_id)")
        .eq("activa", true)
        .order("nombre"),
      supabase
        .from("groups")
        .select("id, nombre")
        .eq("activo", true)
        .order("nombre"),
      supabase
        .from("payment_concepts")
        .select("id, precio")
        .eq("tipo", "clase")
        .eq("activo", true)
        .order("created_at")
        .limit(1)
        .maybeSingle(),
      supabase
        .from("attendance")
        .select("student_id, presente, payment_id")
        .eq("fecha", fecha),
    ]);

  const grupos = groups ?? [];

  const asisMap: Record<string, { presente: boolean; payment_id: string | null }> =
    {};
  for (const a of asis ?? [])
    asisMap[a.student_id] = { presente: a.presente, payment_id: a.payment_id };

  let lista = (students ?? []).map((s) => {
    const ids = (s.student_groups ?? []).map(
      (sg: { group_id: string }) => sg.group_id
    );
    return {
      ...s,
      groupIds: ids,
      groupNames: ids
        .map((id: string) => grupos.find((g) => g.id === id)?.nombre)
        .filter(Boolean)
        .join(" · "),
    };
  });
  if (grupo) lista = lista.filter((s) => s.groupIds.includes(grupo));

  const precioClase = clase ? Number(clase.precio) : 0;
  const presentes = lista.filter((s) => asisMap[s.id]?.presente).length;
  const cobrados = lista.filter((s) => asisMap[s.id]?.payment_id).length;
  const totalCobrado = cobrados * precioClase;

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold mb-1">Cobro &amp; Asistencia</h1>
      <p className="text-gray-500 mb-4">
        Cobra la clase y marca asistencia en un toque.
      </p>

      <form className="flex flex-wrap items-end gap-2 mb-4">
        <label className="flex flex-col gap-1 text-sm">
          Fecha
          <input
            type="date"
            name="fecha"
            defaultValue={fecha}
            className="rounded-lg border border-gray-300 px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Grupo
          <select
            name="grupo"
            defaultValue={grupo}
            className="rounded-lg border border-gray-300 px-3 py-2 bg-white"
          >
            <option value="">Todos</option>
            {grupos.map((g) => (
              <option key={g.id} value={g.id}>
                {g.nombre}
              </option>
            ))}
          </select>
        </label>
        <button className="rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50">
          Ver
        </button>
      </form>

      <div className="flex flex-wrap gap-3 mb-4 text-sm">
        <div className="rounded-lg bg-white border border-gray-200 px-4 py-2">
          Presentes: <b>{presentes}</b>/{lista.length}
        </div>
        <div className="rounded-lg bg-white border border-gray-200 px-4 py-2">
          Cobrado: <b>{formatMXN(totalCobrado)}</b>
        </div>
        {precioClase === 0 && (
          <div className="rounded-lg bg-amber-50 border border-amber-200 text-amber-700 px-4 py-2">
            Define el precio de &quot;Clase&quot; en Conceptos.
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {lista.length === 0 && (
          <p className="text-gray-400 text-sm">
            No hay alumnas activas (revisa el filtro o agrega alumnas).
          </p>
        )}
        {lista.map((s) => {
          const a = asisMap[s.id];
          const present = a?.presente;
          const cobrado = !!a?.payment_id;
          return (
            <div
              key={s.id}
              className="flex items-center justify-between gap-3 p-4 rounded-xl border border-gray-200 bg-white"
            >
              <div>
                <div className="font-medium">{s.nombre}</div>
                {s.groupNames && (
                  <div className="text-xs text-gray-500">{s.groupNames}</div>
                )}
              </div>
              <div className="flex items-center gap-2">
                {present ? (
                  <>
                    <span className="text-sm text-green-600">
                      ✓ Presente
                      {cobrado ? ` · 💲 ${formatMXN(precioClase)}` : ""}
                    </span>
                    <form action={undoDay}>
                      <input type="hidden" name="student_id" value={s.id} />
                      <input type="hidden" name="fecha" value={fecha} />
                      <button className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50">
                        Deshacer
                      </button>
                    </form>
                  </>
                ) : (
                  <>
                    <form action={chargeAndAttend}>
                      <input type="hidden" name="student_id" value={s.id} />
                      <input type="hidden" name="fecha" value={fecha} />
                      <button className="rounded-lg bg-black px-3 py-1.5 text-sm text-white hover:opacity-90">
                        Cobrar {formatMXN(precioClase)} + Presente
                      </button>
                    </form>
                    <form action={attendOnly}>
                      <input type="hidden" name="student_id" value={s.id} />
                      <input type="hidden" name="fecha" value={fecha} />
                      <button className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50">
                        Solo presente
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
