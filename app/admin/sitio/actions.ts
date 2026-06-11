"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function updateSiteSettings(formData: FormData) {
  const supabase = await createClient();

  const clean = (name: string) =>
    String(formData.get(name) ?? "").trim() || null;

  const whatsapp = clean("whatsapp")?.replace(/\D/g, "") || null;

  const { error } = await supabase
    .from("site_settings")
    .update({
      whatsapp,
      tiktok: clean("tiktok"),
      instagram: clean("instagram"),
      facebook: clean("facebook"),
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);

  if (error) {
    redirect("/admin/sitio?error=" + encodeURIComponent(error.message));
  }
  revalidatePath("/");
  revalidatePath("/galeria");
  redirect("/admin/sitio?ok=1");
}
