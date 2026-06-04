import type {
  EstadoNotificacion,
  NotificacionEnriquecida,
  Prioridad,
  TabBandeja,
} from "./types";

export interface FiltrosBandeja {
  busqueda: string;
  tab: TabBandeja;
  estado?: EstadoNotificacion | "";
  prioridad?: Prioridad | "";
  area?: string;
  soloVencidos?: boolean;
  soloAsignadosAMi?: boolean;
  usuarioId?: string;
}

const ACTIVOS: EstadoNotificacion[] = ["EN PROCESO", "DERIVADO", "PENDIENTE"];
const RESUELTOS: EstadoNotificacion[] = ["RESUELTO", "RECHAZADA"];

export function filtrarNotificaciones(
  items: NotificacionEnriquecida[],
  f: FiltrosBandeja
): NotificacionEnriquecida[] {
  let result = [...items];

  if (f.tab === "activos") {
    result = result.filter((n) => ACTIVOS.includes(n.estado));
  } else if (f.tab === "pendientes") {
    result = result.filter((n) => n.estado === "PENDIENTE");
  } else if (f.tab === "derivados") {
    result = result.filter((n) => n.estado === "DERIVADO");
  } else if (f.tab === "resueltos") {
    result = result.filter((n) => RESUELTOS.includes(n.estado));
  } else if (f.tab === "archivados") {
    result = result.filter((n) => n.estado === "ARCHIVADO");
  } else if (f.tab === "notificados") {
    result = result.filter((n) => n.estado === "NOTIFICADO");
  }

  if (f.estado) {
    result = result.filter((n) => n.estado === f.estado);
  }
  if (f.prioridad) {
    result = result.filter((n) => n.prioridad === f.prioridad);
  }
  if (f.area) {
    result = result.filter(
      (n) => n.areaEmision === f.area || n.derivadoA === f.area
    );
  }
  if (f.soloVencidos) {
    result = result.filter((n) => n.slaVencido);
  }
  if (f.soloAsignadosAMi && f.usuarioId) {
    result = result.filter((n) => n.asignadoAId === f.usuarioId);
  }

  const q = f.busqueda.trim().toLowerCase();
  if (q) {
    result = result.filter(
      (n) =>
        n.numeroExpediente.toLowerCase().includes(q) ||
        (n.numeroIncidencia?.toLowerCase().includes(q) ?? false) ||
        n.colaboradorNombre.toLowerCase().includes(q) ||
        n.tipoNotificacion.toLowerCase().includes(q) ||
        n.contenido.toLowerCase().includes(q) ||
        n.areaEmision.toLowerCase().includes(q)
    );
  }

  return result.sort(
    (a, b) => new Date(b.fechaHora).getTime() - new Date(a.fechaHora).getTime()
  );
}

export function contarPorTab(
  items: NotificacionEnriquecida[],
  tab: TabBandeja
): number {
  return filtrarNotificaciones(items, { busqueda: "", tab }).length;
}
