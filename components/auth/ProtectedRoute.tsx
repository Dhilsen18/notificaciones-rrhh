"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import type { RolUsuario } from "@/lib/types";

export function ProtectedRoute({
  children,
  roles,
}: {
  children: React.ReactNode;
  roles?: RolUsuario[];
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (roles && !roles.includes(user.rol)) {
      router.replace("/dashboard");
    }
  }, [user, loading, roles, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zeus-gray-bg">
        <div className="text-zeus-gray-text">Cargando...</div>
      </div>
    );
  }

  if (roles && !roles.includes(user.rol)) return null;

  return <>{children}</>;
}
