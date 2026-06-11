"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function toggleRead(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id") ?? "");
  const leido = formData.get("leido") === "true";
  if (!id) return;
  await supabase.from("event_invitations").update({ leido: !leido }).eq("id", id);
  revalidatePath("/admin/invitaciones");
}

export async function deleteInvitation(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await supabase.from("event_invitations").delete().eq("id", id);
  revalidatePath("/admin/invitaciones");
}
