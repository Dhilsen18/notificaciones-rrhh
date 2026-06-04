import { cookies } from "next/headers";
import { SESSION_COOKIE } from "./constants";
import { readDb } from "./db";
import type { SessionUser, Usuario } from "./types";

export function toSessionUser(user: Usuario): SessionUser {
  return {
    id: user.id,
    username: user.username,
    nombre: user.nombre,
    area: user.area,
    rol: user.rol,
  };
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const sessionValue = cookieStore.get(SESSION_COOKIE)?.value;
  if (!sessionValue) return null;

  try {
    const session = JSON.parse(sessionValue) as SessionUser;
    const db = await readDb();
    const user = db.usuarios.find((u) => u.id === session.id && u.activo);
    if (!user) return null;
    return toSessionUser(user);
  } catch {
    return null;
  }
}

export async function requireSession(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}

export function hasRole(
  session: SessionUser,
  roles: SessionUser["rol"][]
): boolean {
  return roles.includes(session.rol);
}
