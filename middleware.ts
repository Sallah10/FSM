// import { getToken } from "next-auth/jwt";
// import { NextResponse } from "next/server";

// const protectedRoutes = ["/dashboard", "/jobs", "/technicians", "/invoices", "/mapPage"];

// export async function middleware(req: { nextUrl: { pathname: string; }; url: string | URL | undefined; }) {
//   const token = await getToken({ req });
//   const isProtected = protectedRoutes.some((path) => req.nextUrl.pathname.startsWith(path));

//   if (isProtected && !token) {
//     return NextResponse.redirect(new URL("/auth/login", req.url));
//   }

//   return NextResponse.next();
// }
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // ✅ You can now safely access req.nextauth
    if (req.nextauth.token?.role !== "admin") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token, // Only allow signed in users
    },
  }
);