import type { AreaEmision, AreaRecepcion } from "./types";

export const AREAS_EMISION: AreaEmision[] = [
  "LOGISTICA",
  "IMPORTACIONES",
  "FACTURACION",
  "GERENCIA",
  "ADMINISTRACION",
  "SISTEMAS",
  "MARKETING",
];

export const AREAS_RECEPCION: AreaRecepcion[] = [
  "RECURSOS HUMANOS",
  "ADMINISTRACION",
  "GERENCIA",
];

export const AREAS_DERIVACION = ["ADMINISTRACION", "GERENCIA"] as const;

export const TIPOS_NOTIFICACION_COLABORADOR = [
  "Solicitud de Descargo",
  "Incidencia",
  "Informe",
  "OTROS",
] as const;

export const TIPOS_NOTIFICACION_RH = [
  "Solicitud de Descargo",
  "Emisión de Resolución",
  "Otros",
] as const;

export const ESTADOS_RH = [
  "EN PROCESO",
  "DERIVADO",
  "RESUELTO",
  "PENDIENTE",
  "ARCHIVADO",
] as const;

export const ESTADOS_DERIVADA = [
  "DERIVADO",
  "RESUELTO",
  "ARCHIVADO",
  "RECHAZADA",
  "EN PROCESO",
] as const;

export const ZEUS_COLORS = {
  navy: "#1e3a5f",
  navyDark: "#152a45",
  navyLight: "#2a5082",
  yellow: "#f5b800",
  grayBg: "#f0f4f8",
  grayText: "#64748b",
  white: "#ffffff",
  border: "#e2e8f0",
  success: "#16a34a",
  warning: "#d97706",
  info: "#2563eb",
};

export const SESSION_COOKIE = "zeus_session";
