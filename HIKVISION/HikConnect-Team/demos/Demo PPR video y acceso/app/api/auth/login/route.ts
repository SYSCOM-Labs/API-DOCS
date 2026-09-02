import { NextResponse } from "next/server";
import { createToken, sessionCookie, verifyPassword } from "@/lib/auth/session";

export async function POST(request: Request) {
  let body: { username?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  const { username = "", password = "" } = body;
  const role = verifyPassword(username, password);
  if (!role) {
    return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true, username, role });
  res.cookies.set(sessionCookie.name, createToken(username, role), sessionCookie.options);
  return res;
}
