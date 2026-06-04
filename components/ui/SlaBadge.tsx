import { AlertTriangle, Clock } from "lucide-react";

export function SlaBadge({
  diasRestantes,
  vencido,
}: {
  diasRestantes: number;
  vencido: boolean;
}) {
  if (vencido) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-50 text-red-700 text-[11px] font-semibold">
        <AlertTriangle size={12} />
        SLA vencido
      </span>
    );
  }
  if (diasRestantes <= 1) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[11px] font-semibold">
        <Clock size={12} />
        {diasRestantes <= 0 ? "Hoy" : `${diasRestantes}d`}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-50 text-slate-600 text-[11px]">
      <Clock size={12} />
      {diasRestantes}d rest.
    </span>
  );
}
