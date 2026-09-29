# Resumly

A resume builder with live preview, 10 templates, job-specific ATS analysis,
AI polishing, resume versions, shareable links, and PDF/PNG/JPG export.

## Tech stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 ·
Supabase (Auth + Postgres) · ImageKit (photo upload) · Groq API (AI features) ·
Vitest + Playwright

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in the values below
npm run dev
```

In PowerShell, use `Copy-Item .env.example .env.local` for the copy step.
Open [http://localhost:3000](http://localhost:3000).

## Environment variables

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon (public) key |
| `NEXT_PUBLIC_SITE_URL` | Public site URL, e.g. `http://localhost:3000` |
| `NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT` | ImageKit URL endpoint |
| `IMAGEKIT_PUBLIC_KEY` | ImageKit public key (server) |
| `IMAGEKIT_PRIVATE_KEY` | ImageKit private key (server only) |
| `GROQ_API_KEY` | Groq API key for polish / ATS / job match / cover letter |
| `GROQ_MODEL` | Optional model override |

Never commit `.env.local`.

## Supabase setup

1. Create a Supabase project and copy the URL and anon key.
2. Create the `resumes` table (with a `user_id` column referencing `auth.users`)
   and apply the SQL migrations in `supabase/migrations/`. The Trash view requires
   the `deleted_at` column added by the included migration.
3. **Enable Row Level Security** on `resumes` and add owner-only policies
   (`auth.uid() = user_id`) for select / insert / update / delete.
4. Public share links are served by the `get_shared_resume(p_share_id)` RPC,
   so the table itself never needs a public read policy. Verify that the RPC
   returns only explicitly shared resumes and does not expose private user fields.
5. Add `http://localhost:3000/auth/callback` (and your production URL) to
   Auth → URL Configuration → Redirect URLs.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` / `npm start` | Production build / serve |
| `npm run lint` | ESLint |
| `npx tsc --noEmit` | Type check |
| `npm test` | Unit tests (Vitest) |
| `npm run test:e2e` | End-to-end tests (Playwright) |

## Auth flow

`src/proxy.ts` protects `/dashboard`, `/builder`, `/preview` and `/account`.
Logged-out users are sent to `/login?redirectTo=<page>` and returned there
after signing in. Shared resumes at `/r/<shareId>` are public.

## Deployment

Deploy on Vercel (or any Node host). Set all environment variables above in
the project settings and add the production URL to Supabase's redirect list.
CI (`.github/workflows/ci.yml`) runs lint, type check, tests and a production
build for pull requests and pushes to `main`.
