# Tick Marketing SaaS (Fullstack Starter)

A production-oriented starter for a **multi-tenant Marketing SaaS** with:
- Email/password login (session cookie)
- Multi-workspace (tenant) support
- Role-based access control (SUPER_ADMIN, CLIENT_ADMIN, AGENT, VIEWER)
- Module entitlements per workspace (enable/disable the 10 marketing modules)
- Admin panel to create workspaces, users, and assign modules
- Clean Tailwind UI (consistent shell across modules)

## Tech
- Next.js 14 (App Router) + TypeScript
- Prisma ORM
- PostgreSQL
- Tailwind CSS
- Zod for validation
- bcryptjs for password hashing

---

## 1) Local Setup

### Prerequisites
- Node.js 18+ (recommended 20+)
- Docker (optional, for local Postgres)

### Start Postgres (Docker)
```bash
docker compose up -d
```

### Install + migrate + seed
```bash
npm install
npm run db:migrate
npm run db:seed
```

### Run dev
```bash
npm run dev
```

Open: http://localhost:3000

---

## 2) Default Admin Credentials (Seed)
- Email: **admin@local**
- Password: **Admin@12345**

Change password after first login.

---

## 3) Environment Variables

Create a `.env` file in the repo root:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/tick_marketing_saas?schema=public"
SESSION_SECRET="change_me_to_a_long_random_string"
APP_URL="http://localhost:3000"
```

---

## 4) Make It Live (Recommended)
### Option A — Vercel + Neon/Supabase Postgres
1) Create a Postgres DB (Neon or Supabase)
2) Set Vercel env vars: `DATABASE_URL`, `SESSION_SECRET`, `APP_URL`
3) Deploy from GitHub (Vercel Import Project)
4) Run migrations:
   - Either from your local machine:
     ```bash
     DATABASE_URL="..." npm run db:migrate
     DATABASE_URL="..." npm run db:seed
     ```
   - Or add a Vercel build step to run Prisma migrate (not recommended for all teams).

### Option B — Render (Web Service) + Render Postgres
- Add `render.yaml` yourself or deploy manually.
- Run `npm run db:migrate` then `npm run db:seed` once.

---

## 5) Modules (10)
The starter includes these module keys (you can rename):
- ads, crm, whatsapp, retention, profit, ugc, affiliate, seo, reputation, connectors

Module access is controlled per workspace in Admin → Workspaces → Modules.

---

## 6) Folder Map
- `app/` Next.js routes (UI + API route handlers)
- `lib/` auth, RBAC, helpers
- `prisma/` schema + seed

---

## 7) Security Notes
- This is a **starter**. Before production:
  - Add email verification / reset password
  - Add audit logging
  - Configure rate limiting
  - Use HTTPS-only cookies in production (already enabled by NODE_ENV check)

