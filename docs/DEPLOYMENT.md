# Deployment Guide

## Prerequisites

- A PostgreSQL database (the project currently uses [Neon](https://neon.tech)).
- A Cloudinary account (for logo/avatar/signature uploads).
- Node.js 20+ (matches `@types/node: ^20`).

## Recommended target: Vercel

The app is a standard Next.js 16 App Router project with no custom server,
Dockerfile, or `vercel.json` — Vercel's zero-config Next.js deployment
works out of the box.

1. Push the repo to GitHub (already the case).
2. Import the repo in Vercel.
3. Set the environment variables listed in
   [`ENVIRONMENT_VARIABLES.md`](./ENVIRONMENT_VARIABLES.md) in the Vercel
   project settings (Production and Preview).
4. Build command: `next build` (default). Output: `.next` (default).
5. Deploy.

## Database setup on a fresh environment

```bash
npm install
npx prisma generate     # generate the Prisma Client
npx prisma db push      # create all tables/indexes from schema.prisma
npx tsx prisma/seed.ts  # optional: minimal demo data
```

There is no `prisma migrate` history — `db push` is the only supported
way to sync schema changes to a database in this project today. If you
later adopt `prisma migrate` for a team workflow, generate a fresh
baseline migration from the current schema first.

## Pre-deploy checklist

- [ ] `JWT_SECRET` and `JWT_REFRESH_SECRET` are long, random, and **not**
      the placeholder values from `.env.example`. The app will throw on
      startup if either is unset, but it will not stop you from using a
      weak value — verify manually.
- [ ] `DATABASE_URL` points at the production database, includes
      `sslmode=require` (Neon does by default).
- [ ] Cloudinary credentials are set (avatar/logo/signature upload will
      500 without them).
- [ ] Run `npm run build` locally once before deploying to catch any
      type or lint errors (`next build` runs the TypeScript check as part
      of the production build).
- [ ] Confirm `middleware/auth.ts` limitations are acceptable for your
      launch (see docs/ARCHITECTURE.md) — it does not currently provide
      real edge-level route protection; access control relies on
      `requireAuth()` inside each page/action.
- [ ] No automated tests exist — manually smoke-test login, invoice
      creation, and payment recording against the deployed environment
      before pointing real users at it.

## Ongoing operations

- **Backups**: Neon provides point-in-time recovery on paid plans; there
  is no application-level backup/export feature (`Utilities > Backup` in
  the dashboard is currently a placeholder page). Rely on the database
  host's backup/PITR settings.
- **Logs**: the app only uses `console.error`/`console.log`; on Vercel
  these land in the platform's function logs. There is no external error
  tracking (Sentry, etc.) configured — consider adding one before scaling
  past a handful of users.
- **Scaling data volume**: several list pages fetch up to 100–2000 rows
  in a single query rather than paginating (see docs/ARCHITECTURE.md).
  This is fine at small-business scale but will need real pagination if
  a tenant accumulates thousands of records.
