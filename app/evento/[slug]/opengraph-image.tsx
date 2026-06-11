import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Flyer del evento · MoonDance Studio";

type Props = { params: Promise<{ slug: string }> };

async function getEvent(slug: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  const res = await fetch(
    `${url}/rest/v1/events?slug=eq.${encodeURIComponent(
      slug
    )}&activo=eq.true&select=titulo,descripcion,precio,fecha&limit=1`,
    { headers: { apikey: key }, next: { revalidate: 300 } }
  );
  if (!res.ok) return null;
  const rows = (await res.json()) as Array<{
    titulo: string;
    descripcion: string | null;
    precio: number;
    fecha: string | null;
  }>;
  return rows[0] ?? null;
}

export default async function OgImage({ params }: Props) {
  const { slug } = await params;
  const event = await getEvent(slug);

  const titulo = event?.titulo ?? "MoonDance Studio";
  const precio = Number(event?.precio ?? 0);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#000000",
          color: "#ffffff",
          fontFamily: "sans-serif",
          padding: 60,
          border: "16px solid #d946ef",
        }}
      >
        <div
          style={{
            fontSize: 28,
            letterSpacing: 12,
            color: "#22d3ee",
            marginBottom: 30,
          }}
        >
          EVENTO ESPECIAL
        </div>
        <div
          style={{
            fontSize: titulo.length > 30 ? 64 : 84,
            fontWeight: 800,
            textAlign: "center",
            color: "#d946ef",
            marginBottom: 30,
            lineHeight: 1.1,
          }}
        >
          {titulo}
        </div>
        {event?.fecha && (
          <div style={{ fontSize: 36, color: "#e5e5e5", marginBottom: 16 }}>
            📅 {event.fecha}
          </div>
        )}
        {precio > 0 && (
          <div style={{ fontSize: 52, fontWeight: 700, color: "#a3e635" }}>
            ${precio.toFixed(2)} MXN
          </div>
        )}
        <div
          style={{
            marginTop: 40,
            fontSize: 30,
            color: "#9ca3af",
          }}
        >
          MoonDance Studio 🌙
        </div>
      </div>
    ),
    { ...size }
  );
}
