import { NextResponse } from 'next/server';
import { authorize } from '@/lib/auth/session';
import { getUserById, setTwoFactor } from '@/lib/db/queries';
import { decryptSecret, encryptSecret } from '@/lib/auth/secret-box';
import { generateTotpSecret, totpUri, verifyTotp } from '@/lib/auth/totp';
import { twoFactorCodeSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

// Status of the signed-in user's two-factor setup.
export async function GET() {
  const auth = await authorize();
  if (!auth.ok) return auth.response;

  const user = await getUserById(auth.context.userId);
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json({
    enabled: user.twoFactorEnabled,
    pending: Boolean(user.twoFactorSecret) && !user.twoFactorEnabled,
  });
}

// begin   -> mint a new secret and return the otpauth URL to scan
// enable  -> confirm a code, turning 2FA on
// disable -> confirm a code, turning 2FA off and clearing the secret
export async function POST(req: Request) {
  const auth = await authorize();
  if (!auth.ok) return auth.response;

  const user = await getUserById(auth.context.userId);
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await req.json().catch(() => null);
  const action = body?.action;

  if (action === 'begin') {
    const secret = generateTotpSecret();
    await setTwoFactor(user.id, encryptSecret(secret), false);
    return NextResponse.json({ secret, otpauthUrl: totpUri(secret, user.email) });
  }

  if (action === 'enable' || action === 'disable') {
    const parsed = twoFactorCodeSchema.safeParse(body?.code);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Enter the 6-digit code' }, { status: 400 });
    }
    if (!user.twoFactorSecret) {
      return NextResponse.json({ error: 'Start setup first' }, { status: 400 });
    }

    const secret = decryptSecret(user.twoFactorSecret);
    if (!secret || !verifyTotp(secret, parsed.data)) {
      return NextResponse.json({ error: 'That code is not valid' }, { status: 400 });
    }

    const enable = action === 'enable';
    await setTwoFactor(user.id, enable ? user.twoFactorSecret : null, enable);
    return NextResponse.json({ enabled: enable });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
