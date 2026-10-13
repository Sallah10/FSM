import { NextResponse } from 'next/server';
import { listMembers, removeMember, updateMemberRole } from '@/lib/db/queries';
import { authorize } from '@/lib/auth/session';
import { updateMemberRoleSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

async function adminCount(orgId: string) {
  const members = await listMembers(orgId);
  return members.filter((member) => member.role === 'admin').length;
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await authorize('admin');
  if (!auth.ok) return auth.response;

  const { id } = await params;
  if (id === auth.context.userId) {
    return NextResponse.json(
      { error: 'You cannot change your own role' },
      { status: 400 },
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = updateMemberRoleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid role', issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  if (parsed.data.role !== 'admin' && (await adminCount(auth.context.orgId)) <= 1) {
    return NextResponse.json(
      { error: 'The organization needs at least one admin' },
      { status: 400 },
    );
  }

  await updateMemberRole(auth.context.orgId, id, parsed.data.role);
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await authorize('admin');
  if (!auth.ok) return auth.response;

  const { id } = await params;
  if (id === auth.context.userId) {
    return NextResponse.json(
      { error: 'You cannot remove yourself' },
      { status: 400 },
    );
  }

  await removeMember(auth.context.orgId, id);
  return NextResponse.json({ ok: true });
}
