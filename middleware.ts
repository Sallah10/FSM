import { withAuth } from "next-auth/middleware";

// Every private area of the app now sits behind the NextAuth session cookie.
export default withAuth({
  pages: {
    signIn: "/auth/login",
  },
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/jobs/:path*",
    "/technicians/:path*",
    "/customers/:path*",
    "/invoices/:path*",
    "/analytics/:path*",
    "/map/:path*",
    "/settings/:path*",
  ],
};
