import { NextResponse } from 'next/server';
import { revokeInvite } from '@/lib/db/queries';
import { authorize } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await authorize('admin');
  if (!auth.ok) return auth.response;

  const { id } = await params;
  await revokeInvite(auth.context.orgId, id);
  return NextResponse.json({ ok: true });
}
