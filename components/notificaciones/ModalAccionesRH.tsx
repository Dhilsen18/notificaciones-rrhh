"use client";

import { useState } from "react";
import { Modal, ModalSection, InfoGrid } from "@/components/ui/Modal";
import { ArchivosList, FileInput } from "@/components/notificaciones/ArchivosList";
import { Timeline } from "@/components/notificaciones/Timeline";
import { EstadoBadge } from "@/components/ui/EstadoBadge";
import { formatFechaHora, uploadFiles } from "@/lib/utils";
import { AREAS_DERIVACION, ESTADOS_RH } from "@/lib/constants";
import type { Notificacion } from "@/lib/types";
import { Send } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { enrichNotificacion } from "@/lib/enrich";

interface Props {
  notificacion: Notificacion | null;
  open: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

export function ModalAccionesRH({
  notificacion,
  open,
  onClose,
  onUpdated,
}: Props) {
  const [comentarios, setComentarios] = useState("");
  const [estado, setEstado] = useState("EN PROCESO");
  const [archivos, setArchivos] = useState<File[]>([]);
  const [areaDerivada, setAreaDerivada] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showDerivar, setShowDerivar] = useState(false);
  const [saved, setSaved] = useState(false);
  const [confirmEnviar, setConfirmEnviar] = useState(false);
  const [confirmDerivar, setConfirmDerivar] = useState(false);

  const resetForm = () => {
    setComentarios("");
    setEstado("EN PROCESO");
    setArchivos([]);
    setAreaDerivada("");
    setShowDerivar(false);
    setSaved(false);
    setError("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!notificacion) return null;

  const enriched = enrichNotificacion(notificacion);

  const handleEnviarResolucion = async () => {
    if (!comentarios.trim()) {
      setError("Ingrese comentarios");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const uploaded = await uploadFiles(archivos);
      const res = await fetch(`/api/notificaciones/${notificacion.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accion: "resolucion_rh",
          comentarios,
          estado,
          archivos: uploaded,
        }),
      });
      if (!res.ok) throw new Error("Error al guardar");
      setSaved(true);
      if (estado === "DERIVADO") {
        setShowDerivar(true);
      } else {
        onUpdated();
        handleClose();
      }
    } catch {
      setError("Error al guardar la resolución");
    } finally {
      setLoading(false);
    }
  };

  const handleDerivar = async () => {
    if (!areaDerivada) {
      setError("Seleccione el área de derivación");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/notificaciones/${notificacion.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accion: "derivar",
          areaDerivada,
        }),
      });
      if (!res.ok) throw new Error("Error al derivar");
      onUpdated();
      handleClose();
    } catch {
      setError("Error al derivar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={`Gestión — ${notificacion.numeroExpediente}`}
      size="xl"
    >
      <ModalSection title="Información de la Notificación">
        <InfoGrid
          items={[
            { label: "ID", value: notificacion.id.slice(0, 8) + "..." },
            { label: "N° Expediente", value: notificacion.numeroExpediente },
            {
              label: "N° Incidencia",
              value: notificacion.numeroIncidencia || "—",
            },
            { label: "Tipo", value: notificacion.tipoNotificacion },
            { label: "Área", value: notificacion.areaEmision },
            { label: "Colaborador", value: notificacion.colaboradorNombre },
            { label: "Área Recepción", value: notificacion.areaRecepcion },
            { label: "Fecha", value: formatFechaHora(notificacion.fechaHora) },
            {
              label: "Estado",
              value: <EstadoBadge estado={notificacion.estado} />,
            },
          ]}
        />
      </ModalSection>

      {enriched.notasInternas && enriched.notasInternas.length > 0 && (
        <ModalSection title="Notas internas (solo RRHH)">
          <div className="space-y-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
            {enriched.notasInternas.map((nota) => (
              <div key={nota.id} className="text-sm">
                <p className="text-slate-700">{nota.texto}</p>
                <p className="text-xs text-amber-700 mt-0.5">
                  {nota.autorNombre} · {formatFechaHora(nota.fechaHora)}
                </p>
              </div>
            ))}
          </div>
        </ModalSection>
      )}

      <ModalSection title="Detalles">
        <div className="mb-4">
          <p className="text-xs text-zeus-gray-text mb-1">Contenido</p>
          <div className="bg-slate-50 rounded-lg p-3 text-sm whitespace-pre-wrap">
            {notificacion.contenido}
          </div>
        </div>
        <div>
          <p className="text-xs text-zeus-gray-text mb-2">Archivos</p>
          <ArchivosList archivos={notificacion.archivos} />
        </div>
      </ModalSection>

      <ModalSection title="Acciones">
        {error && (
          <div className="mb-3 p-2 bg-red-50 text-red-700 text-sm rounded-lg">
            {error}
          </div>
        )}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="zeus-label">Fecha Descargo</label>
              <input
                className="zeus-input bg-slate-50"
                readOnly
                value={formatFechaHora(new Date().toISOString())}
              />
            </div>
            <div>
              <label className="zeus-label">Código Resolución</label>
              <input
                className="zeus-input bg-slate-50"
                readOnly
                value="Se generará automáticamente (RES-XXX)"
              />
            </div>
          </div>
          <div>
            <label className="zeus-label">Comentarios *</label>
            <textarea
              className="zeus-input min-h-24"
              value={comentarios}
              onChange={(e) => setComentarios(e.target.value)}
              disabled={saved && showDerivar}
            />
          </div>
          <FileInput
            id="rh-archivos"
            maxFiles={5}
            files={archivos}
            onChange={setArchivos}
            label="Archivos (máx. 5)"
          />
          <div>
            <label className="zeus-label">Estado</label>
            <select
              className="zeus-input"
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              disabled={saved && showDerivar}
            >
              {ESTADOS_RH.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
          </div>
          {!saved && (
            <button
              type="button"
              onClick={() => setConfirmEnviar(true)}
              disabled={loading}
              className="zeus-btn-primary flex items-center gap-2"
            >
              <Send size={16} />
              Enviar resolución
            </button>
          )}
        </div>
      </ModalSection>

      {showDerivar && (
        <ModalSection title="Derivados">
          <div className="space-y-4">
            <div>
              <label className="zeus-label">Área de Derivación *</label>
              <select
                className="zeus-input"
                value={areaDerivada}
                onChange={(e) => setAreaDerivada(e.target.value)}
              >
                <option value="">Seleccionar...</option>
                {AREAS_DERIVACION.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={() => setConfirmDerivar(true)}
              disabled={loading}
              className="zeus-btn-primary flex items-center gap-2"
            >
              <Send size={16} />
              Enviar derivación
            </button>
          </div>
        </ModalSection>
      )}

      <div className="pt-2">
        <Timeline
          eventos={notificacion.timeline}
          expediente={notificacion.numeroExpediente}
        />
      </div>

      <ConfirmDialog
        open={confirmEnviar}
        title="Confirmar resolución"
        message={`¿Registrar resolución con estado ${estado}? Esta acción quedará en el historial de auditoría.`}
        confirmLabel="Sí, enviar"
        variant={estado === "RECHAZADA" ? "danger" : "default"}
        onConfirm={() => {
          setConfirmEnviar(false);
          handleEnviarResolucion();
        }}
        onCancel={() => setConfirmEnviar(false)}
      />
      <ConfirmDialog
        open={confirmDerivar}
        title="Confirmar derivación"
        message={`¿Derivar este caso a ${areaDerivada}? El área seleccionada podrá gestionarlo.`}
        confirmLabel="Sí, derivar"
        variant="warning"
        onConfirm={() => {
          setConfirmDerivar(false);
          handleDerivar();
        }}
        onCancel={() => setConfirmDerivar(false)}
      />
    </Modal>
  );
}
