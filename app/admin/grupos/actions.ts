"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createGroup(formData: FormData) {
  const supabase = await createClient();
  const nombre = String(formData.get("nombre") ?? "").trim();
  if (!nombre) return;
  const horario = String(formData.get("horario") ?? "").trim() || null;
  await supabase.from("groups").insert({ nombre, horario });
  revalidatePath("/admin/grupos");
}

export async function updateGroup(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id") ?? "");
  const nombre = String(formData.get("nombre") ?? "").trim();
  if (!id || !nombre) return;
  const horario = String(formData.get("horario") ?? "").trim() || null;
  const activo = formData.get("activo") === "on";
  await supabase.from("groups").update({ nombre, horario, activo }).eq("id", id);
  revalidatePath("/admin/grupos");
}

export async function deleteGroup(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await supabase.from("groups").delete().eq("id", id);
  revalidatePath("/admin/grupos");
}
