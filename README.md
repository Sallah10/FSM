# QuickSet - Field Service Management

A full-stack field service management (FSM) dashboard for a small repair business: schedule jobs, assign technicians, track customers, generate invoices, and see jobs live on a map - all backed by a real local database.

Built with **Next.js 15 (App Router) · React 19 · TypeScript · Tailwind v4 · Drizzle ORM · SQLite · NextAuth**.

> This is a portfolio/demo project. All seeded customers, jobs, technicians and invoices are fictional, and money is shown in Nigerian Naira (₦).

---

## Features

- **Dashboard** with live totals - jobs, paid revenue, outstanding balance, active technicians.
- **Jobs** - create jobs against a customer, assign a technician, set a status, and mark jobs complete. Full CRUD over a REST API.
- **Customers & Technicians** - read/write customer records; technician directory.
- **Invoices** - invoice list and a printable invoice preview with line items.
- **Analytics** - revenue-over-time, job status split, and jobs-per-technician charts, all driven by real query results.
- **Map** - Leaflet map with clustered, colour-coded markers for jobs, technicians and customers, plus "locate me".
- **Dark mode**, responsive sidebar, and a mobile drawer.

## Tech stack

| Layer            | Choice                                                                  |
| ---------------- | ----------------------------------------------------------------------- |
| Framework        | Next.js 15 (App Router, Server Components, Route Handlers, Middleware)  |
| UI               | React 19, Tailwind CSS v4, shadcn/ui primitives, lucide-react, recharts |
| Maps             | Leaflet + react-leaflet + leaflet.markercluster                         |
| Auth             | NextAuth (JWT sessions) - credentials + optional Google                 |
| Database         | SQLite via `better-sqlite3`                                             |
| ORM / migrations | Drizzle ORM + Drizzle Kit                                               |
| Validation       | Zod                                                                     |
| Tests            | Vitest + Testing Library, plus an HTTP smoke script                     |

## Getting started

Requires **Node.js 20.9+** (developed on Node 24).

```bash
npm install

# 1. Create your env file and set NEXTAUTH_SECRET
cp .env.example .env.local
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"   # paste into NEXTAUTH_SECRET

# 2. Create the database and load the demo data
npm run db:setup

# 3. Run it
npm run dev
```

Open <http://localhost:3000>.

### Demo login

```
email:    demo@quickset.com
password: demo123
```

Or hit **Sign up** to create a real account (passwords are stored as salted scrypt hashes).

## Scripts

| Script                        | What it does                                     |
| ----------------------------- | ------------------------------------------------ |
| `npm run dev`                 | Start the dev server                             |
| `npm run build` / `npm start` | Production build / serve                         |
| `npm run lint`                | ESLint (next/core-web-vitals + TypeScript)       |
| `npm run typecheck`           | `tsc --noEmit`                                   |
| `npm test`                    | Vitest unit + integration tests                  |
| `npm run smoke`               | HTTP smoke test against a running server         |
| `npm run db:setup`            | Generate migrations and seed the SQLite database |
| `npm run db:studio`           | Open Drizzle Studio to browse the data           |

## API

All data endpoints require a signed-in session (`401` otherwise).

| Method          | Route                                | Purpose                         |
| --------------- | ------------------------------------ | ------------------------------- |
| `GET` / `POST`  | `/api/jobs`                          | List / create jobs              |
| `GET` / `PATCH` | `/api/jobs/:id`                      | Fetch a job / update its status |
| `GET` / `POST`  | `/api/customers`                     | List / create customers         |
| `GET`           | `/api/customers/:id`                 | Fetch one customer              |
| `GET`           | `/api/technicians`                   | List technicians                |
| `GET`           | `/api/invoices`, `/api/invoices/:id` | List / fetch invoices           |
| `GET`           | `/api/stats`                         | Aggregated dashboard metrics    |
| `POST`          | `/api/signup`                        | Register a new account          |

## Architecture

```
app/
  (dashboard)/        authenticated area (shared sidebar layout, force-dynamic)
  api/                route handlers (REST, Zod-validated, session-guarded)
  auth/               login + signup screens
lib/
  db/                 Drizzle schema, client, queries, seed
  auth/               password hashing + session helper
  authOptions.ts      NextAuth configuration
components/            UI, charts, map, forms
middleware.ts         protects every dashboard route
```

Reads happen in Server Components straight from SQLite; writes go through validated Route Handlers and revalidate the page. The map and charts are fed by the same query layer, so every screen reflects the database.

## Verification

- `npm run lint` - no warnings or errors
- `npm run typecheck` - clean
- `npm test` - 15 tests across 4 files
- `npm run smoke` - 17 HTTP checks (auth, CRUD, validation)
- Production build - 26 routes, 103 kB shared JS
- `npm audit --omit=dev` - **0 vulnerabilities** in production dependencies

## Known limitations

Being honest about scope:

- **SQLite is single-node.** Great for a demo; a production deployment would move to Postgres.
- **Roles are stored but not enforced.** Everything is effectively admin. No per-user data scoping yet.
- **No pagination or search server-side** - lists are small by design.
- **Coordinates aren't geocoded.** New records are placed near central Lagos so they appear on the map.
- Remaining `npm audit` advisories are **dev-only** (ESLint / Drizzle Kit toolchain) with no non-breaking fix.

## License

MIT
