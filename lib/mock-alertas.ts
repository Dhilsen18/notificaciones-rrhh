import type { AlertaInApp } from "./types";

export const ALERTAS_MOCK: AlertaInApp[] = [
  {
    id: "a1",
    usuarioId: "rh1",
    notificacionId: "n001",
    titulo: "Nuevo expediente RH-001",
    mensaje: "Juan Pérez registró una Solicitud de Descargo",
    expediente: "RH-001",
    fechaHora: "2026-06-03T09:15:00.000Z",
    leida: false,
    tipo: "info",
  },
  {
    id: "a2",
    usuarioId: "rh1",
    titulo: "SLA vencido RH-005",
    mensaje: "Diego Soto — incidencia crítica sin respuesta de Administración",
    expediente: "RH-005",
    notificacionId: "n005",
    fechaHora: "2026-06-03T08:00:00.000Z",
    leida: false,
    tipo: "warning",
  },
  {
    id: "a3",
    usuarioId: "rh1",
    notificacionId: "n003",
    titulo: "Derivación pendiente",
    mensaje: "RH-003 derivado a Gerencia — sin respuesta desde hace 1 día",
    expediente: "RH-003",
    fechaHora: "2026-06-02T17:00:00.000Z",
    leida: true,
    tipo: "derivacion",
  },
  {
    id: "a4",
    usuarioId: "ger1",
    titulo: "Caso derivado RH-003",
    mensaje: "Carlos López — Informe de facturación requiere su gestión",
    expediente: "RH-003",
    notificacionId: "n003",
    fechaHora: "2026-06-02T16:45:00.000Z",
    leida: false,
    tipo: "derivacion",
  },
  {
    id: "a5",
    usuarioId: "ger1",
    notificacionId: "n013",
    titulo: "Caso derivado RH-013",
    mensaje: "Ana Rojas — revisión de política de viáticos",
    expediente: "RH-013",
    fechaHora: "2026-05-30T14:30:00.000Z",
    leida: false,
    tipo: "derivacion",
  },
  {
    id: "a6",
    usuarioId: "adm1",
    titulo: "Caso derivado RH-005",
    mensaje: "Diego Soto — incidencia servidor de reportes",
    expediente: "RH-005",
    notificacionId: "n005",
    fechaHora: "2026-06-02T12:00:00.000Z",
    leida: false,
    tipo: "derivacion",
  },
  {
    id: "a7",
    usuarioId: "u1",
    notificacionId: "n007",
    titulo: "Resolución disponible",
    mensaje: "Su expediente RH-007 fue resuelto por Gerencia",
    expediente: "RH-007",
    fechaHora: "2026-05-29T10:00:00.000Z",
    leida: false,
    tipo: "success",
  },
  {
    id: "a8",
    usuarioId: "u1",
    titulo: "Notificación de RH",
    mensaje: "Emisión de Resolución — permiso del 15/05 aprobado",
    expediente: "RH-006",
    notificacionId: "n006",
    fechaHora: "2026-06-03T07:00:00.000Z",
    leida: false,
    tipo: "info",
  },
  {
    id: "a9",
    usuarioId: "u2",
    notificacionId: "n011",
    titulo: "Documentación pendiente",
    mensaje: "RH le recuerda presentar constancia de capacitación",
    expediente: "RH-011",
    fechaHora: "2026-06-02T15:00:00.000Z",
    leida: false,
    tipo: "warning",
  },
  {
    id: "a10",
    usuarioId: "u5",
    titulo: "Caso rechazado",
    mensaje: "Administración rechazó RH-010 — ver resolución",
    expediente: "RH-010",
    notificacionId: "n010",
    fechaHora: "2026-05-26T11:00:00.000Z",
    leida: true,
    tipo: "warning",
  },
];

export function alertasPorUsuario(usuarioId: string): AlertaInApp[] {
  return ALERTAS_MOCK.filter((a) => a.usuarioId === usuarioId).sort(
    (a, b) => new Date(b.fechaHora).getTime() - new Date(a.fechaHora).getTime()
  );
}

export function contarNoLeidas(usuarioId: string): number {
  return alertasPorUsuario(usuarioId).filter((a) => !a.leida).length;
}
