import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Redirect disallowed roles here so the browser gets a real 307 before the page
// starts streaming; the pages and API re-check the same rules.
const adminOnly = ["/technicians"];
const staffOnly = ["/invoices", "/analytics"];

function matches(path: string, prefixes: string[]) {
  return prefixes.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );
}

export default withAuth(
  function middleware(req) {
    const role = (req.nextauth.token as { role?: string } | null)?.role;
    const path = req.nextUrl.pathname;

    if (matches(path, adminOnly) && role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    if (
      matches(path, staffOnly) &&
      role !== "admin" &&
      role !== "dispatcher"
    ) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    pages: {
      signIn: "/auth/login",
    },
  },
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/jobs/:path*",
    "/technicians/:path*",
    "/customers/:path*",
    "/invoices/:path*",
    "/analytics/:path*",
    "/map/:path*",
    "/chat/:path*",
    "/settings/:path*",
  ],
};
