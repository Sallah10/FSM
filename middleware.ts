// import { getToken } from "next-auth/jwt";
// import { NextResponse } from "next/server";

// const protectedRoutes = ["/dashboard", "/jobs", "/technicians", "/invoices", "/mapPage"];

// export async function middleware(req) {
//   const token = await getToken({ req });
//   const isProtected = protectedRoutes.some((path) => req.nextUrl.pathname.startsWith(path));

//   if (isProtected && !token) {
//     return NextResponse.redirect(new URL("/auth/login", req.url));
//   }

//   return NextResponse.next();
// }
