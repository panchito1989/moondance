import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createStudent, updateStudent, deleteStudent } from "./actions";

function GroupChecks({
  grupos,
  checked,
  small,
}: {
  grupos: { id: string; nombre: string }[];
  checked?: Set<string>;
  small?: boolean;
}) {
  if (grupos.length === 0)
    return (
      <p className="text-xs text-gray-400">
        No hay grupos aún — créalos en la sección Grupos.
      </p>
    );
  return (
    <div className={`flex flex-wrap gap-x-4 gap-y-1 ${small ? "text-xs" : "text-sm"}`}>
      {grupos.map((g) => (
        <label key={g.id} className="flex items-center gap-1.5 text-gray-700">
          <input
            type="checkbox"
            name="group_ids"
            value={g.id}
            defaultChecked={checked?.has(g.id)}
          />
          {g.nombre}
        </label>
      ))}
    </div>
  );
}

export default async function AlumnasPage() {
  const supabase = await createClient();
  const [{ data: students }, { data: groups }] = await Promise.all([
    supabase
      .from("students")
      .select("id, nombre, tutor, telefono, notas, activa, student_groups(group_id)")
      .order("nombre"),
    supabase
      .from("groups")
      .select("id, nombre")
      .eq("activo", true)
      .order("nombre"),
  ]);

  const grupos = groups ?? [];
  const lista = (students ?? []).map((s) => ({
    ...s,
    groupSet: new Set(
      (s.student_groups ?? []).map((sg: { group_id: string }) => sg.group_id)
    ),
  }));

  return (
    <div className="max-w-6xl">
      <h1 className="text-2xl font-bold mb-1">Alumnas</h1>
      <p className="text-gray-500 mb-6">
        Alta y edición. Una alumna puede estar en varias clases. ☑
      </p>

      <form
        action={createStudent}
        className="grid sm:grid-cols-2 gap-3 mb-6 p-5 rounded-xl border border-gray-200 bg-white shadow-sm"
      >
        <input
          name="nombre"
          required
          placeholder="Nombre de la alumna *"
          className="rounded-lg border border-gray-300 px-3 py-2"
        />
        <input
          name="tutor"
          placeholder="Tutor / mamá / papá"
          className="rounded-lg border border-gray-300 px-3 py-2"
        />
        <input
          name="telefono"
          placeholder="Teléfono"
          className="rounded-lg border border-gray-300 px-3 py-2"
        />
        <input
          name="notas"
          placeholder="Notas"
          className="rounded-lg border border-gray-300 px-3 py-2"
        />
        <div className="sm:col-span-2">
          <p className="text-sm font-medium mb-1">Clases:</p>
          <GroupChecks grupos={grupos} />
        </div>
        <button className="rounded-lg bg-black px-4 py-2 text-white hover:opacity-90 sm:col-span-2">
          Agregar alumna
        </button>
      </form>

      <div className="flex flex-col gap-2">
        {lista.length === 0 && (
          <p className="text-gray-400 text-sm">
            Aún no hay alumnas. Agrega la primera arriba.
          </p>
        )}
        {lista.map((s) => (
          <div key={s.id} className="p-4 rounded-xl border border-gray-200 bg-white">
            <form action={updateStudent} className="grid sm:grid-cols-2 gap-2">
              <input type="hidden" name="id" value={s.id} />
              <input
                name="nombre"
                defaultValue={s.nombre}
                required
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
              />
              <input
                name="tutor"
                defaultValue={s.tutor ?? ""}
                placeholder="Tutor"
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
              />
              <input
                name="telefono"
                defaultValue={s.telefono ?? ""}
                placeholder="Teléfono"
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
              />
              <input
                name="notas"
                defaultValue={s.notas ?? ""}
                placeholder="Notas"
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
              />
              <div className="sm:col-span-2">
                <GroupChecks grupos={grupos} checked={s.groupSet} small />
              </div>
              <label className="flex items-center gap-2 text-xs text-gray-600">
                <input type="checkbox" name="activa" defaultChecked={s.activa} />{" "}
                Activa
              </label>
              <div className="flex gap-2 justify-end items-center">
                <button className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50">
                  Guardar
                </button>
              </div>
            </form>
            <div className="flex justify-between items-center mt-2">
              <Link
                href={`/admin/alumnas/${s.id}`}
                className="text-sm text-blue-600 hover:underline"
              >
                Estado de cuenta →
              </Link>
              <form action={deleteStudent}>
                <input type="hidden" name="id" value={s.id} />
                <button className="rounded-lg border border-red-200 text-red-600 px-3 py-1.5 text-sm hover:bg-red-50">
                  Eliminar
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
