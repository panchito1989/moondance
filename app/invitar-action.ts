"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function sendInvitation(formData: FormData) {
  // Honeypot anti-spam: campo oculto que un humano deja vacío.
  if (String(formData.get("web") ?? "") !== "") {
    redirect("/?invitacion=ok#invitar");
  }

  const nombre = String(formData.get("nombre") ?? "").trim();
  const contacto = String(formData.get("contacto") ?? "").trim();
  const mensaje = String(formData.get("mensaje") ?? "").trim() || null;

  if (!nombre || !contacto) {
    redirect("/?invitacion=error#invitar");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("event_invitations")
    .insert({ nombre, contacto, mensaje });

  redirect(error ? "/?invitacion=error#invitar" : "/?invitacion=ok#invitar");
}
