"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import sharp from "sharp";

const MAX_MB = 7;

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

  // Compresión automática: máx 1600px por lado, WebP calidad 80.
  // Una foto de celular de ~5MB queda en ~150-400KB sin pérdida visible en web.
  let optimized: Buffer;
  try {
    const original = Buffer.from(await file.arrayBuffer());
    optimized = await sharp(original)
      .rotate() // respeta la orientación EXIF
      .resize(1600, 1600, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();
  } catch {
    redirect(
      "/admin/galeria?error=" +
        encodeURIComponent("No se pudo procesar la imagen. ¿Es una foto válida?")
    );
  }

  const path = `${crypto.randomUUID()}.webp`;
  const { error: upErr } = await supabase.storage
    .from("galeria")
    .upload(path, optimized, { contentType: "image/webp" });
  if (upErr) {
    redirect("/admin/galeria?error=" + encodeURIComponent(upErr.message));
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("galeria").getPublicUrl(path);

  await supabase.from("gallery_photos").insert({ path, url: publicUrl, titulo });
  revalidatePath("/admin/galeria");
  revalidatePath("/");
  revalidatePath("/galeria");
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
  revalidatePath("/galeria");
}
