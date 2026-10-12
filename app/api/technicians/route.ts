import { NextResponse } from 'next/server';
import { createTechnician, listTechnicians } from '@/lib/db/queries';
import { getApiSession } from '@/lib/auth/session';
import { createTechnicianSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getApiSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json({ technicians: await listTechnicians() });
}

export async function POST(req: Request) {
  const session = await getApiSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = createTechnicianSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid technician', issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  return NextResponse.json(
    { technician: await createTechnician(parsed.data) },
    { status: 201 },
  );
}
