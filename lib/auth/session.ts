import { redirect } from 'next/navigation';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import type { UserRole } from '@/lib/types';

// Small helper so route handlers can just ask "who is calling?".
export function getApiSession() {
  return getServerSession(authOptions);
}

export interface SessionContext {
  userId: string;
  orgId: string;
  role: UserRole;
  technicianId?: string | null;
  name?: string | null;
  email?: string | null;
}

// Resolve the current user + their organization. Returns null when signed out
export async function getSessionContext(): Promise<SessionContext | null> {
  const session = await getApiSession();
  const user = session?.user;
  if (!user?.id || !user.orgId) return null;
  return {
    userId: user.id,
    orgId: user.orgId,
    role: (user.role as UserRole) ?? 'dispatcher',
    technicianId: user.technicianId ?? null,
    name: user.name,
    email: user.email,
  };
}

// For server components: bounce to login if there is no usable session.
export async function requireSession(): Promise<SessionContext> {
  const context = await getSessionContext();
  if (!context) redirect('/auth/login');
  return context;
}

// For server components: also require one of the given roles, otherwise send the
export async function requireRole(...roles: UserRole[]): Promise<SessionContext> {
  const context = await requireSession();
  if (!roles.includes(context.role)) redirect('/dashboard');
  return context;
}

type AuthorizeResult =
  | { ok: true; context: SessionContext }
  | { ok: false; response: NextResponse };

// API-route guard: 401 when signed out, 403 when the role is not allowed.
export async function authorize(...roles: UserRole[]): Promise<AuthorizeResult> {
  const context = await getSessionContext();
  if (!context) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }
  if (roles.length && !roles.includes(context.role)) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
    };
  }
  return { ok: true, context };
}
