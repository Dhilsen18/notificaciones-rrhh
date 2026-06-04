"use client";

import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardPanel } from "@/components/dashboard/DashboardPanel";
import { KpiSkeleton } from "@/components/ui/Skeleton";
import { enrichList } from "@/lib/enrich";
import type { Notificacion } from "@/lib/types";
import { useAuth } from "@/components/providers/AuthProvider";

const BANDEJA: Record<string, string> = {
  colaborador: "/mis-notificaciones",
  recursos_humanos: "/recursos-humanos",
  gerencia: "/gerencia",
  administracion: "/administracion",
};

export default function PanelPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<ReturnType<typeof enrichList>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/notificaciones?vista=panel")
      .then((r) => r.json())
      .then((d) => {
        setItems(enrichList((d.notificaciones || []) as Notificacion[]));
        setLoading(false);
      });
  }, []);

  return (
    <ProtectedRoute
      roles={["colaborador", "recursos_humanos", "gerencia", "administracion"]}
    >
      <DashboardShell title="Panel de Control" compactBanner>
        {loading ? (
          <KpiSkeleton />
        ) : (
          <DashboardPanel
            items={items}
            bandejaHref={user ? BANDEJA[user.rol] : "/dashboard"}
          />
        )}
      </DashboardShell>
    </ProtectedRoute>
  );
}
