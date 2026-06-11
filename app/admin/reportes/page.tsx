import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { formatMXN } from "@/lib/money";
import { canViewReports, type Rol } from "@/lib/permissions";

export default async function ReportesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase.from("profiles").select("rol").eq("id", user.id).single()
    : { data: null };

  if (!profile || !canViewReports(profile.rol as Rol)) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-2">Reportes</h1>
        <p className="text-gray-500">
          Esta sección es solo para la dueña del estudio.
        </p>
      </div>
    );
  }

  const hoy = new Date().toISOString().slice(0, 10);
  const inicioMes = hoy.slice(0, 8) + "01";
  const anio = hoy.slice(0, 4);

  const [
    { data: pagosMes },
    { count: asistHoy },
    { count: asistMes },
    { data: alumnas },
    { data: pagosAnualidad },
  ] = await Promise.all([
    supabase
      .from("payments")
      .select("monto, fecha, payment_concepts(nombre)")
      .gte("fecha", inicioMes),
    supabase
      .from("attendance")
      .select("*", { count: "exact", head: true })
      .eq("fecha", hoy)
      .eq("presente", true),
    supabase
      .from("attendance")
      .select("*", { count: "exact", head: true })
      .gte("fecha", inicioMes)
      .eq("presente", true),
    supabase
      .from("students")
      .select("id, nombre")
      .eq("activa", true)
      .order("nombre"),
    supabase
      .from("payments")
      .select("student_id, payment_concepts!inner(tipo)")
      .gte("fecha", `${anio}-01-01`)
      .eq("payment_concepts.tipo", "anualidad"),
  ]);

  const pagos = pagosMes ?? [];
  const totalHoy = pagos
    .filter((p) => p.fecha === hoy)
    .reduce((s, p) => s + Number(p.monto), 0);
  const totalMes = pagos.reduce((s, p) => s + Number(p.monto), 0);

  const porConcepto: Record<string, { total: number; n: number }> = {};
  for (const p of pagos) {
    const nombre = Array.isArray(p.payment_concepts)
      ? "Otro"
      : ((p.payment_concepts as { nombre: string } | null)?.nombre ?? "Otro");
    porConcepto[nombre] ??= { total: 0, n: 0 };
    porConcepto[nombre].total += Number(p.monto);
    porConcepto[nombre].n += 1;
  }

  const pagaronAnualidad = new Set(
    (pagosAnualidad ?? []).map((p) => p.student_id)
  );
  const sinAnualidad = (alumnas ?? []).filter(
    (a) => !pagaronAnualidad.has(a.id)
  );

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold mb-1">Reportes</h1>
      <p className="text-gray-500 mb-6">Resumen del estudio.</p>

      <div className="grid sm:grid-cols-4 gap-3 mb-8">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="text-2xl font-bold">{formatMXN(totalHoy)}</div>
          <div className="text-xs text-gray-500">Ingresos de hoy</div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="text-2xl font-bold">{formatMXN(totalMes)}</div>
          <div className="text-xs text-gray-500">Ingresos del mes</div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="text-2xl font-bold">{asistHoy ?? 0}</div>
          <div className="text-xs text-gray-500">Asistencias hoy</div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="text-2xl font-bold">{asistMes ?? 0}</div>
          <div className="text-xs text-gray-500">Asistencias del mes</div>
        </div>
      </div>

      <h2 className="font-semibold mb-2">Ingresos del mes por concepto</h2>
      <div className="flex flex-col gap-2 mb-8">
        {Object.keys(porConcepto).length === 0 && (
          <p className="text-gray-400 text-sm">Sin pagos este mes.</p>
        )}
        {Object.entries(porConcepto)
          .sort((a, b) => b[1].total - a[1].total)
          .map(([nombre, v]) => (
            <div
              key={nombre}
              className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-white text-sm"
            >
              <span>
                {nombre} <span className="text-gray-400">×{v.n}</span>
              </span>
              <span className="font-semibold">{formatMXN(v.total)}</span>
            </div>
          ))}
      </div>

      <h2 className="font-semibold mb-2">
        Sin pagar anualidad {anio} ({sinAnualidad.length})
      </h2>
      <div className="flex flex-col gap-1 mb-4">
        {sinAnualidad.length === 0 ? (
          <p className="text-green-600 text-sm">
            🎉 Todas las alumnas activas han pagado su anualidad.
          </p>
        ) : (
          sinAnualidad.map((a) => (
            <Link
              key={a.id}
              href={`/admin/alumnas/${a.id}`}
              className="text-sm text-blue-600 hover:underline"
            >
              {a.nombre} →
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
