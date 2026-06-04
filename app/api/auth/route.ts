import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { readDb } from "@/lib/db";
import { SESSION_COOKIE } from "@/lib/constants";
import { toSessionUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    username: string;
    password: string;
  };

  const db = await readDb();
  const user = db.usuarios.find(
    (u) =>
      u.username === body.username &&
      u.password === body.password &&
      u.activo
  );

  if (!user) {
    return NextResponse.json(
      { error: "Credenciales inválidas" },
      { status: 401 }
    );
  }

  const session = toSessionUser(user);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, JSON.stringify(session), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return NextResponse.json({ user: session });
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  return NextResponse.json({ ok: true });
}

export async function GET() {
  const cookieStore = await cookies();
  const sessionValue = cookieStore.get(SESSION_COOKIE)?.value;
  if (!sessionValue) {
    return NextResponse.json({ user: null });
  }

  try {
    const session = JSON.parse(sessionValue);
    const db = await readDb();
    const user = db.usuarios.find((u) => u.id === session.id && u.activo);
    if (!user) {
      return NextResponse.json({ user: null });
    }
    return NextResponse.json({ user: toSessionUser(user) });
  } catch {
    return NextResponse.json({ user: null });
  }
}
