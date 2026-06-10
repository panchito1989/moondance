import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-3xl font-bold">MoonDance Studio 🌙</h1>
      <p className="text-gray-500">Sistema de administración (en construcción)</p>
      <Link
        href="/login"
        className="rounded-lg bg-black px-5 py-2.5 text-white hover:opacity-90"
      >
        Iniciar sesión
      </Link>
    </main>
  );
}
