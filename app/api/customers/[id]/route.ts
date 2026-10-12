import { NextResponse } from 'next/server';
import { getCustomer } from '@/lib/db/queries';
import { getApiSession } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getApiSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const customer = getCustomer(id);
  if (!customer) {
    return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
  }
  return NextResponse.json({ customer });
}
