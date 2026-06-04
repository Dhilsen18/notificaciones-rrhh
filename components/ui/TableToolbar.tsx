"use client";

import { useState } from "react";
import {
  FileSpreadsheet,
  FileText,
  Filter,
  Search,
  X,
} from "lucide-react";
import type { TabBandeja } from "@/lib/types";
import { AREAS_EMISION } from "@/lib/constants";
import { ESTADOS_RH } from "@/lib/constants";

export interface TabItem {
  id: TabBandeja;
  label: string;
  count?: number;
}

interface Props {
  title: string;
  tabs: TabItem[];
  activeTab: TabBandeja;
  onTabChange: (tab: TabBandeja) => void;
  busqueda: string;
  onBusquedaChange: (v: string) => void;
  totalFiltrado: number;
  totalGeneral: number;
  onExportExcel: () => void;
  onExportPdf: () => void;
  exportLoading?: boolean;
  showPrioridadFilter?: boolean;
  showEstadoFilter?: boolean;
  showAreaFilter?: boolean;
  showSlaFilter?: boolean;
  prioridad?: string;
  onPrioridadChange?: (v: string) => void;
  estado?: string;
  onEstadoChange?: (v: string) => void;
  area?: string;
  onAreaChange?: (v: string) => void;
  soloVencidos?: boolean;
  onSoloVencidosChange?: (v: boolean) => void;
  extraActions?: React.ReactNode;
}

export function TableToolbar({
  title,
  tabs,
  activeTab,
  onTabChange,
  busqueda,
  onBusquedaChange,
  totalFiltrado,
  totalGeneral,
  onExportExcel,
  onExportPdf,
  exportLoading,
  showPrioridadFilter,
  showEstadoFilter,
  showAreaFilter,
  showSlaFilter,
  prioridad = "",
  onPrioridadChange,
  estado = "",
  onEstadoChange,
  area = "",
  onAreaChange,
  soloVencidos,
  onSoloVencidosChange,
  extraActions,
}: Props) {
  const [filtersOpen, setFiltersOpen] = useState(false);

  return (
    <div className="border-b border-zeus-border bg-slate-50/50">
      <div className="px-4 py-3 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-zeus-navy uppercase tracking-wider">
            {title}
          </h3>
          <p className="text-xs text-zeus-gray-text mt-0.5">
            Mostrando {totalFiltrado} de {totalGeneral} registros
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {extraActions}
          <button
            type="button"
            onClick={onExportExcel}
            disabled={exportLoading || totalFiltrado === 0}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 disabled:opacity-50"
          >
            <FileSpreadsheet size={14} />
            Excel
          </button>
          <button
            type="button"
            onClick={onExportPdf}
            disabled={exportLoading || totalFiltrado === 0}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-red-200 bg-red-50 text-red-800 hover:bg-red-100 disabled:opacity-50"
          >
            <FileText size={14} />
            PDF
          </button>
        </div>
      </div>

      <div className="px-4 pb-2 flex flex-wrap gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-zeus-navy text-white"
                : "bg-white border border-zeus-border text-slate-600 hover:border-zeus-navy/30"
            }`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] ${
                  activeTab === tab.id ? "bg-white/20" : "bg-slate-100"
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="px-4 pb-3 flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zeus-gray-text"
          />
          <input
            className="zeus-input pl-9 pr-8"
            placeholder="Buscar expediente, incidencia, colaborador, contenido..."
            value={busqueda}
            onChange={(e) => onBusquedaChange(e.target.value)}
          />
          {busqueda && (
            <button
              type="button"
              onClick={() => onBusquedaChange("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
            >
              <X size={14} />
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={() => setFiltersOpen(!filtersOpen)}
          className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm ${
            filtersOpen ? "border-zeus-navy bg-zeus-navy/5" : "border-zeus-border bg-white"
          }`}
        >
          <Filter size={16} />
          Filtros
        </button>
      </div>

      {filtersOpen && (
        <div className="px-4 pb-4 flex flex-wrap gap-3">
          {showPrioridadFilter && onPrioridadChange && (
            <select
              className="zeus-input w-auto min-w-[120px]"
              value={prioridad}
              onChange={(e) => onPrioridadChange(e.target.value)}
            >
              <option value="">Todas las prioridades</option>
              {["BAJA", "MEDIA", "ALTA", "URGENTE"].map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          )}
          {showEstadoFilter && onEstadoChange && (
            <select
              className="zeus-input w-auto min-w-[140px]"
              value={estado}
              onChange={(e) => onEstadoChange(e.target.value)}
            >
              <option value="">Todos los estados</option>
              {ESTADOS_RH.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
              <option value="NOTIFICADO">NOTIFICADO</option>
              <option value="RECHAZADA">RECHAZADA</option>
            </select>
          )}
          {showAreaFilter && onAreaChange && (
            <select
              className="zeus-input w-auto min-w-[160px]"
              value={area}
              onChange={(e) => onAreaChange(e.target.value)}
            >
              <option value="">Todas las áreas</option>
              {AREAS_EMISION.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          )}
          {showSlaFilter && onSoloVencidosChange && (
            <label className="inline-flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={soloVencidos}
                onChange={(e) => onSoloVencidosChange(e.target.checked)}
                className="rounded border-zeus-border"
              />
              Solo SLA vencidos
            </label>
          )}
        </div>
      )}
    </div>
  );
}
