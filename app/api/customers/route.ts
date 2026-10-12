import { NextResponse } from 'next/server';
import { createCustomer, listCustomers } from '@/lib/db/queries';
import { getApiSession } from '@/lib/auth/session';
import { createCustomerSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getApiSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json({ customers: await listCustomers() });
}

export async function POST(req: Request) {
  const session = await getApiSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = createCustomerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid customer', issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  return NextResponse.json(
    { customer: await createCustomer(parsed.data) },
    { status: 201 },
  );
}
