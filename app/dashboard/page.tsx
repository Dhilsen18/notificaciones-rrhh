"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";

const ROLE_ROUTES: Record<string, string> = {
  colaborador: "/panel",
  recursos_humanos: "/panel",
  gerencia: "/panel",
  administracion: "/panel",
};

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    router.replace(ROLE_ROUTES[user.rol] || "/mis-notificaciones");
  }, [user, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-zeus-gray-bg">
      <div className="text-zeus-gray-text">Redirigiendo...</div>
    </div>
  );
}
