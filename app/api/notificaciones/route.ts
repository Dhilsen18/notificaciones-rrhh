import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { requireSession, hasRole } from "@/lib/auth";
import {
  readDb,
  writeDb,
  formatExpediente,
  nowIso,
} from "@/lib/db";
import type {
  ArchivoAdjunto,
  AreaEmision,
  AreaRecepcion,
  EventoTimeline,
  Notificacion,
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

export async function GET(request: NextRequest) {
  let session;
  try {
    session = await requireSession();
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const db = await readDb();
  const vista = request.nextUrl.searchParams.get("vista");

  let notificaciones = db.notificaciones;

  if (vista === "mis-notificaciones" && session.rol === "colaborador") {
    notificaciones = notificaciones.filter(
      (n) =>
        n.colaboradorId === session.id ||
        (n.origen === "rh" && n.colaboradorId === session.id)
    );
  } else if (vista === "rh" && session.rol === "recursos_humanos") {
    notificaciones = notificaciones.filter((n) => n.origen === "colaborador");
  } else if (vista === "gerencia" && session.rol === "gerencia") {
    notificaciones = notificaciones.filter((n) => n.derivadoA === "GERENCIA");
  } else if (vista === "administracion" && session.rol === "administracion") {
    notificaciones = notificaciones.filter(
      (n) => n.derivadoA === "ADMINISTRACION"
    );
  } else if (vista === "panel") {
    if (session.rol === "colaborador") {
      notificaciones = notificaciones.filter(
        (n) =>
          n.colaboradorId === session.id ||
          (n.origen === "rh" && n.colaboradorId === session.id)
      );
    } else if (session.rol === "recursos_humanos") {
      notificaciones = notificaciones.filter((n) => n.origen === "colaborador");
    } else if (session.rol === "gerencia") {
      notificaciones = notificaciones.filter((n) => n.derivadoA === "GERENCIA");
    } else if (session.rol === "administracion") {
      notificaciones = notificaciones.filter(
        (n) => n.derivadoA === "ADMINISTRACION"
      );
    }
  } else if (vista === "detalle") {
    const id = request.nextUrl.searchParams.get("id");
    const notif = notificaciones.find((n) => n.id === id);
    if (!notif) {
      return NextResponse.json({ error: "No encontrada" }, { status: 404 });
    }
    return NextResponse.json({ notificacion: notif });
  } else {
    return NextResponse.json({ error: "Vista no permitida" }, { status: 403 });
  }

  notificaciones = [...notificaciones].sort(
    (a, b) => new Date(b.fechaHora).getTime() - new Date(a.fechaHora).getTime()
  );

  return NextResponse.json({ notificaciones });
}

export async function POST(request: NextRequest) {
  let session;
  try {
    session = await requireSession();
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await request.json();
  const origen = body.origen as "colaborador" | "rh";

  if (origen === "colaborador" && session.rol !== "colaborador") {
    return NextResponse.json({ error: "No permitido" }, { status: 403 });
  }

  if (origen === "rh" && !hasRole(session, ["recursos_humanos"])) {
    return NextResponse.json({ error: "No permitido" }, { status: 403 });
  }

  const result = await writeDb((db) => {
    db.contadores.expediente += 1;
    const numeroExpediente = formatExpediente(db.contadores.expediente);
    const fechaHora = nowIso();

    let notificacion: Notificacion;

    if (origen === "colaborador") {
      notificacion = {
        id: uuidv4(),
        fechaHora,
        numeroExpediente,
        numeroIncidencia: body.numeroIncidencia || undefined,
        colaboradorId: session.id,
        colaboradorNombre: session.nombre,
        areaEmision: body.areaEmision as AreaEmision,
        tipoNotificacion: body.tipoNotificacion,
        contenido: body.contenido,
        archivos: (body.archivos || []) as ArchivoAdjunto[],
        areaRecepcion: body.areaRecepcion as AreaRecepcion,
        estado: "EN PROCESO",
        origen: "colaborador",
        resoluciones: [],
        timeline: [
          createTimelineEvent(
            "REGISTRO",
            `Notificación registrada y enviada a Recursos Humanos (área recepción solicitada: ${body.areaRecepcion})`,
            session.id,
            session.nombre,
            session.rol,
            { expediente: numeroExpediente }
          ),
        ],
      };
    } else {
      const colaborador = db.usuarios.find((u) => u.id === body.colaboradorId);
      if (!colaborador) {
        throw new Error("COLABORADOR_NOT_FOUND");
      }

      notificacion = {
        id: uuidv4(),
        fechaHora,
        numeroExpediente,
        numeroIncidencia: body.numeroIncidencia || undefined,
        colaboradorId: colaborador.id,
        colaboradorNombre: colaborador.nombre,
        areaEmision: colaborador.area as AreaEmision,
        areaDestino: body.areaDestino as AreaEmision,
        tipoNotificacion: body.tipoNotificacion,
        contenido: body.contenido,
        archivos: (body.archivos || []) as ArchivoAdjunto[],
        areaRecepcion: "RECURSOS HUMANOS",
        estado: "NOTIFICADO",
        origen: "rh",
        resoluciones: [],
        timeline: [
          createTimelineEvent(
            "NOTIFICACION_RH",
            `Recursos Humanos envió notificación a ${colaborador.nombre}`,
            session.id,
            session.nombre,
            session.rol,
            { expediente: numeroExpediente, colaborador: colaborador.nombre }
          ),
        ],
      };
    }

    db.notificaciones.push(notificacion);
    return db;
  });

  const created = result.notificaciones[result.notificaciones.length - 1];
  return NextResponse.json({ notificacion: created }, { status: 201 });
}
