"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function changePassword(formData: FormData) {
  const supabase = await createClient();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  if (password.length < 6) {
    redirect(
      "/admin/cuenta?error=" +
        encodeURIComponent("La contraseña debe tener al menos 6 caracteres")
    );
  }
  if (password !== confirm) {
    redirect(
      "/admin/cuenta?error=" + encodeURIComponent("Las contraseñas no coinciden")
    );
  }
  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    redirect("/admin/cuenta?error=" + encodeURIComponent(error.message));
  }
  redirect(
    "/admin/cuenta?ok=" + encodeURIComponent("Contraseña actualizada ✔")
  );
}

export async function changeName(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const nombre = String(formData.get("nombre") ?? "").trim();
  if (!user || !nombre) return;
  // RLS: profiles solo lo edita la dueña; para el propio nombre usamos metadata
  // y un update directo que funcionará para la dueña.
  await supabase.auth.updateUser({ data: { nombre } });
  await supabase.from("profiles").update({ nombre }).eq("id", user.id);
  redirect("/admin/cuenta?ok=" + encodeURIComponent("Nombre actualizado ✔"));
}

export async function changeEmail(formData: FormData) {
  const supabase = await createClient();
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return;
  const { error } = await supabase.auth.updateUser({ email });
  if (error) {
    redirect("/admin/cuenta?error=" + encodeURIComponent(error.message));
  }
  redirect(
    "/admin/cuenta?ok=" +
      encodeURIComponent(
        "Te enviamos un correo de confirmación al nuevo correo. El cambio se aplica al confirmarlo."
      )
  );
}
