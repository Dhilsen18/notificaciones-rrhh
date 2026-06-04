"use client";

import { VistaDerivadasPage } from "@/components/notificaciones/VistaDerivadasPage";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function AdministracionPage() {
  return (
    <ProtectedRoute roles={["administracion"]}>
      <VistaDerivadasPage
        vista="administracion"
        title="Derivadas Administración"
        areaLabel="Administración"
      />
    </ProtectedRoute>
  );
}
