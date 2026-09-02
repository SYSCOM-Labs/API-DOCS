import crypto from "crypto";
import { cookies } from "next/headers";
import { config } from "@/lib/config";

export type Role = "viewer" | "operator";

export interface Session {
  username: string;
  role: Role;
  exp: number;
}

const COOKIE = "poc_session";
const TTL_MS = 8 * 3600 * 1000;

function b64url(input: string | Buffer): string {
  return Buffer.from(input).toString("base64url");
}

function sign(value: string): string {
  return crypto.createHmac("sha256", config.sessionSecret).update(value).digest("base64url");
}

export function createToken(username: string, role: Role): string {
  const payload = b64url(JSON.stringify({ username, role, exp: Date.now() + TTL_MS }));
  return `${payload}.${sign(payload)}`;
}

export function verifyToken(token: string | undefined): Session | null {
  if (!token) return null;
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = sign(payload);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString()) as Session;
    if (!session.exp || Date.now() > session.exp) return null;
    if (session.role !== "viewer" && session.role !== "operator") return null;
    return session;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  return verifyToken(store.get(COOKIE)?.value);
}

export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session) throw new Error("UNAUTHORIZED");
  return session;
}

export async function requireOperator(): Promise<Session> {
  const session = await requireSession();
  if (session.role !== "operator") throw new Error("FORBIDDEN");
  return session;
}

// Usuarios fijos del demo. El OpenAPI de Teams es a nivel PLATAFORMA
// (AppKey/SecretKey), no por usuario final: si un cliente necesita permisos
// por usuario, los maneja en su propio desarrollo, no en Teams.
export function verifyPassword(username: string, password: string): Role | null {
  const users: Record<string, { password: string; role: Role }> = {
    admin: { password: config.adminPassword, role: "operator" },
    visor: { password: config.viewerPassword, role: "viewer" },
  };
  const user = users[username];
  if (!user) return null;
  const a = crypto.scryptSync(password, username, 32);
  const b = crypto.scryptSync(user.password, username, 32);
  return crypto.timingSafeEqual(a, b) ? user.role : null;
}

export const sessionCookie = {
  name: COOKIE,
  options: {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: TTL_MS / 1000,
  },
};
