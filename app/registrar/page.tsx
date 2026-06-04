"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { FileInput } from "@/components/notificaciones/ArchivosList";
import {
  AREAS_EMISION,
  AREAS_RECEPCION,
  TIPOS_NOTIFICACION_COLABORADOR,
} from "@/lib/constants";
import { uploadFiles, formatFechaHora } from "@/lib/utils";
import { PLANTILLAS_CONTENIDO } from "@/lib/plantillas";

export default function RegistrarPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tipoOtros, setTipoOtros] = useState("");
  const [tipo, setTipo] = useState("");
  const [areaEmision, setAreaEmision] = useState("");
  const [areaRecepcion, setAreaRecepcion] = useState("");
  const [numeroIncidencia, setNumeroIncidencia] = useState("");
  const [contenido, setContenido] = useState("");
  const [archivos, setArchivos] = useState<File[]>([]);

  useEffect(() => {
    if (user?.area && user.area !== "RECURSOS HUMANOS") {
      setAreaEmision(user.area);
    }
  }, [user]);

  const now = new Date();

  const aplicarPlantilla = (tipoSel: string) => {
    const plantilla = PLANTILLAS_CONTENIDO[tipoSel];
    if (plantilla && !contenido.trim()) {
      setContenido(plantilla);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!tipo || !areaEmision || !areaRecepcion || !contenido.trim()) {
      setError("Complete todos los campos obligatorios");
      return;
    }

    if (tipo === "OTROS" && !tipoOtros.trim()) {
      setError("Especifique el tipo de notificación");
      return;
    }

    setLoading(true);
    try {
      const uploaded = await uploadFiles(archivos);
      const res = await fetch("/api/notificaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origen: "colaborador",
          areaEmision,
          tipoNotificacion: tipo === "OTROS" ? tipoOtros : tipo,
          contenido,
          areaRecepcion,
          numeroIncidencia: numeroIncidencia || undefined,
          archivos: uploaded,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al registrar");
      }

      router.push("/mis-notificaciones");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al registrar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute roles={["colaborador"]}>
      <DashboardShell title="Registrar Notificación">
      <div className="zeus-card p-6 max-w-3xl">
        <h3 className="text-sm font-semibold text-zeus-navy uppercase tracking-wider mb-6">
          Formulario de Registro
        </h3>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="zeus-label">Fecha y Hora</label>
              <input
                className="zeus-input bg-slate-50"
                readOnly
                value={formatFechaHora(now.toISOString())}
              />
            </div>
            <div>
              <label className="zeus-label">Nombre</label>
              <input
                className="zeus-input bg-slate-50"
                readOnly
                value={user?.nombre || ""}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="zeus-label">N° Incidencia (opcional)</label>
              <input
                className="zeus-input"
                placeholder="INC-2026-001"
                value={numeroIncidencia}
                onChange={(e) => setNumeroIncidencia(e.target.value)}
              />
            </div>
            <div>
              <label className="zeus-label">N° Expediente</label>
              <input
                className="zeus-input bg-slate-50"
                readOnly
                value="Se generará automáticamente (RH-XXX)"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="zeus-label">Área Emisión *</label>
              <select
                className="zeus-input"
                value={areaEmision}
                onChange={(e) => setAreaEmision(e.target.value)}
                required
              >
                <option value="">Seleccionar...</option>
                {AREAS_EMISION.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="zeus-label">Área Recepción *</label>
              <select
                className="zeus-input"
                value={areaRecepcion}
                onChange={(e) => setAreaRecepcion(e.target.value)}
                required
              >
                <option value="">Seleccionar...</option>
                {AREAS_RECEPCION.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
              {areaRecepcion &&
                (areaRecepcion === "GERENCIA" ||
                  areaRecepcion === "ADMINISTRACION") && (
                  <p className="text-xs text-amber-600 mt-1">
                    Esta solicitud pasará primero por Recursos Humanos para su
                    evaluación y derivación.
                  </p>
                )}
            </div>
          </div>

          <div>
            <label className="zeus-label">Tipo de Notificación *</label>
            <select
              className="zeus-input"
              value={tipo}
              onChange={(e) => {
                setTipo(e.target.value);
                aplicarPlantilla(e.target.value);
              }}
              required
            >
              <option value="">Seleccionar...</option>
              {TIPOS_NOTIFICACION_COLABORADOR.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            {tipo === "OTROS" && (
              <input
                className="zeus-input mt-2"
                placeholder="Especifique el tipo..."
                value={tipoOtros}
                onChange={(e) => setTipoOtros(e.target.value)}
              />
            )}
          </div>

          <div>
            <label className="zeus-label">Contenido *</label>
            <textarea
              className="zeus-input min-h-32 resize-y"
              placeholder="Describa su solicitud, incidencia o informe..."
              value={contenido}
              onChange={(e) => setContenido(e.target.value)}
              required
            />
          </div>

          <FileInput
            id="archivos-colab"
            maxFiles={10}
            files={archivos}
            onChange={setArchivos}
            label="Archivos (máx. 10)"
          />

          <button
            type="submit"
            disabled={loading}
            className="zeus-btn-primary flex items-center gap-2"
          >
            <Save size={16} />
            {loading ? "Guardando..." : "Guardar y Enviar"}
          </button>
        </form>
      </div>
    </DashboardShell>
    </ProtectedRoute>
  );
}
