"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  ClipboardList,
  FilePlus,
  LayoutDashboard,
  LogOut,
  Menu,
  Users,
  Building2,
  Shield,
  BarChart3,
} from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { CommandPalette } from "@/components/layout/CommandPalette";
import { enrichList } from "@/lib/enrich";
import type { Notificacion, NotificacionEnriquecida } from "@/lib/types";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles: string[];
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Panel de Control",
    href: "/panel",
    icon: <BarChart3 size={18} />,
    roles: ["colaborador", "recursos_humanos", "gerencia", "administracion"],
  },
  {
    label: "Registrar Notificación",
    href: "/registrar",
    icon: <FilePlus size={18} />,
    roles: ["colaborador"],
  },
  {
    label: "Mis Notificaciones",
    href: "/mis-notificaciones",
    icon: <ClipboardList size={18} />,
    roles: ["colaborador"],
  },
  {
    label: "Bandeja RH",
    href: "/recursos-humanos",
    icon: <Users size={18} />,
    roles: ["recursos_humanos"],
  },
  {
    label: "Derivadas Gerencia",
    href: "/gerencia",
    icon: <Building2 size={18} />,
    roles: ["gerencia"],
  },
  {
    label: "Derivadas Administración",
    href: "/administracion",
    icon: <Shield size={18} />,
    roles: ["administracion"],
  },
];

const ROL_LABELS: Record<string, string> = {
  colaborador: "Colaborador",
  recursos_humanos: "Recursos Humanos",
  gerencia: "Gerencia",
  administracion: "Administración",
};

export function DashboardShell({
  children,
  title,
  compactBanner,
}: {
  children: React.ReactNode;
  title: string;
  compactBanner?: boolean;
}) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [searchItems, setSearchItems] = useState<NotificacionEnriquecida[]>([]);

  useEffect(() => {
    if (!user) return;
    fetch("/api/notificaciones?vista=panel")
      .then((r) => r.json())
      .then((d) => setSearchItems(enrichList((d.notificaciones || []) as Notificacion[])));
  }, [user]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const navItems = NAV_ITEMS.filter(
    (item) => user && item.roles.includes(user.rol)
  );

  const today = new Intl.DateTimeFormat("es-PE", { dateStyle: "full" }).format(
    new Date()
  );

  return (
    <div className="flex min-h-screen bg-zeus-gray-bg">
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-0 overflow-hidden"
        } flex-shrink-0 bg-white border-r border-zeus-border flex flex-col transition-all duration-300`}
      >
        <div className="p-5 border-b border-zeus-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-zeus-navy rounded-lg flex items-center justify-center">
              <Bell size={16} className="text-zeus-yellow" />
            </div>
            <div>
              <div className="font-bold text-sm leading-tight">
                <span className="text-zeus-navy">ZEUS</span>{" "}
                <span className="text-zeus-yellow">●</span>
              </div>
              <div className="text-[10px] text-zeus-gray-text tracking-widest uppercase">
                Notificaciones RRHH
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 pt-4 pb-2">
          <p className="text-[10px] font-semibold text-zeus-gray-text tracking-widest uppercase">
            Módulos
          </p>
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  active
                    ? "bg-zeus-navy text-white"
                    : "text-slate-600 hover:bg-slate-50 hover:text-zeus-navy"
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-zeus-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-zeus-navy flex items-center justify-center text-white text-sm font-semibold">
              {user?.nombre.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{user?.nombre}</p>
              <p className="text-xs text-zeus-gray-text">
                {user ? ROL_LABELS[user.rol] : ""}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 zeus-btn-primary text-sm py-2"
          >
            <LogOut size={16} />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-zeus-border px-6 py-3 flex items-center gap-4">
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2 text-zeus-navy flex-1 min-w-0">
            <LayoutDashboard size={18} className="flex-shrink-0" />
            <h1 className="font-semibold text-sm truncate">{title}</h1>
          </div>
          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zeus-border text-xs text-zeus-gray-text hover:border-zeus-navy/30"
          >
            Buscar...
            <kbd className="px-1 py-0.5 rounded bg-slate-100 text-[10px]">Ctrl+K</kbd>
          </button>
          <NotificationBell />
        </header>

        <main className="flex-1 p-6 overflow-auto">
          {!compactBanner && (
            <div className="bg-zeus-navy rounded-xl p-6 mb-6 text-white">
              <h2 className="text-xl font-bold mb-1">
                ¡Bienvenido, {user?.nombre}!
              </h2>
              <p className="text-blue-100 text-sm mb-4">
                Gestiona las notificaciones del sistema ZEUS desde este panel.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full bg-white/15 text-xs">
                  Panel de Control
                </span>
                <span className="px-3 py-1 rounded-full bg-white/15 text-xs">
                  {user ? ROL_LABELS[user.rol] : ""}
                </span>
                <span className="px-3 py-1 rounded-full bg-white/15 text-xs capitalize">
                  {today}
                </span>
              </div>
            </div>
          )}
          {children}
        </main>
      </div>

      <CommandPalette
        items={searchItems}
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
      />
    </div>
  );
}
