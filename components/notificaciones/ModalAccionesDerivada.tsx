"use client";

import { useState } from "react";
import { Modal, ModalSection, InfoGrid } from "@/components/ui/Modal";
import { ArchivosList, FileInput } from "@/components/notificaciones/ArchivosList";
import { Timeline } from "@/components/notificaciones/Timeline";
import { EstadoBadge } from "@/components/ui/EstadoBadge";
import { formatFechaHora, uploadFiles } from "@/lib/utils";
import { ESTADOS_DERIVADA } from "@/lib/constants";
import type { Notificacion } from "@/lib/types";
import { Send } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

interface Props {
  notificacion: Notificacion | null;
  open: boolean;
  onClose: () => void;
  onUpdated: () => void;
  areaLabel: string;
}

export function ModalAccionesDerivada({
  notificacion,
  open,
  onClose,
  onUpdated,
  areaLabel,
}: Props) {
  const [comentarios, setComentarios] = useState("");
  const [estado, setEstado] = useState("DERIVADO");
  const [archivos, setArchivos] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const reset = () => {
    setComentarios("");
    setEstado("DERIVADO");
    setArchivos([]);
    setError("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!notificacion) return null;

  const resolucionRH = notificacion.resoluciones.find((r) => r.tipo === "rh");

  const handleSubmit = async () => {
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
          accion: "resolucion_derivada",
          comentarios,
          estado,
          archivos: uploaded,
        }),
      });
      if (!res.ok) throw new Error("Error");
      onUpdated();
      handleClose();
    } catch {
      setError("Error al guardar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={`Gestión ${areaLabel} — ${notificacion.numeroExpediente}`}
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
            { label: "Área", value: notificacion.areaEmision },
            { label: "Colaborador", value: notificacion.colaboradorNombre },
            {
              label: "Responsable",
              value: notificacion.derivadoPorNombre || "—",
            },
            {
              label: "Fecha Derivación",
              value: notificacion.fechaDerivacion
                ? formatFechaHora(notificacion.fechaDerivacion)
                : "—",
            },
            {
              label: "N° Resolución RH",
              value: resolucionRH?.codigo || "—",
            },
          ]}
        />
      </ModalSection>

      <ModalSection title="Detalles del Pedido Original">
        <div className="bg-slate-50 rounded-lg p-3 text-sm whitespace-pre-wrap mb-3">
          {notificacion.contenido}
        </div>
        <ArchivosList archivos={notificacion.archivos} />
      </ModalSection>

      <ModalSection title="Acciones">
        {error && (
          <div className="mb-3 p-2 bg-red-50 text-red-700 text-sm rounded-lg">
            {error}
          </div>
        )}
        <div className="space-y-4">
          <div>
            <label className="zeus-label">Comentarios *</label>
            <textarea
              className="zeus-input min-h-24"
              value={comentarios}
              onChange={(e) => setComentarios(e.target.value)}
            />
          </div>
          <FileInput
            id="derivada-archivos"
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
            >
              {ESTADOS_DERIVADA.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            disabled={loading}
            className="zeus-btn-primary flex items-center gap-2"
          >
            <Send size={16} />
            Enviar respuesta
          </button>
        </div>
      </ModalSection>

      <div className="pt-2">
        <Timeline
          eventos={notificacion.timeline}
          expediente={notificacion.numeroExpediente}
        />
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Confirmar respuesta"
        message={`¿Registrar respuesta con estado ${estado}? El colaborador podrá ver esta resolución.`}
        confirmLabel="Sí, enviar"
        variant={estado === "RECHAZADA" ? "danger" : "default"}
        onConfirm={() => {
          setConfirmOpen(false);
          handleSubmit();
        }}
        onCancel={() => setConfirmOpen(false)}
      />
    </Modal>
  );
}

export function ModalResolucionRH({
  notificacion,
  open,
  onClose,
}: {
  notificacion: Notificacion | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!notificacion) return null;
  const resolucionRH = notificacion.resoluciones.find((r) => r.tipo === "rh");

  return (
    <Modal open={open} onClose={onClose} title="Resolución de Recursos Humanos">
      {!resolucionRH ? (
        <p className="text-sm text-zeus-gray-text">Sin resolución RH</p>
      ) : (
        <div className="space-y-4">
          <ModalSection title="Contenido">
            <p className="text-sm whitespace-pre-wrap">
              {resolucionRH.comentarios}
            </p>
          </ModalSection>
          <ModalSection title="Archivos">
            <ArchivosList archivos={resolucionRH.archivos} />
          </ModalSection>
          <ModalSection title="Fecha y Hora">
            <p className="text-sm">{formatFechaHora(resolucionRH.fechaHora)}</p>
            {notificacion.fechaDerivacion && (
              <p className="text-xs text-zeus-gray-text mt-1">
                Derivada: {formatFechaHora(notificacion.fechaDerivacion)}
              </p>
            )}
          </ModalSection>
        </div>
      )}
    </Modal>
  );
}
