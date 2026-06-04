"use client";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { BandejaNotificaciones } from "@/components/notificaciones/BandejaNotificaciones";
import { ModalResolucionRH } from "@/components/notificaciones/ModalAccionesDerivada";
import { useState } from "react";
import type { Notificacion } from "@/lib/types";

interface Props {
  vista: "gerencia" | "administracion";
  title: string;
  areaLabel: string;
}

export function VistaDerivadasPage({ vista, title, areaLabel }: Props) {
  const [resolucionModal, setResolucionModal] = useState<Notificacion | null>(null);

  return (
    <DashboardShell title={title}>
      <BandejaNotificaciones
        variant="derivada"
        title={title}
        vistaOverride={vista}
        areaLabel={areaLabel}
      />
      <ModalResolucionRH
        notificacion={resolucionModal}
        open={!!resolucionModal}
        onClose={() => setResolucionModal(null)}
      />
    </DashboardShell>
  );
}
