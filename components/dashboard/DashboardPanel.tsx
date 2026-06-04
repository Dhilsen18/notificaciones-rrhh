"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  TrendingUp,
} from "lucide-react";
import type { NotificacionEnriquecida } from "@/lib/types";
import {
  calcularKpis,
  contarPorArea,
  contarPorEstado,
} from "@/lib/dashboard-stats";

const KPI_COLORS: Record<string, string> = {
  navy: "from-zeus-navy to-zeus-navy-light",
  blue: "from-blue-600 to-blue-500",
  amber: "from-amber-500 to-amber-400",
  green: "from-emerald-600 to-emerald-500",
  red: "from-red-600 to-red-500",
  violet: "from-violet-600 to-violet-500",
};

const ESTADO_COLORS: Record<string, string> = {
  "EN PROCESO": "bg-blue-500",
  DERIVADO: "bg-amber-500",
  RESUELTO: "bg-emerald-500",
  PENDIENTE: "bg-violet-500",
  ARCHIVADO: "bg-slate-400",
  NOTIFICADO: "bg-sky-500",
  RECHAZADA: "bg-red-500",
};

export function DashboardPanel({
  items,
  bandejaHref,
}: {
  items: NotificacionEnriquecida[];
  bandejaHref: string;
}) {
  const kpis = calcularKpis(items);
  const porEstado = contarPorEstado(items);
  const porArea = contarPorArea(items);
  const maxEstado = Math.max(...porEstado.map((e) => e.count), 1);
  const vencidos = items.filter((n) => n.slaVencido).slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className={`rounded-xl bg-gradient-to-br ${KPI_COLORS[kpi.color]} p-4 text-white shadow-sm`}
          >
            <p className="text-[11px] text-white/80 uppercase tracking-wide">
              {kpi.label}
            </p>
            <p className="text-2xl font-bold mt-1 tabular-nums">
              {kpi.label === "Tiempo promedio" ? `${kpi.value}d` : kpi.value}
            </p>
            {kpi.sub && (
              <p className="text-[10px] text-white/70 mt-1 flex items-center gap-1">
                {kpi.trend === "up" && <TrendingUp size={10} />}
                {kpi.sub}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="zeus-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={18} className="text-zeus-navy" />
            <h3 className="font-semibold text-sm text-zeus-navy">
              Distribución por estado
            </h3>
          </div>
          <div className="space-y-3">
            {porEstado.map(({ estado, count }) => (
              <div key={estado}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-slate-700">{estado}</span>
                  <span className="text-zeus-gray-text">{count}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${ESTADO_COLORS[estado] || "bg-zeus-navy"}`}
                    style={{ width: `${(count / maxEstado) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="zeus-card p-5">
          <h3 className="font-semibold text-sm text-zeus-navy mb-4">
            Casos por área de emisión
          </h3>
          <div className="space-y-2">
            {porArea.map(({ area, count }) => (
              <div
                key={area}
                className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0"
              >
                <span className="text-sm text-slate-700">{area}</span>
                <span className="text-sm font-semibold text-zeus-navy">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {vencidos.length > 0 && (
        <div className="zeus-card p-5 border-l-4 border-l-red-500">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={18} className="text-red-600" />
            <h3 className="font-semibold text-sm text-red-800">
              SLA vencidos — atención urgente
            </h3>
          </div>
          <ul className="space-y-2">
            {vencidos.map((n) => (
              <li key={n.id}>
                <Link
                  href={`/notificaciones/${n.id}`}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-red-50 text-sm"
                >
                  <span>
                    <span className="font-medium text-zeus-navy">
                      {n.numeroExpediente}
                    </span>
                    <span className="text-zeus-gray-text ml-2">
                      {n.colaboradorNombre}
                    </span>
                  </span>
                  <ArrowRight size={14} className="text-red-400" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex justify-end">
        <Link
          href={bandejaHref}
          className="inline-flex items-center gap-2 text-sm font-medium text-zeus-navy hover:underline"
        >
          Ir a bandeja completa
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
