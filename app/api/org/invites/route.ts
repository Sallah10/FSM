import { NextResponse } from 'next/server';
import { createInvite, getUserByEmail, listInvites } from '@/lib/db/queries';
import { authorize } from '@/lib/auth/session';
import { inviteSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export async function GET() {
  const auth = await authorize('admin');
  if (!auth.ok) return auth.response;
  return NextResponse.json({ invites: await listInvites(auth.context.orgId) });
}

export async function POST(req: Request) {
  const auth = await authorize('admin');
  if (!auth.ok) return auth.response;

  const body = await req.json().catch(() => null);
  const parsed = inviteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid invite', issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const email = parsed.data.email.toLowerCase();
  if (await getUserByEmail(email)) {
    return NextResponse.json(
      { error: 'That person is already a member' },
      { status: 409 },
    );
  }

  const existing = (await listInvites(auth.context.orgId)).find(
    (invite) => invite.email === email,
  );
  const invite =
    existing ?? (await createInvite(auth.context.orgId, email, parsed.data.role));

  const origin = new URL(req.url).origin;
  return NextResponse.json(
    { invite, inviteUrl: `${origin}/invite/${invite.token}` },
    { status: existing ? 200 : 201 },
  );
}
