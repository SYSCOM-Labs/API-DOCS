import { NextResponse } from "next/server";
import { uploadHpp } from "@/lib/hpp";
import { readSession, writeSession } from "@/lib/session";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: Request) {
  const session = await readSession();
  if (!session) {
    return NextResponse.json({ errorCode: "NO_SESSION", message: "Sin sesión. Conecta API Key." }, { status: 401 });
  }

  const incoming = await request.formData();
  const path = String(incoming.get("path") ?? "");
  if (!path.startsWith("/api/hpcgw")) {
    return NextResponse.json({ errorCode: "BAD_PATH", message: "Ruta no permitida" }, { status: 400 });
  }

  const outbound = new FormData();
  incoming.forEach((value, key) => {
    if (key === "path") return;
    outbound.append(key, value);
  });

  try {
    const result = await uploadHpp({ session, path, form: outbound });
    if (result.session.accessToken !== session.accessToken) {
      await writeSession(result.session);
    }
    return NextResponse.json({ httpStatus: result.status, result: result.json });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error de red";
    return NextResponse.json({ errorCode: "PROXY_ERROR", message }, { status: 502 });
  }
}
