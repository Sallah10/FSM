import { NextResponse } from 'next/server';
import {
  createUser,
  getInviteByToken,
  getOrganization,
  getUserByEmail,
  markInviteAccepted,
} from '@/lib/db/queries';
import { hashPassword } from '@/lib/auth/password';
import { acceptInviteSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

// Public: look up an invite so the accept page can show who/which org.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const invite = await getInviteByToken(token);
  if (!invite || invite.status !== 'pending') {
    return NextResponse.json({ error: 'Invite not found' }, { status: 404 });
  }

  const organization = await getOrganization(invite.orgId);

  return NextResponse.json({
    invite: { email: invite.email, role: invite.role },
    organization: organization ? { name: organization.name } : null,
  });
}

// Accept an invite: creates the account inside the inviter's organization.
export async function POST(
  req: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const invite = await getInviteByToken(token);
  if (!invite || invite.status !== 'pending') {
    return NextResponse.json({ error: 'Invite not found' }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const parsed = acceptInviteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid details', issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  if (await getUserByEmail(invite.email)) {
    return NextResponse.json(
      { error: 'An account with that email already exists' },
      { status: 409 },
    );
  }

  const user = await createUser({
    name: parsed.data.name,
    email: invite.email,
    passwordHash: hashPassword(parsed.data.password),
    role: invite.role,
    orgId: invite.orgId,
  });
  await markInviteAccepted(invite.id);

  return NextResponse.json(
    { user: { id: user.id, name: user.name, email: user.email } },
    { status: 201 },
  );
}
