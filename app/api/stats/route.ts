import { NextResponse } from 'next/server';
import { getStats } from '@/lib/db/queries';
import { getApiSession } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getApiSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json({ stats: await getStats() });
}
