import { NextResponse } from 'next/server';
import {
  deleteInvoice,
  getInvoice,
  updateInvoiceStatus,
} from '@/lib/db/queries';
import { authorize } from '@/lib/auth/session';
import { updateInvoiceSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await authorize();
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const invoice = await getInvoice(auth.context.orgId, id);
  if (!invoice) {
    return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
  }
  return NextResponse.json({ invoice });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await authorize('admin', 'dispatcher');
  if (!auth.ok) return auth.response;

  const body = await req.json().catch(() => null);
  const parsed = updateInvoiceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid invoice update', issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { id } = await params;
  const invoice = await updateInvoiceStatus(
    auth.context.orgId,
    id,
    parsed.data.status,
  );
  if (!invoice) {
    return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
  }
  return NextResponse.json({ invoice });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await authorize('admin', 'dispatcher');
  if (!auth.ok) return auth.response;

  const { id } = await params;
  await deleteInvoice(auth.context.orgId, id);
  return NextResponse.json({ ok: true });
}
