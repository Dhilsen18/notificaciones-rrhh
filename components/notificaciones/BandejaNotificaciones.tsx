"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ExternalLink,
  Eye,
  FileText,
  History,
  MessageSquare,
  Paperclip,
  Pencil,
  Settings,
} from "lucide-react";
import { useBandeja } from "@/hooks/useBandeja";
import { TableToolbar, type TabItem } from "@/components/ui/TableToolbar";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { EstadoBadge } from "@/components/ui/EstadoBadge";
import { PrioridadBadge } from "@/components/ui/PrioridadBadge";
import { SlaBadge } from "@/components/ui/SlaBadge";
import { Modal, ModalSection } from "@/components/ui/Modal";
import { ArchivosList } from "@/components/notificaciones/ArchivosList";
import { Timeline } from "@/components/notificaciones/Timeline";
import { ModalAccionesRH } from "@/components/notificaciones/ModalAccionesRH";
import { ModalAccionesDerivada } from "@/components/notificaciones/ModalAccionesDerivada";
import { formatFechaHora } from "@/lib/utils";
import {
  exportToExcel,
  exportToPdf,
  exportExpedientePdf,
  notificacionToExportRow,
  COLUMNAS_COLABORADOR,
  COLUMNAS_RH,
  COLUMNAS_DERIVADAS,
  type ExportColumn,
} from "@/lib/export";
import type { Notificacion, NotificacionEnriquecida, TabBandeja } from "@/lib/types";
import { useAuth } from "@/components/providers/AuthProvider";

type Variant = "colaborador" | "rh" | "derivada";

const VISTA_MAP: Record<Variant, string> = {
  colaborador: "mis-notificaciones",
  rh: "rh",
  derivada: "gerencia",
};

interface Props {
  variant: Variant;
  title: string;
  vistaOverride?: string;
  areaLabel?: string;
  extraToolbar?: React.ReactNode;
}

export function BandejaNotificaciones({
  variant,
  title,
  vistaOverride,
  areaLabel = "Gerencia",
}: Props) {
  const { user } = useAuth();
  const vista =
    vistaOverride ?? (variant === "derivada" ? "gerencia" : VISTA_MAP[variant]);
  const bandeja = useBandeja(vista, user?.id);
  const {
    enriched,
    filtradas,
    loading,
    exportLoading,
    setExportLoading,
    load,
    tab,
    setTab,
    busqueda,
    setBusqueda,
    estado,
    setEstado,
    prioridad,
    setPrioridad,
    area,
    setArea,
    soloVencidos,
    setSoloVencidos,
    tabCounts,
  } = bandeja;

  const [selected, setSelected] = useState<Notificacion | null>(null);
  const [contenidoModal, setContenidoModal] = useState<NotificacionEnriquecida | null>(null);
  const [archivosModal, setArchivosModal] = useState<NotificacionEnriquecida | null>(null);
  const [resolucionModal, setResolucionModal] = useState<NotificacionEnriquecida | null>(null);
  const [timelineModal, setTimelineModal] = useState<NotificacionEnriquecida | null>(null);

  const tabs: TabItem[] = [
    { id: "todos", label: "Todos", count: tabCounts.todos },
    { id: "activos", label: "Activos", count: tabCounts.activos },
    { id: "pendientes", label: "Pendientes", count: tabCounts.pendientes },
    { id: "derivados", label: "Derivados", count: tabCounts.derivados },
    { id: "resueltos", label: "Resueltos", count: tabCounts.resueltos },
    { id: "archivados", label: "Archivados", count: tabCounts.archivados },
    ...(variant === "colaborador"
      ? [{ id: "notificados" as TabBandeja, label: "Notificados", count: tabCounts.notificados }]
      : []),
  ];

  const columns: ExportColumn[] =
    variant === "rh"
      ? COLUMNAS_RH
      : variant === "derivada"
        ? COLUMNAS_DERIVADAS
        : COLUMNAS_COLABORADOR;

  const exportRows = filtradas.map((n) => notificacionToExportRow(n));

  const handleExportExcel = async () => {
    setExportLoading(true);
    try {
      await exportToExcel(
        `zeus-${variant}-${new Date().toISOString().slice(0, 10)}`,
        title,
        columns,
        exportRows
      );
    } finally {
      setExportLoading(false);
    }
  };

  const handleExportPdf = async () => {
    setExportLoading(true);
    try {
      await exportToPdf(
        title,
        `zeus-${variant}-${new Date().toISOString().slice(0, 10)}`,
        columns,
        exportRows,
        `${filtradas.length} registros exportados`
      );
    } finally {
      setExportLoading(false);
    }
  };

  const handleExportExpediente = async (n: NotificacionEnriquecida) => {
    await exportExpedientePdf(n.numeroExpediente, [
      {
        titulo: "Información general",
        lineas: [
          `Expediente: ${n.numeroExpediente}`,
          `Colaborador: ${n.colaboradorNombre}`,
          `Estado: ${n.estado}`,
          `Prioridad: ${n.prioridad}`,
        ],
      },
      { titulo: "Contenido", lineas: [n.contenido] },
      {
        titulo: "Timeline",
        lineas: n.timeline.map(
          (t) => `${formatFechaHora(t.fechaHora)} — ${t.accion}: ${t.descripcion}`
        ),
      },
    ]);
  };

  return (
    <div className="zeus-card overflow-hidden">
      <TableToolbar
        title={title}
        tabs={tabs}
        activeTab={tab}
        onTabChange={setTab}
        busqueda={busqueda}
        onBusquedaChange={setBusqueda}
        totalFiltrado={filtradas.length}
        totalGeneral={enriched.length}
        onExportExcel={handleExportExcel}
        onExportPdf={handleExportPdf}
        exportLoading={exportLoading}
        showPrioridadFilter
        showEstadoFilter
        showAreaFilter={variant !== "derivada"}
        showSlaFilter
        prioridad={prioridad}
        onPrioridadChange={setPrioridad}
        estado={estado}
        onEstadoChange={setEstado}
        area={area}
        onAreaChange={setArea}
        soloVencidos={soloVencidos}
        onSoloVencidosChange={setSoloVencidos}
      />

      {loading ? (
        <TableSkeleton />
      ) : filtradas.length === 0 ? (
        <EmptyState
          actionLabel={variant === "colaborador" ? "Registrar notificación" : undefined}
          actionHref={variant === "colaborador" ? "/registrar" : undefined}
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="zeus-table">
            <thead>
              <tr>
                {variant === "rh" && <th>ID</th>}
                <th>Fecha</th>
                <th>Expediente</th>
                <th>Incidencia</th>
                {variant !== "colaborador" && <th>Colaborador</th>}
                <th>Área</th>
                {variant === "rh" && <th>Área Recep.</th>}
                {variant === "derivada" && <th>Responsable</th>}
                <th>Prioridad</th>
                <th>SLA</th>
                <th>Tipo</th>
                {variant === "colaborador" && <th>Pedido</th>}
                <th>Estado</th>
                <th>Resolución</th>
                <th>Historial</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtradas.map((n) => (
                <tr key={n.id}>
                  {variant === "rh" && (
                    <td className="text-xs font-mono">{n.id.slice(0, 8)}</td>
                  )}
                  <td className="whitespace-nowrap text-xs">
                    {formatFechaHora(n.fechaHora)}
                  </td>
                  <td className="font-medium text-zeus-navy whitespace-nowrap">
                    {n.numeroExpediente}
                  </td>
                  <td>{n.numeroIncidencia || "—"}</td>
                  {variant !== "colaborador" && <td>{n.colaboradorNombre}</td>}
                  <td className="text-xs">{n.areaEmision}</td>
                  {variant === "rh" && (
                    <td className="text-xs">{n.areaRecepcion}</td>
                  )}
                  {variant === "derivada" && (
                    <td className="text-xs">{n.derivadoPorNombre || "—"}</td>
                  )}
                  <td>
                    <PrioridadBadge prioridad={n.prioridad} />
                  </td>
                  <td>
                    <SlaBadge
                      diasRestantes={n.diasRestantes}
                      vencido={n.slaVencido}
                    />
                  </td>
                  <td className="text-xs max-w-[120px] truncate">
                    {n.tipoNotificacion}
                  </td>
                  {variant === "colaborador" && (
                    <td>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => setContenidoModal(n)}
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-zeus-navy"
                        >
                          <MessageSquare size={16} />
                        </button>
                        {n.archivos.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setArchivosModal(n)}
                            className="p-1.5 rounded-lg hover:bg-blue-50 text-zeus-navy"
                          >
                            <Paperclip size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                  <td>
                    <EstadoBadge estado={n.estado} />
                  </td>
                  <td>
                    {n.resoluciones.length > 0 ? (
                      <button
                        type="button"
                        onClick={() => setResolucionModal(n)}
                        className="p-1.5 rounded-lg hover:bg-green-50 text-green-700"
                      >
                        <FileText size={16} />
                      </button>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => setTimelineModal(n)}
                      className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg bg-zeus-navy/5 hover:bg-zeus-navy/10 text-zeus-navy text-xs font-medium"
                    >
                      <History size={14} />
                      {n.timeline.length}
                    </button>
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      <Link
                        href={`/notificaciones/${n.id}`}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600"
                        title="Ver detalle"
                      >
                        <Eye size={16} />
                      </Link>
                      {variant === "rh" && (
                        <button
                          type="button"
                          onClick={() => setSelected(n)}
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-zeus-navy"
                        >
                          <Pencil size={16} />
                        </button>
                      )}
                      {variant === "derivada" && (
                        <button
                          type="button"
                          onClick={() => setSelected(n)}
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-zeus-navy"
                        >
                          <Settings size={16} />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleExportExpediente(n)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-red-700"
                        title="PDF expediente"
                      >
                        <ExternalLink size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {variant === "rh" && (
        <ModalAccionesRH
          notificacion={selected}
          open={!!selected}
          onClose={() => setSelected(null)}
          onUpdated={load}
        />
      )}
      {variant === "derivada" && (
        <ModalAccionesDerivada
          notificacion={selected}
          open={!!selected}
          onClose={() => setSelected(null)}
          onUpdated={load}
          areaLabel={areaLabel}
        />
      )}

      <Modal open={!!contenidoModal} onClose={() => setContenidoModal(null)} title="Contenido" size="md">
        <p className="text-sm whitespace-pre-wrap">{contenidoModal?.contenido}</p>
      </Modal>
      <Modal open={!!archivosModal} onClose={() => setArchivosModal(null)} title="Archivos" size="md">
        <ArchivosList archivos={archivosModal?.archivos || []} />
      </Modal>
      <Modal open={!!resolucionModal} onClose={() => setResolucionModal(null)} title="Resoluciones" size="lg">
        {resolucionModal?.resoluciones.map((r) => (
          <ModalSection
            key={r.id}
            title={`${r.codigo} — ${r.tipo === "rh" ? "RH" : r.areaDerivada}`}
          >
            <p className="text-sm whitespace-pre-wrap">{r.comentarios}</p>
            <ArchivosList archivos={r.archivos} />
            <p className="text-xs text-zeus-gray-text mt-2">
              {formatFechaHora(r.fechaHora)} · {r.autorNombre}
            </p>
          </ModalSection>
        ))}
      </Modal>
      <Modal
        open={!!timelineModal}
        onClose={() => setTimelineModal(null)}
        title={`Auditoría — ${timelineModal?.numeroExpediente}`}
        size="xl"
      >
        <Timeline
          eventos={timelineModal?.timeline || []}
          expediente={timelineModal?.numeroExpediente}
        />
      </Modal>
    </div>
  );
}
