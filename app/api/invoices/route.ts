import { NextResponse } from 'next/server';
import { createInvoice, listInvoices } from '@/lib/db/queries';
import { authorize } from '@/lib/auth/session';
import { createInvoiceSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export async function GET() {
  const auth = await authorize();
  if (!auth.ok) return auth.response;
  return NextResponse.json({ invoices: await listInvoices(auth.context.orgId) });
}

export async function POST(req: Request) {
  const auth = await authorize('admin', 'dispatcher');
  if (!auth.ok) return auth.response;

  const body = await req.json().catch(() => null);
  const parsed = createInvoiceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid invoice', issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  return NextResponse.json(
    { invoice: await createInvoice(auth.context.orgId, parsed.data) },
    { status: 201 },
  );
}
