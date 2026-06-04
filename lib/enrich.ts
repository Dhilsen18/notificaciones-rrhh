import type { Notificacion, NotificacionEnriquecida, Prioridad } from "./types";

const PRIORIDAD_POR_TIPO: Record<string, Prioridad> = {
  Incidencia: "ALTA",
  "Solicitud de Descargo": "MEDIA",
  Informe: "BAJA",
  "Emisión de Resolución": "MEDIA",
};

function hashPrioridad(id: string): Prioridad {
  const n = id.charCodeAt(id.length - 1) % 4;
  return (["BAJA", "MEDIA", "ALTA", "URGENTE"] as Prioridad[])[n];
}

function addDays(iso: string, days: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

function diasHasta(fechaLimite: string): number {
  const diff = new Date(fechaLimite).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function enrichNotificacion(n: Notificacion): NotificacionEnriquecida {
  const prioridad =
    n.prioridad ??
    PRIORIDAD_POR_TIPO[n.tipoNotificacion] ??
    (n.estado === "DERIVADO" ? "ALTA" : hashPrioridad(n.id));

  const diasSLA =
    prioridad === "URGENTE" ? 1 : prioridad === "ALTA" ? 2 : prioridad === "MEDIA" ? 5 : 10;

  const fechaLimite = n.fechaLimite ?? addDays(n.fechaHora, diasSLA);
  const diasRestantes = diasHasta(fechaLimite);
  const slaVencido =
    diasRestantes < 0 &&
    !["RESUELTO", "ARCHIVADO", "NOTIFICADO", "RECHAZADA"].includes(n.estado);

  const asignadoANombre =
    n.asignadoANombre ??
    (n.origen === "colaborador" ? "Laura Mendoza" : undefined);

  return {
    ...n,
    prioridad,
    fechaLimite,
    slaVencido,
    diasRestantes,
    asignadoANombre,
    asignadoAId: n.asignadoAId ?? "rh1",
    notasInternas: n.notasInternas ?? defaultNotas(n),
    leidoColaborador: n.leidoColaborador ?? n.estado !== "NOTIFICADO",
  };
}

function defaultNotas(n: Notificacion) {
  if (n.origen !== "colaborador" || n.estado === "EN PROCESO") {
    return n.notasInternas ?? [];
  }
  if (n.estado === "DERIVADO" || n.resoluciones.length > 0) {
    return [
      {
        id: `ni-${n.id}`,
        fechaHora: n.resoluciones[0]?.fechaHora ?? n.fechaHora,
        autorNombre: "Laura Mendoza",
        texto: "Revisión inicial completada. Documentación validada parcialmente.",
      },
    ];
  }
  return [];
}

export function enrichList(list: Notificacion[]): NotificacionEnriquecida[] {
  return list.map(enrichNotificacion);
}
