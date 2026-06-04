import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { requireSession, hasRole } from "@/lib/auth";
import { readDb, writeDb, formatResolucion, nowIso } from "@/lib/db";
import type {
  ArchivoAdjunto,
  AreaDerivacion,
  EstadoNotificacion,
  EventoTimeline,
  Resolucion,
} from "@/lib/types";

function createTimelineEvent(
  accion: string,
  descripcion: string,
  userId: string,
  userName: string,
  userRol: string,
  metadata?: Record<string, string | number | boolean>
): EventoTimeline {
  return {
    id: uuidv4(),
    fechaHora: nowIso(),
    accion,
    descripcion,
    usuarioId: userId,
    usuarioNombre: userName,
    usuarioRol: userRol,
    metadata,
  };
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireSession();
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const db = await readDb();
  const notificacion = db.notificaciones.find((n) => n.id === id);

  if (!notificacion) {
    return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  }

  return NextResponse.json({ notificacion });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let session;
  try {
    session = await requireSession();
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const accion = body.accion as "resolucion_rh" | "derivar" | "resolucion_derivada";

  try {
    const result = await writeDb((db) => {
      const index = db.notificaciones.findIndex((n) => n.id === id);
      if (index === -1) throw new Error("NOT_FOUND");

      const notif = db.notificaciones[index];

      if (accion === "resolucion_rh") {
        if (!hasRole(session, ["recursos_humanos"])) {
          throw new Error("FORBIDDEN");
        }

        db.contadores.resolucion += 1;
        const codigo = formatResolucion(db.contadores.resolucion);
        const resolucion: Resolucion = {
          id: uuidv4(),
          codigo,
          comentarios: body.comentarios,
          archivos: (body.archivos || []) as ArchivoAdjunto[],
          fechaHora: nowIso(),
          autorId: session.id,
          autorNombre: session.nombre,
          autorRol: session.rol,
          tipo: "rh",
        };

        notif.resoluciones.push(resolucion);
        notif.estado = body.estado as EstadoNotificacion;

        notif.timeline.push(
          createTimelineEvent(
            "RESOLUCION_RH",
            `Recursos Humanos registró resolución ${codigo} con estado ${body.estado}`,
            session.id,
            session.nombre,
            session.rol,
            { codigo, estado: body.estado }
          )
        );
      } else if (accion === "derivar") {
        if (!hasRole(session, ["recursos_humanos"])) {
          throw new Error("FORBIDDEN");
        }

        const areaDerivada = body.areaDerivada as AreaDerivacion;
        notif.estado = "DERIVADO";
        notif.derivadoA = areaDerivada;
        notif.derivadoPorId = session.id;
        notif.derivadoPorNombre = session.nombre;
        notif.fechaDerivacion = nowIso();

        notif.timeline.push(
          createTimelineEvent(
            "DERIVACION",
            `Notificación derivada a ${areaDerivada}`,
            session.id,
            session.nombre,
            session.rol,
            { area: areaDerivada }
          )
        );
      } else if (accion === "resolucion_derivada") {
        if (
          !hasRole(session, ["gerencia", "administracion"]) ||
          notif.derivadoA !==
            (session.rol === "gerencia" ? "GERENCIA" : "ADMINISTRACION")
        ) {
          throw new Error("FORBIDDEN");
        }

        db.contadores.resolucion += 1;
        const codigo = formatResolucion(db.contadores.resolucion);
        const resolucion: Resolucion = {
          id: uuidv4(),
          codigo,
          comentarios: body.comentarios,
          archivos: (body.archivos || []) as ArchivoAdjunto[],
          fechaHora: nowIso(),
          autorId: session.id,
          autorNombre: session.nombre,
          autorRol: session.rol,
          tipo: "derivada",
          areaDerivada: notif.derivadoA,
        };

        notif.resoluciones.push(resolucion);
        notif.estado = body.estado as EstadoNotificacion;

        notif.timeline.push(
          createTimelineEvent(
            "RESOLUCION_DERIVADA",
            `${notif.derivadoA} registró respuesta ${codigo} con estado ${body.estado}`,
            session.id,
            session.nombre,
            session.rol,
            { codigo, estado: body.estado }
          )
        );
      }

      db.notificaciones[index] = notif;
      return db;
    });

    const updated = result.notificaciones.find((n) => n.id === id);
    return NextResponse.json({ notificacion: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error";
    if (message === "NOT_FOUND") {
      return NextResponse.json({ error: "No encontrada" }, { status: 404 });
    }
    if (message === "FORBIDDEN") {
      return NextResponse.json({ error: "No permitido" }, { status: 403 });
    }
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 });
  }
}
