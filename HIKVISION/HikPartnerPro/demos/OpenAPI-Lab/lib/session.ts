import { cookies } from "next/headers";

export const SESSION_COOKIE = "hpp_lab";

export type HppSession = {
  appKey: string;
  secretKey: string;
  accessToken: string;
  areaDomain: string;
  expireTime: number;
};

function encode(session: HppSession) {
  return Buffer.from(JSON.stringify(session), "utf8").toString("base64url");
}

function decode(raw: string): HppSession | null {
  try {
    const json = Buffer.from(raw, "base64url").toString("utf8");
    const parsed = JSON.parse(json) as HppSession;
    if (!parsed.appKey || !parsed.secretKey) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function readSession(): Promise<HppSession | null> {
  const store = await cookies();
  const raw = store.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  return decode(raw);
}

export async function writeSession(session: HppSession) {
  const store = await cookies();
  store.set({
    name: SESSION_COOKIE,
    value: encode(session),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSession() {
  const store = await cookies();
  store.set({
    name: SESSION_COOKIE,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export function maskKey(key: string) {
  if (key.length <= 6) return "••••";
  return `${key.slice(0, 4)}••••${key.slice(-3)}`;
}
