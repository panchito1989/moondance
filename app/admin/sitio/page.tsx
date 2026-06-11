import { createClient } from "@/lib/supabase/server";
import { updateSiteSettings } from "./actions";

export default async function SitioPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  const { error, ok } = await searchParams;
  const supabase = await createClient();
  const { data: settings } = await supabase
    .from("site_settings")
    .select("whatsapp, tiktok, instagram, facebook")
    .eq("id", 1)
    .maybeSingle();

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold mb-1">Página pública</h1>
      <p className="text-gray-400 mb-6">
        WhatsApp y redes sociales que se muestran en la página del estudio. 🌐
      </p>

      {error && (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400 mb-4">
          {error}
        </p>
      )}
      {ok && (
        <p className="rounded-lg bg-green-500/10 px-3 py-2 text-sm text-green-400 mb-4">
          Guardado ✔ — los cambios ya se ven en la página.
        </p>
      )}

      <form
        action={updateSiteSettings}
        className="flex flex-col gap-4 p-5 rounded-xl border border-zinc-800 bg-zinc-900"
      >
        <label className="flex flex-col gap-1 text-sm">
          📱 WhatsApp del estudio
          <input
            name="whatsapp"
            defaultValue={settings?.whatsapp ?? ""}
            placeholder="Ej. 5215512345678 (con lada del país, solo números)"
            className="rounded-lg border border-zinc-700 px-3 py-2"
          />
          <span className="text-xs text-gray-500">
            Es a donde llegan los mensajes de los botones de WhatsApp.
          </span>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          🎵 TikTok
          <input
            name="tiktok"
            defaultValue={settings?.tiktok ?? ""}
            placeholder="@moondance.studio o el link completo"
            className="rounded-lg border border-zinc-700 px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          📸 Instagram
          <input
            name="instagram"
            defaultValue={settings?.instagram ?? ""}
            placeholder="@moondance.studio o el link completo"
            className="rounded-lg border border-zinc-700 px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          👍 Facebook
          <input
            name="facebook"
            defaultValue={settings?.facebook ?? ""}
            placeholder="moondancestudio o el link completo"
            className="rounded-lg border border-zinc-700 px-3 py-2"
          />
        </label>
        <p className="text-xs text-gray-500">
          Las redes que dejes vacías simplemente no se muestran.
        </p>
        <button className="rounded-lg bg-fuchsia-600 px-4 py-2.5 text-white hover:bg-fuchsia-500">
          Guardar
        </button>
      </form>
    </div>
  );
}
