import { NextResponse } from 'next/server';
import { getStats } from '@/lib/db/queries';
import { authorize } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export async function GET() {
  const auth = await authorize();
  if (!auth.ok) return auth.response;
  return NextResponse.json({ stats: await getStats(auth.context.orgId) });
}
