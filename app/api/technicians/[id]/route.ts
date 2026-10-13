import { NextResponse } from 'next/server';
import {
  deleteTechnician,
  getTechnician,
  updateTechnician,
} from '@/lib/db/queries';
import { authorize } from '@/lib/auth/session';
import { updateTechnicianSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await authorize();
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const technician = await getTechnician(auth.context.orgId, id);
  if (!technician) {
    return NextResponse.json({ error: 'Technician not found' }, { status: 404 });
  }
  return NextResponse.json({ technician });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await authorize('admin', 'dispatcher');
  if (!auth.ok) return auth.response;

  const body = await req.json().catch(() => null);
  const parsed = updateTechnicianSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid technician update', issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { id } = await params;
  const technician = await updateTechnician(
    auth.context.orgId,
    id,
    parsed.data,
  );
  if (!technician) {
    return NextResponse.json({ error: 'Technician not found' }, { status: 404 });
  }
  return NextResponse.json({ technician });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await authorize('admin', 'dispatcher');
  if (!auth.ok) return auth.response;

  const { id } = await params;
  await deleteTechnician(auth.context.orgId, id);
  return NextResponse.json({ ok: true });
}
