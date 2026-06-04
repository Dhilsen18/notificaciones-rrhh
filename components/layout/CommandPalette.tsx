"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Search } from "lucide-react";
import type { NotificacionEnriquecida } from "@/lib/types";

export function CommandPalette({
  items,
  open,
  onClose,
}: {
  items: NotificacionEnriquecida[];
  open: boolean;
  onClose: () => void;
}) {
  const [q, setQ] = useState("");
  const router = useRouter();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (open) onClose();
        else {
          /* parent toggles */
        }
      }
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  const ql = q.toLowerCase();
  const results = items
    .filter(
      (n) =>
        !ql ||
        n.numeroExpediente.toLowerCase().includes(ql) ||
        n.colaboradorNombre.toLowerCase().includes(ql) ||
        n.contenido.toLowerCase().includes(ql)
    )
    .slice(0, 8);

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center pt-[15vh] p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-zeus-border overflow-hidden">
        <div className="flex items-center gap-3 px-4 border-b border-zeus-border">
          <Search size={18} className="text-zeus-gray-text" />
          <input
            autoFocus
            className="flex-1 py-3 outline-none text-sm"
            placeholder="Buscar expediente, colaborador, contenido... (Esc para cerrar)"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <kbd className="hidden sm:inline text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
            Ctrl+K
          </kbd>
        </div>
        <ul className="max-h-64 overflow-y-auto py-2">
          {results.length === 0 ? (
            <li className="px-4 py-6 text-center text-sm text-zeus-gray-text">
              Sin resultados
            </li>
          ) : (
            results.map((n) => (
              <li key={n.id}>
                <button
                  type="button"
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 text-left"
                  onClick={() => {
                    router.push(`/notificaciones/${n.id}`);
                    onClose();
                  }}
                >
                  <FileText size={16} className="text-zeus-navy flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-zeus-navy">
                      {n.numeroExpediente}
                    </p>
                    <p className="text-xs text-zeus-gray-text truncate">
                      {n.colaboradorNombre} · {n.estado}
                    </p>
                  </div>
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
