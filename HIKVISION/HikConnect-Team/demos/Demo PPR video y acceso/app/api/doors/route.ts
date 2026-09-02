import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getDoors } from "@/lib/hct/doors";
import { config } from "@/lib/config";
import { HctError } from "@/lib/hct/client";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  try {
    const doors = await getDoors(config.mode);
    const isOperator = session.role === "operator";
    return NextResponse.json({
      items: doors.map((d) => ({ ...d, canCommand: isOperator })),
      total: doors.length,
    });
  } catch (e) {
    const message = e instanceof HctError ? `${e.errorCode}: ${e.message}` : "Error consultando puertas";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
