import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { DEMO_MODE } from "./lib/demo/config";

// Legacy mode only: API paths reachable without a session.
// - /api/health: Railway health check
// - /api/auth/*: the NextAuth sign-in flow itself
// - /api/seed: must work before any user exists; it gates itself (see its route)
function isPublicApiPath(pathname: string) {
  return pathname === "/api/health" || pathname === "/api/seed" || pathname.startsWith("/api/auth/");
}

async function requireSession(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith("/api/") || isPublicApiPath(pathname)) return NextResponse.next();
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (token) return NextResponse.next();
  } catch {
    // Missing/invalid secret or malformed cookie: treat as unauthenticated.
  }
  return NextResponse.json({ error: "Authentication required" }, { status: 401 });
}

export async function middleware(request: NextRequest) {
  if (!DEMO_MODE) return requireSession(request);
  if (request.nextUrl.pathname === "/login") return NextResponse.redirect(new URL("/dashboard", request.url));
  if (request.nextUrl.pathname === "/api/health") return NextResponse.next();
  // A public portfolio must not expose the legacy database, seed, or paid-AI APIs.
  return NextResponse.json({ error: "This is a virtual demo. All workflow changes and runs are isolated to your browser." }, { status: 403 });
}

export const config = { matcher: ["/api/:path*", "/login"] };
