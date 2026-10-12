import { NextResponse } from 'next/server';
import { createInvoice, listInvoices } from '@/lib/db/queries';
import { getApiSession } from '@/lib/auth/session';
import { createInvoiceSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getApiSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json({ invoices: await listInvoices() });
}

export async function POST(req: Request) {
  const session = await getApiSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = createInvoiceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid invoice', issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  return NextResponse.json(
    { invoice: await createInvoice(parsed.data) },
    { status: 201 },
  );
}
