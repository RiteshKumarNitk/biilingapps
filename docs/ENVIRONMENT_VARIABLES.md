# Environment Variables

All variables live in `.env` (gitignored — never commit real values). A
template with empty values is at `.env.example`.

| Variable | Required | Used by | Notes |
|---|---|---|---|
| `DATABASE_URL` | Yes | `lib/prisma.ts`, `prisma.config.ts` | PostgreSQL connection string. Include `sslmode=require` for Neon. |
| `JWT_SECRET` | Yes | `lib/jwt.ts` | Signs access tokens. **The app throws on startup if this is unset.** Must be a long random string in any real environment — `lib/jwt.ts` no longer falls back to a default, but it also doesn't reject a *weak* value, so don't reuse the placeholder from `.env.example`. |
| `JWT_REFRESH_SECRET` | Yes | `lib/jwt.ts` | Signs refresh tokens (the one actually used for session checks via `requireAuth()`). Same rules as `JWT_SECRET` — use a different, equally strong value. |
| `NEXT_PUBLIC_API_URL` | Yes | `lib/api-client.ts` | Base URL for the mostly-unused client-side API wrapper used by the login page. Defaults to `http://localhost:3000/api` if unset in dev; set explicitly in production. |
| `CLOUDINARY_CLOUD_NAME` | Yes (for uploads) | `app/api/upload/route.ts` | Cloudinary account name. |
| `CLOUDINARY_API_KEY` | Yes (for uploads) | `app/api/upload/route.ts` | |
| `CLOUDINARY_API_SECRET` | Yes (for uploads) | `app/api/upload/route.ts` | Keep secret — grants upload/delete access to the Cloudinary account. |

## Generating strong secrets

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Run this twice to get two distinct values for `JWT_SECRET` and
`JWT_REFRESH_SECRET`. Rotating either one invalidates all existing
sessions (users will need to log in again).

## Local development

```bash
cp .env.example .env
# fill in DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET, Cloudinary keys
npx prisma generate
npx prisma db push
npm run dev
```

## What's NOT configurable via env vars (yet)

- Rate limiting — none exists; there's no `UPSTASH_*` or similar wired in.
- Any feature flags — none exist.
- Multi-region/CDN settings — left to the hosting platform's defaults.
