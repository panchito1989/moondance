export type SocialKind = "tiktok" | "instagram" | "facebook";

const BASES: Record<SocialKind, string> = {
  tiktok: "https://www.tiktok.com/@",
  instagram: "https://www.instagram.com/",
  facebook: "https://www.facebook.com/",
};

/** Acepta "@usuario", "usuario" o el link completo y devuelve la URL. */
export function socialUrl(kind: SocialKind, value: string | null): string | null {
  if (!value) return null;
  const v = value.trim();
  if (!v) return null;
  if (v.startsWith("http://") || v.startsWith("https://")) return v;
  return BASES[kind] + v.replace(/^@/, "");
}
