import type { NotificacionEnriquecida } from "./types";

export interface DashboardKpi {
  label: string;
  value: number;
  sub?: string;
  trend?: "up" | "down" | "neutral";
  color: "navy" | "blue" | "amber" | "green" | "red" | "violet";
}

export interface EstadoCount {
  estado: string;
  count: number;
}

export function calcularKpis(items: NotificacionEnriquecida[]): DashboardKpi[] {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const hoyCount = items.filter((n) => new Date(n.fechaHora) >= hoy).length;
  const activos = items.filter((n) =>
    ["EN PROCESO", "DERIVADO", "PENDIENTE"].includes(n.estado)
  ).length;
  const vencidos = items.filter((n) => n.slaVencido).length;
  const derivados = items.filter((n) => n.estado === "DERIVADO").length;
  const resueltos = items.filter((n) =>
    ["RESUELTO", "ARCHIVADO"].includes(n.estado)
  ).length;

  const resueltosConTiempo = items.filter(
    (n) => n.estado === "RESUELTO" && n.resoluciones.length > 0
  );
  let promedioDias = 0;
  if (resueltosConTiempo.length) {
    const total = resueltosConTiempo.reduce((acc, n) => {
      const fin = new Date(n.resoluciones[n.resoluciones.length - 1].fechaHora);
      const ini = new Date(n.fechaHora);
      return acc + (fin.getTime() - ini.getTime()) / (1000 * 60 * 60 * 24);
    }, 0);
    promedioDias = Math.round((total / resueltosConTiempo.length) * 10) / 10;
  }

  return [
    { label: "Registradas hoy", value: hoyCount, color: "blue", sub: "Últimas 24h" },
    { label: "Casos activos", value: activos, color: "navy", sub: "En gestión" },
    { label: "SLA vencidos", value: vencidos, color: "red", sub: "Requieren atención", trend: vencidos > 0 ? "up" : "neutral" },
    { label: "Derivados", value: derivados, color: "amber", sub: "En otras áreas" },
    { label: "Resueltos", value: resueltos, color: "green", sub: "Cerrados" },
    { label: "Tiempo promedio", value: promedioDias, color: "violet", sub: "Días hasta resolución" },
  ];
}

export function contarPorEstado(items: NotificacionEnriquecida[]): EstadoCount[] {
  const map = new Map<string, number>();
  for (const n of items) {
    map.set(n.estado, (map.get(n.estado) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .map(([estado, count]) => ({ estado, count }))
    .sort((a, b) => b.count - a.count);
}

export function contarPorArea(items: NotificacionEnriquecida[]) {
  const map = new Map<string, number>();
  for (const n of items) {
    map.set(n.areaEmision, (map.get(n.areaEmision) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .map(([area, count]) => ({ area, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
}
