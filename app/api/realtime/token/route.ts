import { NextResponse } from 'next/server';
import { SignJWT, type JWTHeaderParameters } from 'jose';
import { authorize } from '@/lib/auth/session';
import { getRealtimeSigner } from '@/lib/supabase/jwt';

export const dynamic = 'force-dynamic';

// Mints a short-lived Supabase-compatible JWT for Realtime; its `org` claim lets
// RLS scope each subscriber to their own organization.
export async function GET() {
  const auth = await authorize();
  if (!auth.ok) return auth.response;

  const signer = await getRealtimeSigner();
  if (!signer) {
    return NextResponse.json(
      { error: 'Realtime is not configured' },
      { status: 503 },
    );
  }

  const header: JWTHeaderParameters = { alg: signer.alg, typ: 'JWT' };
  if (signer.kid) header.kid = signer.kid;

  const token = await new SignJWT({
    role: 'authenticated',
    org: auth.context.orgId,
    name: auth.context.name ?? undefined,
    email: auth.context.email ?? undefined,
  })
    .setProtectedHeader(header)
    .setSubject(auth.context.userId)
    .setAudience('authenticated')
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(signer.key);

  return NextResponse.json({ token });
}
