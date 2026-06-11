import { createClient } from "@/lib/supabase/server";
import { changePassword, changeEmail, changeName } from "./actions";

export default async function CuentaPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  const { error, ok } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase
        .from("profiles")
        .select("nombre, rol")
        .eq("id", user.id)
        .single()
    : { data: null };

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold mb-1">Mi cuenta</h1>
      <p className="text-gray-500 mb-6">
        {user?.email} · <span className="capitalize">{profile?.rol}</span>
      </p>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 mb-4">
          {error}
        </p>
      )}
      {ok && (
        <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700 mb-4">
          {ok}
        </p>
      )}

      <h2 className="font-semibold mb-2">Nombre</h2>
      <form
        action={changeName}
        className="flex gap-2 mb-6 p-4 rounded-xl border border-gray-200 bg-gray-50"
      >
        <input
          name="nombre"
          defaultValue={profile?.nombre ?? ""}
          required
          className="rounded-lg border border-gray-300 px-3 py-2 flex-1"
        />
        <button className="rounded-lg bg-black px-4 py-2 text-white hover:opacity-90">
          Guardar
        </button>
      </form>

      <h2 className="font-semibold mb-2">Cambiar contraseña</h2>
      <form
        action={changePassword}
        className="flex flex-col gap-2 mb-6 p-4 rounded-xl border border-gray-200 bg-gray-50"
      >
        <input
          name="password"
          type="password"
          required
          minLength={6}
          placeholder="Nueva contraseña"
          className="rounded-lg border border-gray-300 px-3 py-2"
        />
        <input
          name="confirm"
          type="password"
          required
          minLength={6}
          placeholder="Confirmar contraseña"
          className="rounded-lg border border-gray-300 px-3 py-2"
        />
        <button className="rounded-lg bg-black px-4 py-2 text-white hover:opacity-90">
          Actualizar contraseña
        </button>
      </form>

      <h2 className="font-semibold mb-2">Cambiar correo</h2>
      <form
        action={changeEmail}
        className="flex flex-col gap-2 p-4 rounded-xl border border-gray-200 bg-gray-50"
      >
        <input
          name="email"
          type="email"
          required
          placeholder="nuevo@correo.com"
          className="rounded-lg border border-gray-300 px-3 py-2"
        />
        <p className="text-xs text-gray-500">
          Se enviará un correo de confirmación; el cambio aplica al confirmarlo.
        </p>
        <button className="rounded-lg bg-black px-4 py-2 text-white hover:opacity-90">
          Cambiar correo
        </button>
      </form>
    </div>
  );
}
