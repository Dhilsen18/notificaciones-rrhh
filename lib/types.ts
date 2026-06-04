export type AreaEmision =
  | "LOGISTICA"
  | "IMPORTACIONES"
  | "FACTURACION"
  | "GERENCIA"
  | "ADMINISTRACION"
  | "SISTEMAS"
  | "MARKETING";

export type AreaRecepcion = "RECURSOS HUMANOS" | "ADMINISTRACION" | "GERENCIA";

export type AreaDerivacion = "ADMINISTRACION" | "GERENCIA";

export type RolUsuario =
  | "colaborador"
  | "recursos_humanos"
  | "gerencia"
  | "administracion";

export type EstadoNotificacion =
  | "EN PROCESO"
  | "DERIVADO"
  | "RESUELTO"
  | "PENDIENTE"
  | "ARCHIVADO"
  | "NOTIFICADO"
  | "RECHAZADA";

export type OrigenNotificacion = "colaborador" | "rh";

export type Prioridad = "BAJA" | "MEDIA" | "ALTA" | "URGENTE";

export interface NotaInterna {
  id: string;
  fechaHora: string;
  autorNombre: string;
  texto: string;
}

export interface AlertaInApp {
  id: string;
  usuarioId: string;
  notificacionId?: string;
  titulo: string;
  mensaje: string;
  expediente?: string;
  fechaHora: string;
  leida: boolean;
  tipo: "info" | "warning" | "success" | "derivacion";
}

export interface ArchivoAdjunto {
  id: string;
  nombre: string;
  url: string;
  tamano: number;
  tipo: string;
}

export interface Resolucion {
  id: string;
  codigo: string;
  comentarios: string;
  archivos: ArchivoAdjunto[];
  fechaHora: string;
  autorId: string;
  autorNombre: string;
  autorRol: RolUsuario | "sistema";
  tipo: "rh" | "derivada";
  areaDerivada?: AreaDerivacion;
}

export interface EventoTimeline {
  id: string;
  fechaHora: string;
  accion: string;
  descripcion: string;
  usuarioId: string;
  usuarioNombre: string;
  usuarioRol: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface Notificacion {
  id: string;
  fechaHora: string;
  numeroExpediente: string;
  numeroIncidencia?: string;
  colaboradorId: string;
  colaboradorNombre: string;
  areaEmision: AreaEmision;
  tipoNotificacion: string;
  contenido: string;
  archivos: ArchivoAdjunto[];
  areaRecepcion: AreaRecepcion;
  estado: EstadoNotificacion;
  origen: OrigenNotificacion;
  resoluciones: Resolucion[];
  derivadoA?: AreaDerivacion;
  derivadoPorId?: string;
  derivadoPorNombre?: string;
  fechaDerivacion?: string;
  areaDestino?: AreaEmision;
  timeline: EventoTimeline[];
  prioridad?: Prioridad;
  fechaLimite?: string;
  asignadoAId?: string;
  asignadoANombre?: string;
  notasInternas?: NotaInterna[];
  leidoColaborador?: boolean;
}

export type NotificacionEnriquecida = Notificacion & {
  prioridad: Prioridad;
  fechaLimite: string;
  slaVencido: boolean;
  diasRestantes: number;
};

export interface Usuario {
  id: string;
  username: string;
  nombre: string;
  area: AreaEmision | "RECURSOS HUMANOS";
  rol: RolUsuario;
  activo: boolean;
  password: string;
}

export interface Contadores {
  expediente: number;
  resolucion: number;
}

export interface Database {
  usuarios: Usuario[];
  notificaciones: Notificacion[];
  contadores: Contadores;
  alertas?: AlertaInApp[];
}

export type TabBandeja =
  | "todos"
  | "activos"
  | "pendientes"
  | "derivados"
  | "resueltos"
  | "archivados"
  | "notificados";

export interface SessionUser {
  id: string;
  username: string;
  nombre: string;
  area: string;
  rol: RolUsuario;
}
