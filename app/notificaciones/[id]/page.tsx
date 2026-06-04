"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Download, FileSpreadsheet } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Timeline } from "@/components/notificaciones/Timeline";
import { ArchivosList } from "@/components/notificaciones/ArchivosList";
import { EstadoBadge } from "@/components/ui/EstadoBadge";
import { PrioridadBadge } from "@/components/ui/PrioridadBadge";
import { SlaBadge } from "@/components/ui/SlaBadge";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { enrichNotificacion } from "@/lib/enrich";
import { formatFechaHora } from "@/lib/utils";
import {
  exportExpedientePdf,
  exportToExcel,
  notificacionToExportRow,
  COLUMNAS_RH,
} from "@/lib/export";
import type { Notificacion } from "@/lib/types";

export default function NotificacionDetallePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [notif, setNotif] = useState<ReturnType<typeof enrichNotificacion> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/notificaciones/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.notificacion) {
          setNotif(enrichNotificacion(d.notificacion as Notificacion));
        }
        setLoading(false);
      });
  }, [id]);

  const exportPdf = async () => {
    if (!notif) return;
    await exportExpedientePdf(notif.numeroExpediente, [
      {
        titulo: "Datos generales",
        lineas: [
          `Expediente: ${notif.numeroExpediente}`,
          `Incidencia: ${notif.numeroIncidencia || "—"}`,
          `Colaborador: ${notif.colaboradorNombre}`,
          `Área: ${notif.areaEmision}`,
          `Estado: ${notif.estado}`,
          `Prioridad: ${notif.prioridad}`,
          `Asignado: ${notif.asignadoANombre || "—"}`,
        ],
      },
      { titulo: "Contenido", lineas: [notif.contenido] },
      ...notif.resoluciones.map((r) => ({
        titulo: `Resolución ${r.codigo}`,
        lineas: [r.comentarios, `Por: ${r.autorNombre} — ${formatFechaHora(r.fechaHora)}`],
      })),
      {
        titulo: "Auditoría",
        lineas: notif.timeline.map(
          (t) => `${formatFechaHora(t.fechaHora)} — ${t.descripcion}`
        ),
      },
    ]);
  };

  const exportExcel = async () => {
    if (!notif) return;
    await exportToExcel(
      notif.numeroExpediente,
      "Expediente",
      COLUMNAS_RH,
      [notificacionToExportRow(notif)]
    );
  };

  return (
    <ProtectedRoute
      roles={["colaborador", "recursos_humanos", "gerencia", "administracion"]}
    >
      <DashboardShell title={`Expediente ${notif?.numeroExpediente || ""}`}>
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm text-zeus-navy hover:underline mb-4"
        >
          <ArrowLeft size={16} />
          Volver
        </button>

        {loading ? (
          <TableSkeleton rows={4} cols={4} />
        ) : !notif ? (
          <p className="text-center text-zeus-gray-text py-12">
            Notificación no encontrada.
          </p>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2 justify-end">
              <button
                type="button"
                onClick={exportExcel}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800"
              >
                <FileSpreadsheet size={14} />
                Exportar Excel
              </button>
              <button
                type="button"
                onClick={exportPdf}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-red-200 bg-red-50 text-red-800"
              >
                <Download size={14} />
                Exportar PDF expediente
              </button>
            </div>

            <div className="zeus-card p-6">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-zeus-navy">
                    {notif.numeroExpediente}
                  </h2>
                  <p className="text-sm text-zeus-gray-text mt-1">
                    {notif.tipoNotificacion} · {formatFechaHora(notif.fechaHora)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <EstadoBadge estado={notif.estado} />
                  <PrioridadBadge prioridad={notif.prioridad} />
                  <SlaBadge
                    diasRestantes={notif.diasRestantes}
                    vencido={notif.slaVencido}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4 mb-6">
                {[
                  ["Colaborador", notif.colaboradorNombre],
                  ["Área emisión", notif.areaEmision],
                  ["Área recepción", notif.areaRecepcion],
                  ["Asignado a", notif.asignadoANombre || "—"],
                  ["Incidencia", notif.numeroIncidencia || "—"],
                  ["Fecha límite SLA", formatFechaHora(notif.fechaLimite)],
                ].map(([label, value]) => (
                  <div key={label} className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs text-zeus-gray-text">{label}</p>
                    <p className="text-sm font-medium mt-0.5">{value}</p>
                  </div>
                ))}
              </div>

              <div className="mb-6">
                <h3 className="text-xs font-semibold uppercase text-zeus-navy mb-2">
                  Contenido
                </h3>
                <p className="text-sm whitespace-pre-wrap bg-slate-50 rounded-lg p-4">
                  {notif.contenido}
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-xs font-semibold uppercase text-zeus-navy mb-2">
                  Archivos adjuntos
                </h3>
                <ArchivosList archivos={notif.archivos} />
              </div>

              {notif.notasInternas && notif.notasInternas.length > 0 && (
                <div className="mb-6 p-4 rounded-lg border border-amber-200 bg-amber-50/50">
                  <h3 className="text-xs font-semibold uppercase text-amber-800 mb-2">
                    Notas internas (solo RRHH)
                  </h3>
                  {notif.notasInternas.map((nota) => (
                    <div key={nota.id} className="text-sm mb-2 last:mb-0">
                      <p className="text-slate-700">{nota.texto}</p>
                      <p className="text-xs text-amber-700 mt-1">
                        {nota.autorNombre} · {formatFechaHora(nota.fechaHora)}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {notif.resoluciones.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xs font-semibold uppercase text-zeus-navy mb-3">
                    Resoluciones
                  </h3>
                  <div className="space-y-3">
                    {notif.resoluciones.map((r) => (
                      <div
                        key={r.id}
                        className="border border-zeus-border rounded-lg p-4"
                      >
                        <p className="font-medium text-zeus-navy">{r.codigo}</p>
                        <p className="text-sm mt-2 whitespace-pre-wrap">
                          {r.comentarios}
                        </p>
                        <p className="text-xs text-zeus-gray-text mt-2">
                          {r.autorNombre} · {formatFechaHora(r.fechaHora)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="zeus-card p-6">
              <Timeline eventos={notif.timeline} expediente={notif.numeroExpediente} />
            </div>
          </div>
        )}
      </DashboardShell>
    </ProtectedRoute>
  );
}
