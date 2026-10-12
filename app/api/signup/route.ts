import { NextResponse } from 'next/server';
import { createUser, getUserByEmail } from '@/lib/db/queries';
import { hashPassword } from '@/lib/auth/password';
import { signupSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

// Public endpoint: registers a new dispatcher account with a hashed password.
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid signup details', issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { name, email, password } = parsed.data;
  if (await getUserByEmail(email)) {
    return NextResponse.json(
      { error: 'An account with that email already exists' },
      { status: 409 },
    );
  }

  const user = await createUser({
    name,
    email,
    passwordHash: hashPassword(password),
    role: 'dispatcher',
  });

  return NextResponse.json(
    { user: { id: user.id, name: user.name, email: user.email } },
    { status: 201 },
  );
}
