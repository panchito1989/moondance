"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { slugify } from "@/lib/slug";

export async function createEvent(formData: FormData) {
  const supabase = await createClient();
  const titulo = String(formData.get("titulo") ?? "").trim();
  if (!titulo) return;
  const base = slugify(titulo) || "evento";
  // Sufijo corto para evitar choques de slug sin complicar al usuario.
  const slug = `${base}-${Math.random().toString(36).slice(2, 6)}`;
  await supabase.from("events").insert({
    titulo,
    descripcion: String(formData.get("descripcion") ?? "").trim() || null,
    precio: Number(formData.get("precio") ?? 0) || 0,
    fecha: String(formData.get("fecha") ?? "") || null,
    slug,
  });
  revalidatePath("/admin/eventos");
}

export async function updateEvent(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id") ?? "");
  const titulo = String(formData.get("titulo") ?? "").trim();
  if (!id || !titulo) return;
  await supabase
    .from("events")
    .update({
      titulo,
      descripcion: String(formData.get("descripcion") ?? "").trim() || null,
      precio: Number(formData.get("precio") ?? 0) || 0,
      fecha: String(formData.get("fecha") ?? "") || null,
      activo: formData.get("activo") === "on",
    })
    .eq("id", id);
  revalidatePath("/admin/eventos");
}

export async function deleteEvent(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await supabase.from("events").delete().eq("id", id);
  revalidatePath("/admin/eventos");
}
