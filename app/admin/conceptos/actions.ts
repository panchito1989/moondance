"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createConcept(formData: FormData) {
  const supabase = await createClient();
  const nombre = String(formData.get("nombre") ?? "").trim();
  if (!nombre) return;
  const precio = Number(formData.get("precio") ?? 0) || 0;
  const tipo = String(formData.get("tipo") ?? "otro");
  await supabase.from("payment_concepts").insert({ nombre, precio, tipo });
  revalidatePath("/admin/conceptos");
}

export async function updateConcept(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id") ?? "");
  const nombre = String(formData.get("nombre") ?? "").trim();
  if (!id || !nombre) return;
  const precio = Number(formData.get("precio") ?? 0) || 0;
  const tipo = String(formData.get("tipo") ?? "otro");
  const activo = formData.get("activo") === "on";
  await supabase
    .from("payment_concepts")
    .update({ nombre, precio, tipo, activo })
    .eq("id", id);
  revalidatePath("/admin/conceptos");
}

export async function deleteConcept(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await supabase.from("payment_concepts").delete().eq("id", id);
  revalidatePath("/admin/conceptos");
}
