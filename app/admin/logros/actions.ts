"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createAchievement(formData: FormData) {
  const supabase = await createClient();
  const titulo = String(formData.get("titulo") ?? "").trim();
  if (!titulo) return;
  await supabase.from("achievements").insert({
    titulo,
    descripcion: String(formData.get("descripcion") ?? "").trim() || null,
    anio: String(formData.get("anio") ?? "").trim() || null,
  });
  revalidatePath("/admin/logros");
  revalidatePath("/");
}

export async function updateAchievement(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id") ?? "");
  const titulo = String(formData.get("titulo") ?? "").trim();
  if (!id || !titulo) return;
  await supabase
    .from("achievements")
    .update({
      titulo,
      descripcion: String(formData.get("descripcion") ?? "").trim() || null,
      anio: String(formData.get("anio") ?? "").trim() || null,
      activo: formData.get("activo") === "on",
    })
    .eq("id", id);
  revalidatePath("/admin/logros");
  revalidatePath("/");
}

export async function deleteAchievement(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await supabase.from("achievements").delete().eq("id", id);
  revalidatePath("/admin/logros");
  revalidatePath("/");
}
