"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

function clean(v: FormDataEntryValue | null): string | null {
  const s = String(v ?? "").trim();
  return s === "" ? null : s;
}

export async function createStudent(formData: FormData) {
  const supabase = await createClient();
  const nombre = String(formData.get("nombre") ?? "").trim();
  if (!nombre) return;
  await supabase.from("students").insert({
    nombre,
    tutor: clean(formData.get("tutor")),
    telefono: clean(formData.get("telefono")),
    group_id: clean(formData.get("group_id")),
    notas: clean(formData.get("notas")),
  });
  revalidatePath("/admin/alumnas");
}

export async function updateStudent(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id") ?? "");
  const nombre = String(formData.get("nombre") ?? "").trim();
  if (!id || !nombre) return;
  await supabase
    .from("students")
    .update({
      nombre,
      tutor: clean(formData.get("tutor")),
      telefono: clean(formData.get("telefono")),
      group_id: clean(formData.get("group_id")),
      notas: clean(formData.get("notas")),
      activa: formData.get("activa") === "on",
    })
    .eq("id", id);
  revalidatePath("/admin/alumnas");
}

export async function deleteStudent(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await supabase.from("students").delete().eq("id", id);
  revalidatePath("/admin/alumnas");
}
