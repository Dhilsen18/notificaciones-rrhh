"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { enrichList } from "@/lib/enrich";
import {
  filtrarNotificaciones,
  contarPorTab,
  type FiltrosBandeja,
} from "@/lib/filters";
import type { Notificacion, TabBandeja } from "@/lib/types";

export function useBandeja(vista: string, usuarioId?: string) {
  const [raw, setRaw] = useState<Notificacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  const [tab, setTab] = useState<TabBandeja>("todos");
  const [busqueda, setBusqueda] = useState("");
  const [estado, setEstado] = useState("");
  const [prioridad, setPrioridad] = useState("");
  const [area, setArea] = useState("");
  const [soloVencidos, setSoloVencidos] = useState(false);

  const enriched = useMemo(() => enrichList(raw), [raw]);

  const filtros: FiltrosBandeja = useMemo(
    () => ({
      busqueda,
      tab,
      estado: estado as FiltrosBandeja["estado"],
      prioridad: prioridad as FiltrosBandeja["prioridad"],
      area,
      soloVencidos,
      usuarioId,
    }),
    [busqueda, tab, estado, prioridad, area, soloVencidos, usuarioId]
  );

  const filtradas = useMemo(
    () => filtrarNotificaciones(enriched, filtros),
    [enriched, filtros]
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/notificaciones?vista=${vista}`);
      const data = await res.json();
      setRaw(data.notificaciones || []);
    } finally {
      setLoading(false);
    }
  }, [vista]);

  useEffect(() => {
    load();
  }, [load]);

  const tabCounts = useMemo(() => {
    const tabs: TabBandeja[] = [
      "todos",
      "activos",
      "pendientes",
      "derivados",
      "resueltos",
      "archivados",
      "notificados",
    ];
    return Object.fromEntries(
      tabs.map((t) => [t, contarPorTab(enriched, t)])
    ) as Record<TabBandeja, number>;
  }, [enriched]);

  return {
    raw,
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
  };
}
