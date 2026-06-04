"use client";

import { useState, useEffect } from "react";
import { Modal, ModalSection } from "@/components/ui/Modal";
import { FileInput } from "@/components/notificaciones/ArchivosList";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  AREAS_EMISION,
  TIPOS_NOTIFICACION_RH,
} from "@/lib/constants";
import { formatFechaHora, uploadFiles } from "@/lib/utils";
import { Bell, Send } from "lucide-react";

interface Colaborador {
  id: string;
  nombre: string;
  area: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSent: () => void;
}

export function FormularioNotificarRH({ open, onClose, onSent }: Props) {
  const { user } = useAuth();
  const [areaDestino, setAreaDestino] = useState("");
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [colaboradorId, setColaboradorId] = useState("");
  const [tipo, setTipo] = useState("");
  const [tipoOtros, setTipoOtros] = useState("");
  const [numeroIncidencia, setNumeroIncidencia] = useState("");
  const [contenido, setContenido] = useState("");
  const [archivos, setArchivos] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (areaDestino) {
      fetch(`/api/colaboradores?area=${areaDestino}`)
        .then((r) => r.json())
        .then((d) => {
          setColaboradores(d.colaboradores || []);
          setColaboradorId("");
        });
    } else {
      setColaboradores([]);
    }
  }, [areaDestino]);

  const reset = () => {
    setAreaDestino("");
    setColaboradorId("");
    setTipo("");
    setTipoOtros("");
    setNumeroIncidencia("");
    setContenido("");
    setArchivos([]);
    setError("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!areaDestino || !colaboradorId || !tipo || !contenido.trim()) {
      setError("Complete todos los campos obligatorios");
      return;
    }
    if (tipo === "Otros" && !tipoOtros.trim()) {
      setError("Especifique el tipo de notificación");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const uploaded = await uploadFiles(archivos);
      const res = await fetch("/api/notificaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origen: "rh",
          areaDestino,
          colaboradorId,
          tipoNotificacion: tipo === "Otros" ? tipoOtros : tipo,
          contenido,
          numeroIncidencia: numeroIncidencia || undefined,
          archivos: uploaded,
        }),
      });
      if (!res.ok) throw new Error("Error al enviar");
      onSent();
      handleClose();
    } catch {
      setError("Error al enviar la notificación");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose} title="Notificar Colaborador" size="lg">
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg">
            {error}
          </div>
        )}

        <ModalSection title="Información General">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="zeus-label">Fecha y Hora</label>
              <input
                className="zeus-input bg-slate-50"
                readOnly
                value={formatFechaHora(new Date().toISOString())}
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
            <div>
              <label className="zeus-label">N° Incidencia</label>
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
                value="Se generará automáticamente"
              />
            </div>
          </div>
        </ModalSection>

        <ModalSection title="Área y Colaboradores">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="zeus-label">Área Destino *</label>
              <select
                className="zeus-input"
                value={areaDestino}
                onChange={(e) => setAreaDestino(e.target.value)}
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
              <label className="zeus-label">Colaborador *</label>
              <select
                className="zeus-input"
                value={colaboradorId}
                onChange={(e) => setColaboradorId(e.target.value)}
                required
                disabled={!areaDestino}
              >
                <option value="">
                  {areaDestino
                    ? "Seleccionar colaborador..."
                    : "Seleccione área primero"}
                </option>
                {colaboradores.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </ModalSection>

        <ModalSection title="Tipo y Contenido">
          <div className="space-y-4">
            <div>
              <label className="zeus-label">Tipo de Notificación *</label>
              <select
                className="zeus-input"
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                required
              >
                <option value="">Seleccionar...</option>
                {TIPOS_NOTIFICACION_RH.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              {tipo === "Otros" && (
                <input
                  className="zeus-input mt-2"
                  placeholder="Especifique..."
                  value={tipoOtros}
                  onChange={(e) => setTipoOtros(e.target.value)}
                />
              )}
            </div>
            <div>
              <label className="zeus-label">Contenido *</label>
              <textarea
                className="zeus-input min-h-24"
                value={contenido}
                onChange={(e) => setContenido(e.target.value)}
                required
              />
            </div>
            <FileInput
              id="rh-notificar-archivos"
              maxFiles={5}
              files={archivos}
              onChange={setArchivos}
              label="Archivos (máx. 5)"
            />
          </div>
        </ModalSection>

        <button
          type="submit"
          disabled={loading}
          className="zeus-btn-primary flex items-center gap-2"
        >
          <Bell size={16} />
          {loading ? "Enviando..." : "Notificar"}
        </button>
      </form>
    </Modal>
  );
}
