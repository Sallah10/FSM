import { NextResponse } from 'next/server';
import {
  getOrganization,
  listInvites,
  listMembers,
  renameOrganization,
} from '@/lib/db/queries';
import { authorize } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export async function GET() {
  const auth = await authorize();
  if (!auth.ok) return auth.response;

  const { orgId, role } = auth.context;
  const [organization, members, invites] = await Promise.all([
    getOrganization(orgId),
    listMembers(orgId),
    listInvites(orgId),
  ]);

  return NextResponse.json({
    organization,
    members,
    invites,
    currentRole: role,
  });
}

export async function PATCH(req: Request) {
  const auth = await authorize('admin');
  if (!auth.ok) return auth.response;

  const body = await req.json().catch(() => null);
  const name = typeof body?.name === 'string' ? body.name.trim() : '';
  if (name.length < 2 || name.length > 120) {
    return NextResponse.json(
      { error: 'Organization name must be 2-120 characters' },
      { status: 400 },
    );
  }

  await renameOrganization(auth.context.orgId, name);
  return NextResponse.json({ organization: { id: auth.context.orgId, name } });
}
