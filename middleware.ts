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

export default withAuth({
  pages: {
    signIn: '/auth/login',
  }
});

export const config = {
  matcher: ["/dashboard/:path*"],
};
