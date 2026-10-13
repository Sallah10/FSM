# QuickSet - Field Service Management

A full-stack field service management (FSM) dashboard for a small repair business: schedule jobs, assign technicians, track customers, generate invoices, and see jobs live on a map - all backed by a real database.

Built with **Next.js 15 (App Router) · React 19 · TypeScript · Tailwind v4 · Drizzle ORM · PostgreSQL · NextAuth**.

> This is a portfolio/demo project. All seeded customers, jobs, technicians and invoices are fictional, and money is shown in Nigerian Naira (₦).

---

## Features

- **Dashboard** with live totals - open jobs, completed jobs, paid revenue, outstanding balance - plus recent jobs and a follow-up list.
- **Jobs** - create jobs against a customer, assign a technician, set priority and status, edit, and delete. Full CRUD over a REST API.
- **Job activity trail** - every status change and assignment is logged against the job.
- **Customers & Technicians** - full CRUD, with detail pages listing each customer's jobs/invoices and each technician's assigned work.
- **Invoices** - line-item invoices with a printable preview, inline status changes, and full CRUD.
- **Analytics** - revenue by month, jobs by status, and jobs-per-technician charts, all driven by real query results.
- **Service map** - Leaflet map with clustered, colour-coded markers for jobs, technicians and customers, plus layer toggles, search and "locate me".
- **Teams & roles** - every sign-up creates its own organization and becomes its admin. Admins invite teammates by email (a copyable link) as **dispatcher** or **technician**, change roles, and remove members. All data is scoped to the organization.
- **Settings** - account profile, appearance (light / dark / system), a security panel, and a working **Organization** tab for members, roles and invites. Two-factor settings are scaffolded for the roadmap.
- **UI** - a consistent, data-dense design system with light/dark mode, a responsive sidebar and a mobile drawer, plus toast feedback on every write. Loading skeletons on every route, a friendly 404 with an auto-redirect countdown, show/hide password fields, and a confirm step before signing out.

## Tech stack

| Layer            | Choice                                                                  |
| ---------------- | ----------------------------------------------------------------------- |
| Framework        | Next.js 15 (App Router, Server Components, Route Handlers, Middleware)  |
| UI               | React 19, Tailwind CSS v4, shadcn/ui primitives, lucide-react, recharts |
| Forms            | react-hook-form + Zod resolvers                                         |
| Maps             | Leaflet + react-leaflet + leaflet.markercluster                         |
| Auth             | NextAuth (JWT sessions) - credentials + optional Google                 |
| Database         | PostgreSQL - **Neon** in production, embedded **PGlite** locally        |
| ORM / migrations | Drizzle ORM + Drizzle Kit                                               |
| Validation       | Zod                                                                     |
| Tests            | Vitest + Testing Library, plus an HTTP smoke script                     |

### How the database is wired

The same Drizzle schema and query layer run against two drivers, chosen at runtime by `lib/db/index.ts`:

- **Production / Vercel** - if `DATABASE_URL` is set, it connects to Neon over HTTP (`@neondatabase/serverless` + `drizzle-orm/neon-http`).
- **Local / dev / tests** - with no `DATABASE_URL`, it boots an embedded Postgres (PGlite, `@electric-sql/pglite`) into `./.pgdata`, so there is nothing to install.

The connection is opened lazily on first query, so importing route modules during `next build` never boots a database.

## Getting started

Requires **Node.js 20.9+** (developed on Node 24).

```bash
npm install

# 1. Create your env file and set NEXTAUTH_SECRET
cp .env.example .env.local
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"   # paste into NEXTAUTH_SECRET

# 2. Create the database and load the demo data (embedded PGlite by default)
npm run db:setup

# 3. Run it
npm run dev
```

Open <http://localhost:3000>.

To point at a hosted Postgres (e.g. Neon) instead, set `DATABASE_URL` in `.env.local` and run `npm run db:migrate` then `npm run db:seed`. The DB scripts load `.env.local` automatically, so they hit the same database the app runs against - `DATABASE_URL` set means Neon, blank means the embedded PGlite.

### Demo login

```
email:    demo@quickset.com      (admin)
password: demo123
```

The demo organization also seeds a teammate per role - `dispatcher@quickset.com` and `technician@quickset.com`, both with the password `demo123` - so you can see how access differs.

Or hit **Sign up** to create a real account and your own fresh organization (passwords are stored as salted scrypt hashes).

## Scripts

| Script                        | What it does                                          |
| ----------------------------- | ----------------------------------------------------- |
| `npm run dev`                 | Start the dev server                                  |
| `npm run build` / `npm start` | Production build / serve                              |
| `npm run lint`                | ESLint (next/core-web-vitals + TypeScript)            |
| `npm run typecheck`           | `tsc --noEmit`                                        |
| `npm test`                    | Vitest unit + integration tests                       |
| `npm run smoke`               | HTTP smoke test against a running server              |
| `npm run db:generate`         | Generate a Drizzle migration from the schema          |
| `npm run db:migrate`          | Apply migrations to the configured database           |
| `npm run db:seed`             | Reset and load the demo data                          |
| `npm run db:setup`            | Generate migrations, then seed                        |
| `npm run db:studio`           | Open Drizzle Studio to browse the data                |

## Deployment (Vercel + Neon)

1. Create a Neon Postgres database and copy its connection string.
2. Import the repo into Vercel and set `DATABASE_URL` (and `NEXTAUTH_SECRET`, plus `NEXTAUTH_URL` for a custom domain).
3. Run the migrations and seed once against Neon: `DATABASE_URL=... npm run db:migrate` (seeding is optional).
4. Deploy. Server Components and Route Handlers connect to Neon over HTTP; the map and charts are client-rendered.

## API

All data endpoints require a signed-in session (`401` when signed out) and are scoped to the caller's organization. Write endpoints also enforce roles (`403` for a role that is not allowed).

| Method                       | Route                                | Purpose                                      |
| ---------------------------- | ------------------------------------ | -------------------------------------------- |
| `GET` / `POST`               | `/api/jobs`                          | List / create jobs                           |
| `GET` / `PATCH` / `DELETE`   | `/api/jobs/:id`                      | Fetch / update / delete a job                |
| `GET` / `POST`               | `/api/customers`                     | List / create customers                      |
| `GET` / `PATCH` / `DELETE`   | `/api/customers/:id`                 | Fetch / update / delete a customer           |
| `GET` / `POST`               | `/api/technicians`                   | List / create technicians (writes: admin)    |
| `GET` / `PATCH` / `DELETE`   | `/api/technicians/:id`               | Fetch / update / delete a technician         |
| `GET` / `POST`               | `/api/invoices`                      | List / create invoices                       |
| `GET` / `PATCH` / `DELETE`   | `/api/invoices/:id`                  | Fetch / update status / delete an invoice    |
| `GET`                        | `/api/stats`                         | Aggregated dashboard metrics                 |
| `GET` / `PATCH`              | `/api/org`                           | Organization + members + invites / rename    |
| `PATCH` / `DELETE`           | `/api/org/members/:id`               | Change a member's role / remove a member     |
| `GET` / `POST`               | `/api/org/invites`                   | List / create invites (admin)                |
| `DELETE`                     | `/api/org/invites/:id`               | Revoke an invite (admin)                     |
| `GET` / `POST`               | `/api/invite/:token`                 | Public: view / accept an invite              |
| `POST`                       | `/api/signup`                        | Register a new account + organization        |

## Architecture

```
app/
  (dashboard)/        authenticated area (shared app shell, force-dynamic)
  api/                route handlers (REST, Zod-validated, session + role-guarded)
  auth/               login + signup screens
  invite/[token]/     public invite-acceptance page
lib/
  db/                 Drizzle schema, driver selection, queries, migrate, seed
  auth/               password hashing + session/role helpers
  authOptions.ts      NextAuth configuration
components/
  layout/             app shell, page header, dialogs
  forms/              react-hook-form forms + field primitives
  settings/           appearance + organization settings
  invite/             invite-acceptance form
  charts/             recharts wrappers
  ui/                 design-system primitives
middleware.ts         protects every dashboard route
```

Reads happen in Server Components straight from Postgres, scoped to the session's organization; writes go through validated Route Handlers that enforce the caller's role and refresh the page. The map and charts are fed by the same query layer, so every screen reflects the database.

## Verification

- `npm run lint` - no warnings or errors
- `npm run typecheck` - clean
- `npm test` - 16 tests across 4 files
- `npm run smoke` - 37 HTTP checks (auth, page rendering, CRUD, validation, org invites, role enforcement)
- Production build - 40 routes, 103 kB shared JS
- `npm audit --omit=dev` - **0 vulnerabilities** in production dependencies
