import { ClipboardList } from "lucide-react";
import Link from "next/link";

export function EmptyState({
  title = "Sin registros",
  description = "No hay notificaciones que coincidan con los filtros seleccionados.",
  actionLabel,
  actionHref,
}: {
  title?: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
        <ClipboardList size={32} className="text-zeus-gray-text" />
      </div>
      <h4 className="font-semibold text-zeus-navy">{title}</h4>
      <p className="text-sm text-zeus-gray-text mt-1 max-w-sm">{description}</p>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="mt-4 zeus-btn-primary text-sm inline-flex"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
