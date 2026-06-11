import { login } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-black">
      <form
        action={login}
        className="w-full max-w-sm rounded-2xl bg-zinc-900 p-8 shadow-sm border border-zinc-800 flex flex-col gap-4"
      >
        <div className="text-center">
          <h1 className="text-2xl font-bold">MoonDance Studio 🌙</h1>
          <p className="text-sm text-gray-400">Acceso para staff</p>
        </div>

        {error && (
          <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {error}
          </p>
        )}

        <label className="flex flex-col gap-1 text-sm">
          Correo
          <input
            name="email"
            type="email"
            required
            className="rounded-lg border border-zinc-700 px-3 py-2"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Contraseña
          <input
            name="password"
            type="password"
            required
            className="rounded-lg border border-zinc-700 px-3 py-2"
          />
        </label>

        <button
          type="submit"
          className="mt-2 rounded-lg bg-fuchsia-600 px-4 py-2.5 text-white hover:opacity-90"
        >
          Entrar
        </button>
      </form>
    </main>
  );
}
