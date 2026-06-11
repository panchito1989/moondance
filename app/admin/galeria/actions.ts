"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const MAX_MB = 5;

export async function uploadPhoto(formData: FormData) {
  const supabase = await createClient();
  const file = formData.get("file") as File | null;
  const titulo = String(formData.get("titulo") ?? "").trim() || null;

  if (!file || file.size === 0) return;
  if (!file.type.startsWith("image/")) {
    redirect("/admin/galeria?error=" + encodeURIComponent("Solo imágenes."));
  }
  if (file.size > MAX_MB * 1024 * 1024) {
    redirect(
      "/admin/galeria?error=" +
        encodeURIComponent(`La imagen pesa más de ${MAX_MB}MB.`)
    );
  }

  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `${crypto.randomUUID()}.${ext}`;

  const { error: upErr } = await supabase.storage
    .from("galeria")
    .upload(path, file, { contentType: file.type });
  if (upErr) {
    redirect("/admin/galeria?error=" + encodeURIComponent(upErr.message));
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("galeria").getPublicUrl(path);

  await supabase.from("gallery_photos").insert({ path, url: publicUrl, titulo });
  revalidatePath("/admin/galeria");
  revalidatePath("/");
}

export async function deletePhoto(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id") ?? "");
  const path = String(formData.get("path") ?? "");
  if (!id) return;
  if (path) await supabase.storage.from("galeria").remove([path]);
  await supabase.from("gallery_photos").delete().eq("id", id);
  revalidatePath("/admin/galeria");
  revalidatePath("/");
}
