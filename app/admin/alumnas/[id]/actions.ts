"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function registerPayment(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const studentId = String(formData.get("student_id") ?? "");
  const conceptId = String(formData.get("concept_id") ?? "");
  const monto = Number(formData.get("monto") ?? 0);
  if (!user || !studentId || !conceptId || !(monto >= 0)) return;

  await supabase.from("payments").insert({
    student_id: studentId,
    concept_id: conceptId,
    monto,
    fecha: String(formData.get("fecha") ?? "") || undefined,
    metodo: String(formData.get("metodo") ?? "efectivo"),
    nota: String(formData.get("nota") ?? "").trim() || null,
    registrado_por: user.id,
  });
  revalidatePath(`/admin/alumnas/${studentId}`);
}

export async function deletePayment(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id") ?? "");
  const studentId = String(formData.get("student_id") ?? "");
  if (!id) return;
  // RLS: solo la dueña puede borrar pagos.
  await supabase.from("payments").delete().eq("id", id);
  revalidatePath(`/admin/alumnas/${studentId}`);
}
