import type { Prioridad } from "@/lib/types";

const STYLES: Record<Prioridad, string> = {
  BAJA: "bg-slate-100 text-slate-600",
  MEDIA: "bg-blue-50 text-blue-700",
  ALTA: "bg-orange-50 text-orange-700",
  URGENTE: "bg-red-50 text-red-700 ring-1 ring-red-200",
};

export function PrioridadBadge({ prioridad }: { prioridad: Prioridad }) {
  return (
    <span
      className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-semibold ${STYLES[prioridad]}`}
    >
      {prioridad}
    </span>
  );
}
