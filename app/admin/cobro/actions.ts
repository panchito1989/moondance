"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";

async function getUid(supabase: SupabaseClient): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function chargeAndAttend(formData: FormData) {
  const supabase = await createClient();
  const uid = await getUid(supabase);
  const studentId = String(formData.get("student_id") ?? "");
  const fecha = String(formData.get("fecha") ?? "");
  if (!uid || !studentId || !fecha) return;

  const { data: clase } = await supabase
    .from("payment_concepts")
    .select("id, precio")
    .eq("tipo", "clase")
    .eq("activo", true)
    .order("created_at")
    .limit(1)
    .maybeSingle();

  let paymentId: string | null = null;
  if (clase) {
    const { data: pay } = await supabase
      .from("payments")
      .insert({
        student_id: studentId,
        concept_id: clase.id,
        monto: clase.precio,
        fecha,
        registrado_por: uid,
      })
      .select("id")
      .single();
    paymentId = pay?.id ?? null;
  }

  await supabase.from("attendance").upsert(
    {
      student_id: studentId,
      fecha,
      presente: true,
      payment_id: paymentId,
      registrado_por: uid,
    },
    { onConflict: "student_id,fecha" }
  );
  revalidatePath("/admin/cobro");
}

export async function attendOnly(formData: FormData) {
  const supabase = await createClient();
  const uid = await getUid(supabase);
  const studentId = String(formData.get("student_id") ?? "");
  const fecha = String(formData.get("fecha") ?? "");
  if (!uid || !studentId || !fecha) return;
  await supabase.from("attendance").upsert(
    { student_id: studentId, fecha, presente: true, registrado_por: uid },
    { onConflict: "student_id,fecha" }
  );
  revalidatePath("/admin/cobro");
}

export async function undoDay(formData: FormData) {
  const supabase = await createClient();
  const studentId = String(formData.get("student_id") ?? "");
  const fecha = String(formData.get("fecha") ?? "");
  if (!studentId || !fecha) return;

  const { data: att } = await supabase
    .from("attendance")
    .select("payment_id")
    .eq("student_id", studentId)
    .eq("fecha", fecha)
    .maybeSingle();

  await supabase
    .from("attendance")
    .delete()
    .eq("student_id", studentId)
    .eq("fecha", fecha);

  // El pago ligado solo lo puede borrar la dueña (RLS); para maestro queda registrado.
  if (att?.payment_id) {
    await supabase.from("payments").delete().eq("id", att.payment_id);
  }
  revalidatePath("/admin/cobro");
}
