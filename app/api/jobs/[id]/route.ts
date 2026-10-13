import { NextResponse } from 'next/server';
import { deleteJob, getJob, updateJob } from '@/lib/db/queries';
import { authorize } from '@/lib/auth/session';
import { updateJobSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await authorize();
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const job = await getJob(auth.context.orgId, id);
  if (!job) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  }
  return NextResponse.json({ job });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await authorize('admin', 'dispatcher', 'technician');
  if (!auth.ok) return auth.response;

  const body = await req.json().catch(() => null);
  const parsed = updateJobSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid job update', issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { id } = await params;
  const job = await updateJob(auth.context.orgId, id, parsed.data);
  if (!job) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  }
  return NextResponse.json({ job });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await authorize('admin', 'dispatcher');
  if (!auth.ok) return auth.response;

  const { id } = await params;
  await deleteJob(auth.context.orgId, id);
  return NextResponse.json({ ok: true });
}
