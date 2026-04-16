import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "maqconnect-dev-secret-change-in-production"
);

const COOKIE_NAME = "session_token";

const ROLE_ACCESS: Record<string, string[]> = {
  "/admin": ["ADMIN"],
  "/operador": ["OPERADOR", "ADMIN"],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const matchedPath = Object.keys(ROLE_ACCESS).find(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  if (!matchedPath) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Verify JWT signature, expiration, and role
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userRole = payload.rol as string | undefined;
    const allowedRoles = ROLE_ACCESS[matchedPath];

    if (!userRole || !allowedRoles.includes(userRole)) {
      // Valid token but wrong role — redirect to home
      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
  } catch {
    // Invalid or expired token — clear cookie and redirect to login
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.set(COOKIE_NAME, "", { path: "/", maxAge: 0 });
    return response;
  }
}

export const config = {
  matcher: ["/admin/:path*", "/operador/:path*"],
};
