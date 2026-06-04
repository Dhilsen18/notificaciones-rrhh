"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { BandejaNotificaciones } from "@/components/notificaciones/BandejaNotificaciones";
import { FormularioNotificarRH } from "@/components/notificaciones/FormularioNotificarRH";

export default function RecursosHumanosPage() {
  const [showNotificar, setShowNotificar] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <ProtectedRoute roles={["recursos_humanos"]}>
      <DashboardShell title="Bandeja Recursos Humanos">
        <div className="flex justify-end mb-4">
          <button
            type="button"
            onClick={() => setShowNotificar(true)}
            className="zeus-btn-primary flex items-center gap-2 text-sm"
          >
            <Bell size={16} />
            Notificar colaborador
          </button>
        </div>
        <BandejaNotificaciones
          key={refreshKey}
          variant="rh"
          title="Bandeja Recursos Humanos"
        />
        <FormularioNotificarRH
          open={showNotificar}
          onClose={() => setShowNotificar(false)}
          onSent={() => setRefreshKey((k) => k + 1)}
        />
      </DashboardShell>
    </ProtectedRoute>
  );
}
