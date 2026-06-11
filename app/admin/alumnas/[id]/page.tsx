import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { registerPayment, deletePayment } from "./actions";
import { formatMXN } from "@/lib/money";

const METODOS = ["efectivo", "transferencia", "otro"];

export default async function EstadoCuentaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: student }, { data: concepts }, { data: payments }, profileRes] =
    await Promise.all([
      supabase
        .from("students")
        .select("id, nombre, tutor, telefono, activa, student_groups(groups(nombre))")
        .eq("id", id)
        .maybeSingle(),
      supabase
        .from("payment_concepts")
        .select("id, nombre, precio")
        .eq("activo", true)
        .order("nombre"),
      supabase
        .from("payments")
        .select("id, monto, fecha, metodo, nota, payment_concepts(nombre)")
        .eq("student_id", id)
        .order("fecha", { ascending: false })
        .order("created_at", { ascending: false }),
      (async () => {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return null;
        const { data } = await supabase
          .from("profiles")
          .select("rol")
          .eq("id", user.id)
          .single();
        return data;
      })(),
    ]);

  if (!student) notFound();

  const lista = payments ?? [];
  const conceptos = concepts ?? [];
  const esDuena = profileRes?.rol === "duena";
  const anio = new Date().getFullYear();
  const totalAnio = lista
    .filter((p) => String(p.fecha).startsWith(String(anio)))
    .reduce((sum, p) => sum + Number(p.monto), 0);
  const grupoNombre =
    (student.student_groups ?? [])
      .map((sg: { groups: { nombre: string } | { nombre: string }[] | null }) => {
        const g = sg.groups;
        return Array.isArray(g) ? g[0]?.nombre : g?.nombre;
      })
      .filter(Boolean)
      .join(" · ") || null;

  return (
    <div className="max-w-5xl">
      <Link href="/admin/alumnas" className="text-sm text-gray-400 hover:text-white">
        ← Alumnas
      </Link>
      <h1 className="text-2xl font-bold mt-1">{student.nombre}</h1>
      <p className="text-gray-400 mb-4">
        {grupoNombre ?? "Sin grupo"}
        {student.tutor ? ` · Tutor: ${student.tutor}` : ""}
        {student.telefono ? ` · Tel: ${student.telefono}` : ""}
        {!student.activa && " · (inactiva)"}
      </p>

      <div className="rounded-lg bg-zinc-900 border border-zinc-800 px-4 py-2 inline-block mb-6 text-sm">
        Total pagado en {anio}: <b>{formatMXN(totalAnio)}</b>
      </div>

      <h2 className="font-semibold mb-2">Registrar pago</h2>
      <form
        action={registerPayment}
        className="grid sm:grid-cols-2 gap-2 mb-6 p-5 rounded-xl border border-zinc-800 bg-zinc-900"
      >
        <input type="hidden" name="student_id" value={student.id} />
        <label className="flex flex-col gap-1 text-sm">
          Concepto
          <select
            name="concept_id"
            required
            className="rounded-lg border border-zinc-700 px-3 py-2 bg-zinc-900"
          >
            {conceptos.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre} — {formatMXN(Number(c.precio))}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Monto (ajústalo si es distinto al precio)
          <input
            name="monto"
            type="number"
            step="0.01"
            min="0"
            required
            placeholder="0.00"
            className="rounded-lg border border-zinc-700 px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Fecha
          <input
            name="fecha"
            type="date"
            defaultValue={new Date().toISOString().slice(0, 10)}
            className="rounded-lg border border-zinc-700 px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Método
          <select
            name="metodo"
            defaultValue="efectivo"
            className="rounded-lg border border-zinc-700 px-3 py-2 bg-zinc-900"
          >
            {METODOS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>
        <input
          name="nota"
          placeholder="Nota (opcional)"
          className="rounded-lg border border-zinc-700 px-3 py-2 sm:col-span-2"
        />
        <button className="rounded-lg bg-fuchsia-600 px-4 py-2 text-white hover:opacity-90 sm:col-span-2">
          Registrar pago
        </button>
      </form>

      <h2 className="font-semibold mb-2">Historial de pagos</h2>
      <div className="flex flex-col gap-2">
        {lista.length === 0 && (
          <p className="text-gray-400 text-sm">Sin pagos registrados todavía.</p>
        )}
        {lista.map((p) => {
          const concepto = Array.isArray(p.payment_concepts)
            ? null
            : (p.payment_concepts as { nombre: string } | null)?.nombre;
          return (
            <div
              key={p.id}
              className="flex items-center justify-between gap-3 p-4 rounded-xl border border-zinc-800 bg-zinc-900 text-sm"
            >
              <div>
                <span className="font-medium">{concepto ?? "Concepto"}</span>{" "}
                <span className="text-gray-400">
                  · {p.fecha} · {p.metodo}
                  {p.nota ? ` · ${p.nota}` : ""}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{formatMXN(Number(p.monto))}</span>
                {esDuena && (
                  <form action={deletePayment}>
                    <input type="hidden" name="id" value={p.id} />
                    <input type="hidden" name="student_id" value={student.id} />
                    <button className="rounded-lg border border-red-500/40 text-red-400 px-2 py-1 text-xs hover:bg-red-500/10">
                      Borrar
                    </button>
                  </form>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
