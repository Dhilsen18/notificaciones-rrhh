"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, Check } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  alertasPorUsuario,
  contarNoLeidas,
} from "@/lib/mock-alertas";
import { formatFechaHora } from "@/lib/utils";

export function NotificationBell() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [alertas, setAlertas] = useState(
    user ? alertasPorUsuario(user.id) : []
  );

  if (!user) return null;

  const noLeidas = alertas.filter((a) => !a.leida).length;

  const marcarLeidas = () => {
    setAlertas((prev) => prev.map((a) => ({ ...a, leida: true })));
  };

  const tipoColor = {
    info: "bg-blue-100 text-blue-600",
    warning: "bg-amber-100 text-amber-600",
    success: "bg-emerald-100 text-emerald-600",
    derivacion: "bg-violet-100 text-violet-600",
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-600"
        aria-label="Notificaciones"
      >
        <Bell size={20} />
        {noLeidas > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1">
            {noLeidas > 9 ? "9+" : noLeidas}
          </span>
        )}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-zeus-border z-50 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-zeus-border bg-slate-50">
              <span className="font-semibold text-sm text-zeus-navy">
                Alertas
              </span>
              {noLeidas > 0 && (
                <button
                  type="button"
                  onClick={marcarLeidas}
                  className="text-xs text-zeus-navy hover:underline flex items-center gap-1"
                >
                  <Check size={12} />
                  Marcar leídas
                </button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {alertas.length === 0 ? (
                <p className="p-6 text-center text-sm text-zeus-gray-text">
                  Sin alertas
                </p>
              ) : (
                alertas.map((a) => (
                  <div
                    key={a.id}
                    className={`px-4 py-3 border-b border-slate-100 last:border-0 ${
                      !a.leida ? "bg-blue-50/40" : ""
                    }`}
                  >
                    <div className="flex gap-2">
                      <span
                        className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                          !a.leida ? "bg-zeus-navy" : "bg-transparent"
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-800">
                          {a.titulo}
                        </p>
                        <p className="text-xs text-zeus-gray-text mt-0.5 line-clamp-2">
                          {a.mensaje}
                        </p>
                        <div className="flex items-center justify-between mt-1.5">
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded ${tipoColor[a.tipo]}`}
                          >
                            {a.tipo}
                          </span>
                          <span className="text-[10px] text-zeus-gray-text">
                            {formatFechaHora(a.fechaHora)}
                          </span>
                        </div>
                        {a.notificacionId && (
                          <Link
                            href={`/notificaciones/${a.notificacionId}`}
                            onClick={() => setOpen(false)}
                            className="text-xs text-zeus-navy font-medium mt-1 inline-block hover:underline"
                          >
                            Ver {a.expediente || "detalle"} →
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
