import type { EstadoNotificacion } from "@/lib/types";

const ESTADO_CLASSES: Record<string, string> = {
  "EN PROCESO": "badge-en-proceso",
  DERIVADO: "badge-derivado",
  RESUELTO: "badge-resuelto",
  PENDIENTE: "badge-pendiente",
  ARCHIVADO: "badge-archivado",
  NOTIFICADO: "badge-notificado",
  RECHAZADA: "badge-rechazada",
};

export function EstadoBadge({ estado }: { estado: EstadoNotificacion | string }) {
  const cls = ESTADO_CLASSES[estado] || "badge-en-proceso";
  return (
    <span className={`badge-estado ${cls}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current inline-block" />
      {estado}
    </span>
  );
}
