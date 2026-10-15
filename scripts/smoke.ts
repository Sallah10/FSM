// End-to-end smoke test against a running QuickSet server.
// Usage: start the app (npm start), then `npm run smoke`.
// Override the target with SMOKE_BASE_URL, the login with DEMO_EMAIL / DEMO_PASSWORD.

import { generateTotp } from "../lib/auth/totp";

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
    "/chat",
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

  // 9. Organization + invites.
  const anonOrg = await fetch(`${baseUrl}/api/org`);
  check(
    "GET /api/org is 401 when signed out",
    anonOrg.status === 401,
    `got ${anonOrg.status}`,
  );

  const orgRes = await fetch(`${baseUrl}/api/org`, {
    headers: { Cookie: jar.header() },
  });
  const orgJson = (await orgRes.json()) as {
    members?: { id: string }[];
    currentRole?: string;
  };
  check("GET /api/org returns 200", orgRes.status === 200, `got ${orgRes.status}`);
  check("Organization has members", (orgJson.members?.length ?? 0) > 0);
  check("Signed-in demo user is an admin", orgJson.currentRole === "admin");

  const inviteEmail = `invite_${Date.now()}@quickset.com`;
  const inviteRes = await fetch(`${baseUrl}/api/org/invites`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: jar.header() },
    body: JSON.stringify({ email: inviteEmail, role: "technician" }),
  });
  const inviteJson = (await inviteRes.json()) as {
    invite?: { id: string; token: string };
  };
  check(
    "POST /api/org/invites creates an invite",
    inviteRes.status === 201,
    `got ${inviteRes.status}`,
  );

  if (inviteJson.invite?.token) {
    const publicInvite = await fetch(
      `${baseUrl}/api/invite/${inviteJson.invite.token}`,
    );
    const publicJson = (await publicInvite.json()) as {
      invite?: { email?: string };
    };
    check(
      "GET /api/invite/[token] is public",
      publicInvite.status === 200 && publicJson.invite?.email === inviteEmail,
      `got ${publicInvite.status}`,
    );

    const acceptRes = await fetch(
      `${baseUrl}/api/invite/${inviteJson.invite.token}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Invited Tech", password: "password123" }),
      },
    );
    check(
      "POST /api/invite/[token] accepts the invite",
      acceptRes.status === 201,
      `got ${acceptRes.status}`,
    );

    const revoked = await fetch(
      `${baseUrl}/api/org/invites/${inviteJson.invite.id}`,
      { method: "DELETE", headers: { Cookie: jar.header() } },
    );
    check("DELETE /api/org/invites/[id] works", revoked.status === 200);
  }

  // 10. Role enforcement: technicians are read-only on directory + org admin.
  const techJar = new CookieJar();
  const techCsrfRes = await fetch(`${baseUrl}/api/auth/csrf`);
  techJar.store(techCsrfRes);
  const { csrfToken: techCsrf } = (await techCsrfRes.json()) as {
    csrfToken: string;
  };
  const techLogin = await fetch(`${baseUrl}/api/auth/callback/credentials`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Cookie: techJar.header(),
    },
    body: new URLSearchParams({
      csrfToken: techCsrf,
      email: "technician@quickset.com",
      password: "demo123",
      callbackUrl: `${baseUrl}/dashboard`,
      json: "true",
    }),
    redirect: "manual",
  });
  techJar.store(techLogin);

  const forbiddenTech = await fetch(`${baseUrl}/api/technicians`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: techJar.header() },
    body: JSON.stringify({
      name: "Should Fail",
      email: `blocked_${Date.now()}@quickset.com`,
    }),
  });
  check(
    "Technician cannot create technicians (403)",
    forbiddenTech.status === 403,
    `got ${forbiddenTech.status}`,
  );

  const forbiddenInvite = await fetch(`${baseUrl}/api/org/invites`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: techJar.header() },
    body: JSON.stringify({ email: `blocked_${Date.now()}@quickset.com` }),
  });
  check(
    "Technician cannot invite members (403)",
    forbiddenInvite.status === 403,
    `got ${forbiddenInvite.status}`,
  );

  // 10b. Page-level role enforcement: the same guard covers server pages too.
  for (const path of ["/invoices", "/analytics", "/technicians"]) {
    const res = await fetch(`${baseUrl}${path}`, {
      headers: { Cookie: techJar.header() },
      redirect: "manual",
    });
    check(
      `Technician is redirected from ${path}`,
      res.status === 307 || res.status === 302,
      `got ${res.status}`,
    );
  }

  for (const path of ["/dashboard", "/jobs", "/chat"]) {
    const res = await fetch(`${baseUrl}${path}`, {
      headers: { Cookie: techJar.header() },
      redirect: "manual",
    });
    check(
      `Technician can open ${path}`,
      res.status === 200,
      `got ${res.status}`,
    );
  }

  // 11. Live chat.
  const anonMessages = await fetch(`${baseUrl}/api/messages`);
  check(
    "GET /api/messages is 401 when signed out",
    anonMessages.status === 401,
    `got ${anonMessages.status}`,
  );

  const room = `job:smoke_${Date.now()}`;
  const postMessage = await fetch(`${baseUrl}/api/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: jar.header() },
    body: JSON.stringify({ roomId: room, body: "Smoke hello" }),
  });
  const postJson = (await postMessage.json()) as { message?: { id: string } };
  check(
    "POST /api/messages creates a message",
    postMessage.status === 201,
    `got ${postMessage.status}`,
  );

  const getMessages = await fetch(
    `${baseUrl}/api/messages?room=${encodeURIComponent(room)}`,
    { headers: { Cookie: jar.header() } },
  );
  const messagesJson = (await getMessages.json()) as {
    messages?: { body: string }[];
  };
  check("GET /api/messages returns 200", getMessages.status === 200);
  check(
    "GET /api/messages includes the new message",
    (messagesJson.messages ?? []).some((m) => m.body === "Smoke hello"),
  );

  const badRoom = await fetch(`${baseUrl}/api/messages?room=nope`, {
    headers: { Cookie: jar.header() },
  });
  check(
    "GET /api/messages rejects unknown rooms",
    badRoom.status === 400,
    `got ${badRoom.status}`,
  );

  // 11b. Message edit/delete, scoped to the author.
  const messageId = postJson.message?.id;
  if (messageId) {
    const editMessage = await fetch(`${baseUrl}/api/messages/${messageId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: jar.header() },
      body: JSON.stringify({ body: "Smoke edited" }),
    });
    const editedJson = (await editMessage.json()) as {
      message?: { body: string; editedAt?: string | null };
    };
    check(
      "PATCH /api/messages/[id] edits the message",
      editMessage.status === 200 && editedJson.message?.body === "Smoke edited",
      `got ${editMessage.status}`,
    );
    check("Edited message records editedAt", Boolean(editedJson.message?.editedAt));

    const foreignEdit = await fetch(`${baseUrl}/api/messages/${messageId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: techJar.header() },
      body: JSON.stringify({ body: "hacked" }),
    });
    check(
      "Another user cannot edit the message (404)",
      foreignEdit.status === 404,
      `got ${foreignEdit.status}`,
    );

    const delMessage = await fetch(`${baseUrl}/api/messages/${messageId}`, {
      method: "DELETE",
      headers: { Cookie: jar.header() },
    });
    check(
      "DELETE /api/messages/[id] removes the message",
      delMessage.status === 200,
      `got ${delMessage.status}`,
    );
  }

  // 12. Two-factor authentication, exercised on a throwaway account so the
  // seeded demo user is never left with 2FA switched on.
  const tfaEmail = `tfa_${Date.now()}@quickset.com`;
  const tfaSignup = await fetch(`${baseUrl}/api/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "TFA Tester",
      email: tfaEmail,
      password: "password123",
    }),
  });
  check(
    "Signup for the 2FA test account",
    tfaSignup.status === 201,
    `got ${tfaSignup.status}`,
  );

  const tfaJar = new CookieJar();
  const tfaCsrfRes = await fetch(`${baseUrl}/api/auth/csrf`);
  tfaJar.store(tfaCsrfRes);
  const { csrfToken: tfaCsrf } = (await tfaCsrfRes.json()) as {
    csrfToken: string;
  };
  const tfaLogin = await fetch(`${baseUrl}/api/auth/callback/credentials`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Cookie: tfaJar.header(),
    },
    body: new URLSearchParams({
      csrfToken: tfaCsrf,
      email: tfaEmail,
      password: "password123",
      callbackUrl: `${baseUrl}/dashboard`,
      json: "true",
    }),
    redirect: "manual",
  });
  tfaJar.store(tfaLogin);
  check("2FA account signs in", tfaLogin.status === 200, `got ${tfaLogin.status}`);

  const statusBefore = await fetch(`${baseUrl}/api/account/2fa`, {
    headers: { Cookie: tfaJar.header() },
  });
  const beforeJson = (await statusBefore.json()) as { enabled?: boolean };
  check("2FA starts disabled", beforeJson.enabled === false);

  const wrongCheck = await fetch(`${baseUrl}/api/account/2fa/check`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: tfaEmail, password: "wrong-password" }),
  });
  check(
    "2FA check rejects a wrong password",
    ((await wrongCheck.json()) as { status?: string }).status === "invalid",
  );

  const beginRes = await fetch(`${baseUrl}/api/account/2fa`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: tfaJar.header() },
    body: JSON.stringify({ action: "begin" }),
  });
  const beginJson = (await beginRes.json()) as { secret?: string };
  const secret = beginJson.secret ?? "";
  check("2FA begin returns a secret", beginRes.status === 200 && !!secret);

  const enableRes = await fetch(`${baseUrl}/api/account/2fa`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: tfaJar.header() },
    body: JSON.stringify({ action: "enable", code: generateTotp(secret) }),
  });
  const enableJson = (await enableRes.json()) as { enabled?: boolean };
  check(
    "2FA enable accepts a valid code",
    enableRes.status === 200 && enableJson.enabled === true,
    JSON.stringify(enableJson),
  );

  const needCheck = await fetch(`${baseUrl}/api/account/2fa/check`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: tfaEmail, password: "password123" }),
  });
  check(
    "2FA check reports need_2fa once enabled",
    ((await needCheck.json()) as { status?: string }).status === "need_2fa",
  );

  // Password alone must no longer produce a session.
  const noCodeJar = new CookieJar();
  const noCodeCsrfRes = await fetch(`${baseUrl}/api/auth/csrf`);
  noCodeJar.store(noCodeCsrfRes);
  const { csrfToken: noCodeCsrf } = (await noCodeCsrfRes.json()) as {
    csrfToken: string;
  };
  const noCodeLogin = await fetch(`${baseUrl}/api/auth/callback/credentials`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Cookie: noCodeJar.header(),
    },
    body: new URLSearchParams({
      csrfToken: noCodeCsrf,
      email: tfaEmail,
      password: "password123",
      callbackUrl: `${baseUrl}/dashboard`,
      json: "true",
    }),
    redirect: "manual",
  });
  noCodeJar.store(noCodeLogin);
  const noCodeSession = await fetch(`${baseUrl}/api/auth/session`, {
    headers: { Cookie: noCodeJar.header() },
  });
  const noCodeJson = (await noCodeSession.json()) as { user?: unknown };
  check(
    "Login without a 2FA code is rejected",
    !noCodeJson?.user,
    JSON.stringify(noCodeJson),
  );

  // With the right code it succeeds.
  const codeJar = new CookieJar();
  const codeCsrfRes = await fetch(`${baseUrl}/api/auth/csrf`);
  codeJar.store(codeCsrfRes);
  const { csrfToken: codeCsrf } = (await codeCsrfRes.json()) as {
    csrfToken: string;
  };
  const codeLogin = await fetch(`${baseUrl}/api/auth/callback/credentials`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Cookie: codeJar.header(),
    },
    body: new URLSearchParams({
      csrfToken: codeCsrf,
      email: tfaEmail,
      password: "password123",
      code: generateTotp(secret),
      callbackUrl: `${baseUrl}/dashboard`,
      json: "true",
    }),
    redirect: "manual",
  });
  codeJar.store(codeLogin);
  const codeSession = await fetch(`${baseUrl}/api/auth/session`, {
    headers: { Cookie: codeJar.header() },
  });
  const codeJson = (await codeSession.json()) as { user?: { email?: string } };
  check(
    "Login with a valid 2FA code succeeds",
    codeJson?.user?.email === tfaEmail,
    JSON.stringify(codeJson),
  );

  const disableRes = await fetch(`${baseUrl}/api/account/2fa`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: tfaJar.header() },
    body: JSON.stringify({ action: "disable", code: generateTotp(secret) }),
  });
  const disableJson = (await disableRes.json()) as { enabled?: boolean };
  check(
    "2FA disable works",
    disableRes.status === 200 && disableJson.enabled === false,
    JSON.stringify(disableJson),
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
