"use client";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { BandejaNotificaciones } from "@/components/notificaciones/BandejaNotificaciones";

export default function MisNotificacionesPage() {
  return (
    <ProtectedRoute roles={["colaborador"]}>
      <DashboardShell title="Mis Notificaciones">
        <BandejaNotificaciones variant="colaborador" title="Mis Notificaciones" />
      </DashboardShell>
    </ProtectedRoute>
  );
}
