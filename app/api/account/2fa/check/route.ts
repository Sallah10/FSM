import { NextResponse } from 'next/server';
import { getUserByEmail } from '@/lib/db/queries';
import { verifyPassword } from '@/lib/auth/password';
import { loginCheckSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

// Called by the login form after email + password to decide whether to ask for a
// code. It only reports 2FA status once the password is already correct.
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = loginCheckSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ status: 'invalid' });

  const user = await getUserByEmail(parsed.data.email);
  if (!user || !verifyPassword(parsed.data.password, user.passwordHash)) {
    return NextResponse.json({ status: 'invalid' });
  }

  return NextResponse.json({ status: user.twoFactorEnabled ? 'need_2fa' : 'ok' });
}
