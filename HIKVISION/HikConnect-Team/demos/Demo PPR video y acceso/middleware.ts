import { NextResponse, type NextRequest } from "next/server";

// Guardia ligera: solo verifica presencia de la cookie. La verificacion
// firme (firma HMAC + expiracion) ocurre en cada page/route con getSession().
export function middleware(request: NextRequest) {
  const hasSession = request.cookies.has("poc_session");
  if (!hasSession) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(login);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!login|api/auth|_next/static|_next/image|favicon.ico|ezuikit).*)",
  ],
};
