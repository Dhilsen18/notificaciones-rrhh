import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { requireSession } from "@/lib/auth";
import { readDb } from "@/lib/db";
import type { AreaEmision } from "@/lib/types";

export async function GET(request: NextRequest) {
  try {
    await requireSession();
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const area = request.nextUrl.searchParams.get("area") as AreaEmision | null;
  if (!area) {
    return NextResponse.json({ error: "Área requerida" }, { status: 400 });
  }

  const db = await readDb();
  const colaboradores = db.usuarios
    .filter((u) => u.rol === "colaborador" && u.activo && u.area === area)
    .map((u) => ({ id: u.id, nombre: u.nombre, area: u.area }));

  return NextResponse.json({ colaboradores });
}
