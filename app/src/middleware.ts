import { NextResponse, type NextRequest } from "next/server";
import { DEMO_MODE } from "./lib/demo/config";

export function middleware(request: NextRequest) {
  if (!DEMO_MODE) return NextResponse.next();
  if (request.nextUrl.pathname === "/login") return NextResponse.redirect(new URL("/dashboard", request.url));
  if (request.nextUrl.pathname === "/api/health") return NextResponse.next();
  // A public portfolio must not expose the legacy database, seed, or paid-AI APIs.
  return NextResponse.json({ error: "This is a virtual demo. All workflow changes and runs are isolated to your browser." }, { status: 403 });
}

export const config = { matcher: ["/api/:path*", "/login"] };
