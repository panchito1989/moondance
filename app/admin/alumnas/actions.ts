"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

function clean(v: FormDataEntryValue | null): string | null {
  const s = String(v ?? "").trim();
  return s === "" ? null : s;
}

function groupIds(formData: FormData): string[] {
  return formData
    .getAll("group_ids")
    .map((v) => String(v))
    .filter(Boolean);
}

export async function createStudent(formData: FormData) {
  const supabase = await createClient();
  const nombre = String(formData.get("nombre") ?? "").trim();
  if (!nombre) return;
  const { data: student } = await supabase
    .from("students")
    .insert({
      nombre,
      tutor: clean(formData.get("tutor")),
      telefono: clean(formData.get("telefono")),
      notas: clean(formData.get("notas")),
    })
    .select("id")
    .single();

  const ids = groupIds(formData);
  if (student && ids.length > 0) {
    await supabase
      .from("student_groups")
      .insert(ids.map((group_id) => ({ student_id: student.id, group_id })));
  }
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
      notas: clean(formData.get("notas")),
      activa: formData.get("activa") === "on",
    })
    .eq("id", id);

  // Reemplaza la inscripción de clases con la nueva selección.
  const ids = groupIds(formData);
  await supabase.from("student_groups").delete().eq("student_id", id);
  if (ids.length > 0) {
    await supabase
      .from("student_groups")
      .insert(ids.map((group_id) => ({ student_id: id, group_id })));
  }
  revalidatePath("/admin/alumnas");
}

export async function deleteStudent(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await supabase.from("students").delete().eq("id", id);
  revalidatePath("/admin/alumnas");
}
