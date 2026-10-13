import { NextResponse } from 'next/server';
import { createOrganization, createUser, getUserByEmail } from '@/lib/db/queries';
import { hashPassword } from '@/lib/auth/password';
import { signupSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

// Public endpoint: registers a new account, its organization, and makes the
// new user the admin of that organization.
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid signup details', issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { name, email, password, orgName } = parsed.data;
  if (await getUserByEmail(email)) {
    return NextResponse.json(
      { error: 'An account with that email already exists' },
      { status: 409 },
    );
  }

  const organization = await createOrganization(
    orgName?.trim() || `${name}'s workspace`,
  );

  const user = await createUser({
    name,
    email,
    passwordHash: hashPassword(password),
    role: 'admin',
    orgId: organization.id,
  });

  return NextResponse.json(
    {
      user: { id: user.id, name: user.name, email: user.email },
      organization: { id: organization.id, name: organization.name },
    },
    { status: 201 },
  );
}
