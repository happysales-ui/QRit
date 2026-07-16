import { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", request.nextUrl.pathname);

  return updateSession(
    new NextRequest(request, {
      headers: requestHeaders,
    }),
  );
}

// Only routes that need a Supabase session (or the x-pathname header, used by
// the admin layout). Public QR routes (/[username], transfer, contact) read
// public data with an anon client and skip the auth round trip entirely.
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/login",
    "/signup",
    "/forgot-password",
    "/auth/:path*",
  ],
};
