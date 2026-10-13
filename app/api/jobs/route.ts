import { NextResponse } from 'next/server';
import { createJob, listJobs } from '@/lib/db/queries';
import { authorize } from '@/lib/auth/session';
import { createJobSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export async function GET() {
  const auth = await authorize();
  if (!auth.ok) return auth.response;
  return NextResponse.json({ jobs: await listJobs(auth.context.orgId) });
}

export async function POST(req: Request) {
  const auth = await authorize('admin', 'dispatcher');
  if (!auth.ok) return auth.response;

  const body = await req.json().catch(() => null);
  const parsed = createJobSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid job', issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  return NextResponse.json(
    { job: await createJob(auth.context.orgId, parsed.data) },
    { status: 201 },
  );
}
