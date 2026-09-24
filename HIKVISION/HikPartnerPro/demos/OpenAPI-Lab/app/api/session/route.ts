import { NextResponse } from "next/server";
import { fetchToken } from "@/lib/hpp";
import { clearSession, maskKey, readSession, writeSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await readSession();
  if (!session) {
    return NextResponse.json({ connected: false });
  }
  return NextResponse.json({
    connected: true,
    areaDomain: session.areaDomain,
    expireTime: session.expireTime,
    appKeyMasked: maskKey(session.appKey),
  });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    appKey?: string;
    secretKey?: string;
  };
  const appKey = body.appKey?.trim() ?? "";
  const secretKey = body.secretKey?.trim() ?? "";
  if (!appKey || !secretKey) {
    return NextResponse.json(
      { connected: false, message: "appKey y secretKey son obligatorios" },
      { status: 400 },
    );
  }

  const token = await fetchToken(appKey, secretKey);
  if (!token.ok) {
    return NextResponse.json(
      {
        connected: false,
        errorCode: token.errorCode,
        message: token.message,
        raw: token.raw,
      },
      { status: 401 },
    );
  }

  await writeSession({
    appKey,
    secretKey,
    accessToken: token.accessToken,
    expireTime: token.expireTime,
    areaDomain: token.areaDomain,
  });

  return NextResponse.json({
    connected: true,
    areaDomain: token.areaDomain,
    expireTime: token.expireTime,
    appKeyMasked: maskKey(appKey),
    errorCode: token.errorCode,
  });
}

export async function DELETE() {
  await clearSession();
  return NextResponse.json({ connected: false });
}
