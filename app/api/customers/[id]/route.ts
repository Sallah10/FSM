import { NextResponse } from 'next/server';
import { deleteCustomer, getCustomer, updateCustomer } from '@/lib/db/queries';
import { authorize } from '@/lib/auth/session';
import { updateCustomerSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await authorize();
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const customer = await getCustomer(auth.context.orgId, id);
  if (!customer) {
    return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
  }
  return NextResponse.json({ customer });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await authorize('admin', 'dispatcher');
  if (!auth.ok) return auth.response;

  const body = await req.json().catch(() => null);
  const parsed = updateCustomerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid customer update', issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { id } = await params;
  const customer = await updateCustomer(auth.context.orgId, id, parsed.data);
  if (!customer) {
    return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
  }
  return NextResponse.json({ customer });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await authorize('admin', 'dispatcher');
  if (!auth.ok) return auth.response;

  const { id } = await params;
  await deleteCustomer(auth.context.orgId, id);
  return NextResponse.json({ ok: true });
}
