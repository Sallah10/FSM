// End-to-end smoke test against a running QuickSet server.
// Usage: start the app (npm start), then `npm run smoke`.
// Override the target with SMOKE_BASE_URL, the login with DEMO_EMAIL / DEMO_PASSWORD.

const baseUrl = process.env.SMOKE_BASE_URL ?? "http://localhost:3100";
const email = process.env.DEMO_EMAIL ?? "demo@quickset.com";
const password = process.env.DEMO_PASSWORD ?? "demo123";

let passed = 0;
let failed = 0;
const failures: string[] = [];

function check(name: string, condition: boolean, detail = "") {
  if (condition) {
    passed++;
    console.log(`  PASS  ${name}`);
  } else {
    failed++;
    failures.push(name);
    console.log(`  FAIL  ${name}${detail ? ` - ${detail}` : ""}`);
  }
}

class CookieJar {
  private cookies = new Map<string, string>();

  store(res: Response) {
    const setCookies = res.headers.getSetCookie?.() ?? [];
    for (const raw of setCookies) {
      const [pair] = raw.split(";");
      const index = pair.indexOf("=");
      if (index === -1) continue;
      this.cookies.set(
        pair.slice(0, index).trim(),
        pair.slice(index + 1).trim(),
      );
    }
  }

  header() {
    return [...this.cookies.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
  }
}

async function main() {
  console.log(`\nSmoke testing ${baseUrl}\n`);
  const jar = new CookieJar();

  // 1. Home page renders.
  const home = await fetch(`${baseUrl}/`);
  const homeBody = await home.text();
  check("GET / returns 200", home.status === 200, `got ${home.status}`);
  check("GET / contains QuickSet", homeBody.includes("QuickSet"));

  // 2. Dashboard is protected - no cookie should bounce us to the login page.
  const guarded = await fetch(`${baseUrl}/dashboard`, { redirect: "manual" });
  check(
    "GET /dashboard redirects when signed out",
    guarded.status === 307 || guarded.status === 302,
    `got ${guarded.status}`,
  );

  // 3. API rejects anonymous callers.
  const anonJobs = await fetch(`${baseUrl}/api/jobs`);
  check(
    "GET /api/jobs is 401 when signed out",
    anonJobs.status === 401,
    `got ${anonJobs.status}`,
  );

  // 4. Real credentials login against the seeded demo user.
  const csrfRes = await fetch(`${baseUrl}/api/auth/csrf`);
  jar.store(csrfRes);
  const { csrfToken } = (await csrfRes.json()) as { csrfToken: string };
  check("GET /api/auth/csrf returns a token", Boolean(csrfToken));

  const loginBody = new URLSearchParams({
    csrfToken,
    email,
    password,
    callbackUrl: `${baseUrl}/dashboard`,
    json: "true",
  });
  const loginRes = await fetch(`${baseUrl}/api/auth/callback/credentials`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Cookie: jar.header(),
    },
    body: loginBody,
    redirect: "manual",
  });
  jar.store(loginRes);
  check(
    "POST credentials login succeeds",
    loginRes.status === 200,
    `got ${loginRes.status}`,
  );

  const sessionRes = await fetch(`${baseUrl}/api/auth/session`, {
    headers: { Cookie: jar.header() },
  });
  const session = (await sessionRes.json()) as { user?: { email?: string } };
  check(
    "Session belongs to the demo user",
    session?.user?.email === email,
    JSON.stringify(session),
  );

  // 5. Dashboard now loads while signed in.
  const dashboard = await fetch(`${baseUrl}/dashboard`, {
    headers: { Cookie: jar.header() },
  });
  check(
    "GET /dashboard returns 200 when signed in",
    dashboard.status === 200,
    `got ${dashboard.status}`,
  );

  // 5b. Key pages render for an authed user.
  for (const path of [
    "/jobs",
    "/customers",
    "/technicians",
    "/invoices",
    "/analytics",
    "/map",
  ]) {
    const res = await fetch(`${baseUrl}${path}`, {
      headers: { Cookie: jar.header() },
    });
    check(`GET ${path} returns 200`, res.status === 200, `got ${res.status}`);
  }

  // 6. Authed data endpoints.
  const jobsRes = await fetch(`${baseUrl}/api/jobs`, {
    headers: { Cookie: jar.header() },
  });
  const jobsJson = (await jobsRes.json()) as {
    jobs: { id: string; status: string }[];
  };
  check(
    "GET /api/jobs returns 200",
    jobsRes.status === 200,
    `got ${jobsRes.status}`,
  );
  check(
    "Seeded jobs are present",
    (jobsJson.jobs?.length ?? 0) > 0,
    `count ${jobsJson.jobs?.length}`,
  );

  const statsRes = await fetch(`${baseUrl}/api/stats`, {
    headers: { Cookie: jar.header() },
  });
  const statsJson = (await statsRes.json()) as { stats: { totalJobs: number } };
  check(
    "GET /api/stats returns 200",
    statsRes.status === 200,
    `got ${statsRes.status}`,
  );
  check("Stats total jobs > 0", (statsJson.stats?.totalJobs ?? 0) > 0);

  // 7. Create a job, then mark it complete.
  const customersRes = await fetch(`${baseUrl}/api/customers`, {
    headers: { Cookie: jar.header() },
  });
  const customersJson = (await customersRes.json()) as {
    customers: { id: string }[];
  };
  const firstCustomerId = customersJson.customers?.[0]?.id;

  const createRes = await fetch(`${baseUrl}/api/jobs`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: jar.header() },
    body: JSON.stringify({
      title: "Smoke test job",
      customerId: firstCustomerId,
    }),
  });
  const created = (await createRes.json()) as {
    job?: { id: string; status: string };
  };
  check(
    "POST /api/jobs creates a job",
    createRes.status === 201,
    `got ${createRes.status}`,
  );

  if (created.job?.id) {
    const patchRes = await fetch(`${baseUrl}/api/jobs/${created.job.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: jar.header() },
      body: JSON.stringify({ status: "completed" }),
    });
    const patched = (await patchRes.json()) as { job?: { status: string } };
    check("PATCH marks the job completed", patched.job?.status === "completed");
  }

  // 7b. Detail pages render for existing records.
  const detailChecks: { path: string; id: string | undefined }[] = [
    { path: "/jobs", id: created.job?.id },
    { path: "/customers", id: firstCustomerId },
  ];

  const invoicesRes = await fetch(`${baseUrl}/api/invoices`, {
    headers: { Cookie: jar.header() },
  });
  const invoicesJson = (await invoicesRes.json()) as {
    invoices: { id: string }[];
  };
  detailChecks.push({ path: "/invoices", id: invoicesJson.invoices?.[0]?.id });

  const techsRes = await fetch(`${baseUrl}/api/technicians`, {
    headers: { Cookie: jar.header() },
  });
  const techsJson = (await techsRes.json()) as {
    technicians: { id: string }[];
  };
  detailChecks.push({ path: "/technicians", id: techsJson.technicians?.[0]?.id });

  for (const { path, id } of detailChecks) {
    if (!id) continue;
    const res = await fetch(`${baseUrl}${path}/${id}`, {
      headers: { Cookie: jar.header() },
    });
    check(
      `GET ${path}/[id] returns 200`,
      res.status === 200,
      `got ${res.status}`,
    );
  }

  // 8. Validation + duplicate-signup guards.
  const badJob = await fetch(`${baseUrl}/api/jobs`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: jar.header() },
    body: JSON.stringify({ title: "x" }),
  });
  check(
    "POST /api/jobs rejects invalid payload",
    badJob.status === 400,
    `got ${badJob.status}`,
  );

  const dupe = await fetch(`${baseUrl}/api/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Dupe", email, password: "password123" }),
  });
  check(
    "POST /api/signup rejects duplicate email",
    dupe.status === 409,
    `got ${dupe.status}`,
  );

  const fresh = await fetch(`${baseUrl}/api/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "New Dispatcher",
      email: `smoke_${Date.now()}@quickset.com`,
      password: "password123",
    }),
  });
  check(
    "POST /api/signup creates a new account",
    fresh.status === 201,
    `got ${fresh.status}`,
  );

  console.log(`\n  ${passed} passed, ${failed} failed\n`);
  if (failed > 0) {
    console.log("Failures:", failures.join(", "));
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Smoke run crashed:", err);
  process.exit(1);
});
