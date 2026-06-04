"use client";

import { VistaDerivadasPage } from "@/components/notificaciones/VistaDerivadasPage";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function GerenciaPage() {
  return (
    <ProtectedRoute roles={["gerencia"]}>
      <VistaDerivadasPage
        vista="gerencia"
        title="Derivadas Gerencia"
        areaLabel="Gerencia"
      />
    </ProtectedRoute>
  );
}
