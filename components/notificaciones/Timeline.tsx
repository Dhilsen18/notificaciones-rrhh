"use client";

import type { EventoTimeline } from "@/lib/types";
import {
  ArrowRight,
  Bell,
  CheckCircle2,
  CircleDot,
  Clock,
  FileText,
  GitBranch,
  History,
  Send,
  User,
} from "lucide-react";

const ACCION_CONFIG: Record<
  string,
  {
    label: string;
    icon: React.ReactNode;
    nodeBg: string;
    nodeRing: string;
    cardBorder: string;
    badgeBg: string;
    badgeText: string;
    lineColor: string;
  }
> = {
  REGISTRO: {
    label: "Registro de notificación",
    icon: <FileText size={16} />,
    nodeBg: "bg-blue-600",
    nodeRing: "ring-blue-100",
    cardBorder: "border-l-blue-500",
    badgeBg: "bg-blue-50",
    badgeText: "text-blue-700",
    lineColor: "from-blue-200",
  },
  RESOLUCION_RH: {
    label: "Resolución Recursos Humanos",
    icon: <CheckCircle2 size={16} />,
    nodeBg: "bg-emerald-600",
    nodeRing: "ring-emerald-100",
    cardBorder: "border-l-emerald-500",
    badgeBg: "bg-emerald-50",
    badgeText: "text-emerald-700",
    lineColor: "from-emerald-200",
  },
  DERIVACION: {
    label: "Derivación de área",
    icon: <GitBranch size={16} />,
    nodeBg: "bg-amber-500",
    nodeRing: "ring-amber-100",
    cardBorder: "border-l-amber-500",
    badgeBg: "bg-amber-50",
    badgeText: "text-amber-700",
    lineColor: "from-amber-200",
  },
  RESOLUCION_DERIVADA: {
    label: "Respuesta área derivada",
    icon: <ArrowRight size={16} />,
    nodeBg: "bg-violet-600",
    nodeRing: "ring-violet-100",
    cardBorder: "border-l-violet-500",
    badgeBg: "bg-violet-50",
    badgeText: "text-violet-700",
    lineColor: "from-violet-200",
  },
  NOTIFICACION_RH: {
    label: "Notificación enviada por RH",
    icon: <Bell size={16} />,
    nodeBg: "bg-sky-600",
    nodeRing: "ring-sky-100",
    cardBorder: "border-l-sky-500",
    badgeBg: "bg-sky-50",
    badgeText: "text-sky-700",
    lineColor: "from-sky-200",
  },
};

const DEFAULT_CONFIG = {
  label: "Acción registrada",
  icon: <Send size={16} />,
  nodeBg: "bg-zeus-navy",
  nodeRing: "ring-slate-100",
  cardBorder: "border-l-zeus-navy",
  badgeBg: "bg-slate-100",
  badgeText: "text-slate-700",
  lineColor: "from-slate-200",
};

const ROL_LABELS: Record<string, string> = {
  colaborador: "Colaborador",
  recursos_humanos: "Recursos Humanos",
  gerencia: "Gerencia",
  administracion: "Administración",
};

function formatHora(iso: string) {
  return new Intl.DateTimeFormat("es-PE", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function formatFecha(iso: string) {
  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

function getInitials(nombre: string) {
  return nombre
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function MetadataChips({
  metadata,
}: {
  metadata?: Record<string, string | number | boolean>;
}) {
  if (!metadata || !Object.keys(metadata).length) return null;

  const labels: Record<string, string> = {
    expediente: "Expediente",
    codigo: "Resolución",
    estado: "Estado",
    area: "Área",
    colaborador: "Colaborador",
  };

  return (
    <div className="flex flex-wrap gap-1.5 mt-3">
      {Object.entries(metadata).map(([key, value]) => (
        <span
          key={key}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-zeus-border text-[11px] font-medium text-slate-600"
        >
          <span className="text-zeus-gray-text">{labels[key] || key}:</span>
          <span className="text-zeus-navy">{String(value)}</span>
        </span>
      ))}
    </div>
  );
}

interface TimelineProps {
  eventos: EventoTimeline[];
  expediente?: string;
  compact?: boolean;
}

export function Timeline({ eventos, expediente, compact = false }: TimelineProps) {
  const sorted = [...eventos].sort(
    (a, b) => new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime()
  );

  if (!sorted.length) {
    return (
      <div className="flex flex-col items-center justify-center py-10 px-4 text-center rounded-xl border border-dashed border-zeus-border bg-slate-50/50">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
          <History size={22} className="text-zeus-gray-text" />
        </div>
        <p className="text-sm font-medium text-slate-600">Sin eventos registrados</p>
        <p className="text-xs text-zeus-gray-text mt-1">
          Las acciones sobre esta notificación aparecerán aquí
        </p>
      </div>
    );
  }

  const firstDate = sorted[0].fechaHora;
  const lastDate = sorted[sorted.length - 1].fechaHora;

  return (
    <div className="timeline-root">
      {!compact && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 p-4 rounded-xl bg-gradient-to-r from-zeus-navy to-zeus-navy-light text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
              <History size={20} />
            </div>
            <div>
              <p className="font-semibold text-sm">Historial de auditoría</p>
              <p className="text-xs text-blue-100 mt-0.5">
                {expediente ? `Expediente ${expediente}` : "Seguimiento completo del caso"}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-xs">
              <CircleDot size={12} />
              {sorted.length} evento{sorted.length !== 1 ? "s" : ""}
            </span>
            {sorted.length > 1 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-xs">
                <Clock size={12} />
                {formatFecha(firstDate)} — {formatFecha(lastDate)}
              </span>
            )}
          </div>
        </div>
      )}

      <div className="relative">
        <div
          className="absolute left-[88px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-zeus-navy/30 via-zeus-navy/15 to-transparent hidden sm:block"
          aria-hidden
        />

        <div className="space-y-0">
          {sorted.map((evento, index) => {
            const config = ACCION_CONFIG[evento.accion] || DEFAULT_CONFIG;
            const isLast = index === sorted.length - 1;
            const isFirst = index === 0;

            return (
              <div
                key={evento.id}
                className={`relative flex gap-0 sm:gap-4 pb-6 last:pb-0 ${
                  isLast ? "timeline-event-last" : ""
                }`}
              >
                {/* Columna hora */}
                <div className="hidden sm:flex flex-col items-end w-[72px] flex-shrink-0 pt-1 pr-1">
                  <span className="text-sm font-bold text-zeus-navy tabular-nums">
                    {formatHora(evento.fechaHora)}
                  </span>
                  <span className="text-[10px] text-zeus-gray-text uppercase tracking-wide mt-0.5">
                    {formatFecha(evento.fechaHora)}
                  </span>
                </div>

                {/* Nodo */}
                <div className="relative flex flex-col items-center flex-shrink-0 z-10">
                  <div
                    className={`w-9 h-9 rounded-full ${config.nodeBg} text-white flex items-center justify-center ring-4 ${config.nodeRing} shadow-md ${
                      isLast ? "timeline-node-pulse" : ""
                    }`}
                  >
                    {config.icon}
                  </div>
                  {!isLast && (
                    <div className="w-0.5 flex-1 min-h-[24px] bg-gradient-to-b from-slate-200 to-slate-100 sm:hidden mt-1" />
                  )}
                </div>

                {/* Tarjeta */}
                <div
                  className={`flex-1 min-w-0 rounded-xl border border-zeus-border bg-white shadow-sm border-l-4 ${config.cardBorder} transition-shadow hover:shadow-md ${
                    isLast
                      ? "ring-2 ring-zeus-navy/10 shadow-md"
                      : ""
                  } ${isFirst ? "" : "mt-0"}`}
                >
                  <div className="p-4">
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${config.badgeBg} ${config.badgeText}`}
                      >
                        {config.label}
                      </span>
                      {isLast && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-zeus-navy text-white text-[10px] font-semibold uppercase tracking-wider">
                          <CircleDot size={10} />
                          Último evento
                        </span>
                      )}
                      <span className="sm:hidden text-[10px] text-zeus-gray-text">
                        {formatFecha(evento.fechaHora)} · {formatHora(evento.fechaHora)}
                      </span>
                    </div>

                    <p className="text-sm text-slate-700 leading-relaxed">
                      {evento.descripcion}
                    </p>

                    <MetadataChips metadata={evento.metadata} />

                    <div className="flex items-center gap-2.5 mt-4 pt-3 border-t border-slate-100">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-zeus-navy to-zeus-navy-light text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                        {getInitials(evento.usuarioNombre)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-slate-800 truncate">
                          {evento.usuarioNombre}
                        </p>
                        <p className="text-[11px] text-zeus-gray-text flex items-center gap-1">
                          <User size={10} />
                          {ROL_LABELS[evento.usuarioRol] ||
                            evento.usuarioRol.replace(/_/g, " ")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
