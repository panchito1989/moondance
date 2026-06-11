import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createStudent, updateStudent, deleteStudent } from "./actions";

export default async function AlumnasPage() {
  const supabase = await createClient();
  const [{ data: students }, { data: groups }] = await Promise.all([
    supabase
      .from("students")
      .select("id, nombre, tutor, telefono, notas, activa, group_id")
      .order("nombre"),
    supabase
      .from("groups")
      .select("id, nombre")
      .eq("activo", true)
      .order("nombre"),
  ]);

  const grupos = groups ?? [];
  const lista = students ?? [];

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold mb-1">Alumnas</h1>
      <p className="text-gray-500 mb-6">Alta y edición de alumnas.</p>

      <form
        action={createStudent}
        className="grid sm:grid-cols-2 gap-2 mb-6 p-4 rounded-xl border border-gray-200 bg-gray-50"
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
        <select
          name="group_id"
          defaultValue=""
          className="rounded-lg border border-gray-300 px-3 py-2 bg-white"
        >
          <option value="">— Sin grupo —</option>
          {grupos.map((g) => (
            <option key={g.id} value={g.id}>
              {g.nombre}
            </option>
          ))}
        </select>
        <input
          name="notas"
          placeholder="Notas"
          className="rounded-lg border border-gray-300 px-3 py-2 sm:col-span-2"
        />
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
          <div key={s.id} className="p-3 rounded-xl border border-gray-200">
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
              <select
                name="group_id"
                defaultValue={s.group_id ?? ""}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm bg-white"
              >
                <option value="">— Sin grupo —</option>
                {grupos.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.nombre}
                  </option>
                ))}
              </select>
              <input
                name="notas"
                defaultValue={s.notas ?? ""}
                placeholder="Notas"
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm sm:col-span-2"
              />
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
