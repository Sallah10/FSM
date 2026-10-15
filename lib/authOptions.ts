import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import type { NextAuthOptions } from "next-auth";
import {
  createOrganization,
  createUser,
  getUserByEmail,
} from "@/lib/db/queries";
import { verifyPassword } from "@/lib/auth/password";
import { decryptSecret } from "@/lib/auth/secret-box";
import { verifyTotp } from "@/lib/auth/totp";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role?: string;
      orgId?: string | null;
      technicianId?: string | null;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
  interface User {
    id: string;
    role?: string;
    orgId?: string | null;
    technicianId?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    orgId?: string | null;
    technicianId?: string | null;
  }
}

const providers: NextAuthOptions["providers"] = [
  CredentialsProvider({
    name: "Credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
      code: { label: "Two-factor code", type: "text" },
    },
    async authorize(credentials) {
      const email = credentials?.email?.trim().toLowerCase();
      const password = credentials?.password;

      if (!email || !password) return null;

      const user = await getUserByEmail(email);
      if (!user || !verifyPassword(password, user.passwordHash)) {
        return null;
      }

      // When 2FA is on, the password alone is not enough - require a valid code.
      if (user.twoFactorEnabled) {
        const secret = user.twoFactorSecret
          ? decryptSecret(user.twoFactorSecret)
          : null;
        if (!secret || !credentials?.code || !verifyTotp(secret, credentials.code)) {
          return null;
        }
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        orgId: user.orgId,
        technicianId: user.technicianId,
      };
    },
  }),
];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  );
}

export const authOptions: NextAuthOptions = {
  providers,
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/auth/login",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        let dbUser = await getUserByEmail(user.email);
        if (!dbUser) {
          const org = await createOrganization(
            `${user.name ?? user.email}'s workspace`,
          );
          dbUser = await createUser({
            name: user.name ?? "Google User",
            email: user.email,
            image: user.image ?? null,
            role: "admin",
            orgId: org.id,
          });
        }
        user.id = dbUser.id;
        user.role = dbUser.role;
        user.orgId = dbUser.orgId;
        user.technicianId = dbUser.technicianId;
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.orgId = user.orgId;
        token.technicianId = user.technicianId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.orgId = token.orgId as string;
        session.user.technicianId = token.technicianId as string | null;
      }
      return session;
    },
  },
};
