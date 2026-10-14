import { NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import { authorize } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

// Hands the browser a short-lived Supabase-compatible JWT so Realtime can
// authorize private channels. The `org` claim lets RLS on realtime.messages
// scope each subscriber to their own organization's channels.
export async function GET() {
  const auth = await authorize();
  if (!auth.ok) return auth.response;

  const secret = process.env.SUPABASE_JWT_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: 'Realtime is not configured' },
      { status: 503 },
    );
  }

  const token = await new SignJWT({
    role: 'authenticated',
    org: auth.context.orgId,
    name: auth.context.name ?? undefined,
    email: auth.context.email ?? undefined,
  })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setSubject(auth.context.userId)
    .setAudience('authenticated')
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(new TextEncoder().encode(secret));

  return NextResponse.json({ token });
}
