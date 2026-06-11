"use client";

/* eslint-disable @next/next/no-img-element */
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

type Foto = { url: string; titulo: string | null };

export default function GaleriaLightbox({ fotos }: { fotos: Foto[] }) {
  const [abierta, setAbierta] = useState<number | null>(null);

  const cerrar = useCallback(() => setAbierta(null), []);
  const anterior = useCallback(
    () =>
      setAbierta((i) => (i === null ? null : (i - 1 + fotos.length) % fotos.length)),
    [fotos.length]
  );
  const siguiente = useCallback(
    () => setAbierta((i) => (i === null ? null : (i + 1) % fotos.length)),
    [fotos.length]
  );

  useEffect(() => {
    if (abierta === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") cerrar();
      if (e.key === "ArrowLeft") anterior();
      if (e.key === "ArrowRight") siguiente();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [abierta, cerrar, anterior, siguiente]);

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {fotos.map((f, i) => (
          <button
            key={f.url}
            type="button"
            onClick={() => setAbierta(i)}
            className="relative aspect-square rounded-2xl overflow-hidden border border-zinc-800 hover:border-fuchsia-500/60 transition group cursor-zoom-in"
            aria-label={`Ver foto ${i + 1} en grande`}
          >
            <Image
              src={f.url}
              alt={f.titulo ?? `Galería MoonDance ${i + 1}`}
              fill
              sizes="(max-width: 640px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            {f.titulo && (
              <span className="absolute bottom-2 left-3 text-xs text-gray-200">
                {f.titulo}
              </span>
            )}
          </button>
        ))}
      </div>

      {abierta !== null && fotos[abierta] && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4"
          onClick={cerrar}
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            onClick={cerrar}
            aria-label="Cerrar"
            className="absolute top-4 right-4 z-10 rounded-full border border-zinc-700 w-10 h-10 text-xl text-gray-300 hover:bg-zinc-800"
          >
            ✕
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              anterior();
            }}
            aria-label="Anterior"
            className="absolute left-2 sm:left-6 z-10 rounded-full border border-zinc-700 w-11 h-11 text-2xl text-gray-300 hover:bg-zinc-800"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              siguiente();
            }}
            aria-label="Siguiente"
            className="absolute right-2 sm:right-6 z-10 rounded-full border border-zinc-700 w-11 h-11 text-2xl text-gray-300 hover:bg-zinc-800"
          >
            ›
          </button>

          <img
            src={fotos[abierta].url}
            alt={fotos[abierta].titulo ?? "Foto de galería"}
            className="max-h-[82vh] max-w-[92vw] object-contain rounded-xl shadow-[0_0_60px_rgba(217,70,239,0.25)]"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="mt-4 text-center" onClick={(e) => e.stopPropagation()}>
            {fotos[abierta].titulo && (
              <p className="text-sm text-gray-200">{fotos[abierta].titulo}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              {abierta + 1} / {fotos.length}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
