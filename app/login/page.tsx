"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, LogIn } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";

const DEMO_USERS = [
  { username: "jperez", rol: "Colaborador — Logística" },
  { username: "hradmin", rol: "Recursos Humanos" },
  { username: "gerente", rol: "Gerencia" },
  { username: "administrador", rol: "Administración" },
];

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("123456");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await login(username, password);
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-zeus-gray-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-zeus-navy rounded-xl flex items-center justify-center">
              <Bell size={24} className="text-zeus-yellow" />
            </div>
            <div className="text-left">
              <div className="font-bold text-xl text-zeus-navy">
                ZEUS <span className="text-zeus-yellow">●</span>
              </div>
              <div className="text-xs text-zeus-gray-text tracking-widest uppercase">
                Sistema de Notificaciones RRHH
              </div>
            </div>
          </div>
        </div>

        <div className="zeus-card p-8">
          <h1 className="text-lg font-semibold text-zeus-navy mb-1">
            Iniciar Sesión
          </h1>
          <p className="text-sm text-zeus-gray-text mb-6">
            Acceda al sistema de notificaciones
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="zeus-label">Usuario</label>
              <input
                className="zeus-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="usuario"
                required
              />
            </div>
            <div>
              <label className="zeus-label">Contraseña</label>
              <input
                type="password"
                className="zeus-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full zeus-btn-primary flex items-center justify-center gap-2"
            >
              <LogIn size={16} />
              {loading ? "Ingresando..." : "Ingresar"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-zeus-border">
            <p className="text-xs font-semibold text-zeus-gray-text uppercase tracking-wider mb-3">
              Usuarios de prueba (contraseña: 123456)
            </p>
            <div className="space-y-2">
              {DEMO_USERS.map((u) => (
                <button
                  key={u.username}
                  type="button"
                  onClick={() => setUsername(u.username)}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-slate-50 border border-zeus-border transition-colors"
                >
                  <span className="font-medium text-zeus-navy">
                    {u.username}
                  </span>
                  <span className="text-zeus-gray-text ml-2">— {u.rol}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
