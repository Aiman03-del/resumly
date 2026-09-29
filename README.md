<div align="center">

# Resumly

**Build a professional, ATS-friendly resume in minutes, with live preview, AI polish, and one-click export.**

[Live Demo](https://myresumly.vercel.app/) · [GitHub](https://github.com/Aiman03-del/resumly) · [Report a Bug](https://github.com/Aiman03-del/resumly/issues)

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Auth_+_Postgres-3ECF8E?logo=supabase&logoColor=white)

![Resumly preview](public/Resumly.png)

</div>

---

## Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Supabase Setup](#supabase-setup)
- [Scripts](#scripts)
- [Project Structure](#project-structure)
- [Authentication Flow](#authentication-flow)
- [AI Features and Usage Limits](#ai-features-and-usage-limits)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)

---

## About

Resumly is a full-stack resume builder. You fill in your details step by step, watch the resume update live, pick a template, color and font, check how it scores against applicant tracking systems (ATS), and download it as a PDF, PNG or JPG. AI helpers can polish your writing, match your resume to a job description and draft a cover letter.

**Live site:** https://myresumly.vercel.app/

---

## Features

### Resume builder
- **Step-by-step editor** for Personal Info, Experience, Education, Skills, Projects, Certifications, Languages, Achievements, Awards & Honors, Publications, Courses / Training and Summary.
- **Live preview** beside the form on desktop, and a full-screen preview sheet on mobile.
- **Profile photo upload** with image preview (hosted on ImageKit).
- **Auto-save** to your account, with a visible *Saving / Saved / Not saved yet* status.

### Editor safety net
- **Undo / Redo** with buttons and keyboard shortcuts (`Ctrl/Cmd + Z`, `Ctrl/Cmd + Shift + Z`, `Ctrl + Y`).
- **Unsaved-changes warning** when you try to close or reload the tab with pending changes.
- **Draft recovery:** if a save fails (offline, expired session) or the tab closes mid-save, your changes are kept locally and you can restore or discard them on your next visit.
- Pending changes are flushed automatically when the tab is hidden or the connection returns.

### Design and layout
- **10 templates:** Modern, Creative, Classic, Minimal, Timeline, Compact, Bold, Elegant, Sidebar Pro and Tech.
- **Template picker** with a list on the left and a live preview on the right.
- **Color palette** with presets and a custom theme color.
- **Font picker** (Arial, Helvetica, Georgia, Times New Roman, Verdana, Trebuchet MS, Tahoma, Courier New).
- **Drag-and-drop section ordering**, from a list or directly in the preview. Sidebar templates reorder each column separately.

### Resume quality
- **Page length target:** Auto, 1 page or 2 pages.
- **Overflow detection:** a warning when the resume is longer than your target, plus dashed *"Page 2 starts here"* guides in the preview.
- **Font size control** from 80% to 120%, plus an **Auto-fit** button that lowers the font size until the resume fits your page target.
- **ATS-friendly indicator:** an instant layout check covering single vs. multi-column layouts, photo, text size, page count and contact details.
- The preview page shows a page-count and ATS status summary above the resume.

### AI tools
- **Polish with AI** to rewrite the summary, experience and project descriptions.
- **ATS check** for a score, a breakdown, strengths and prioritized suggestions.
- **Job match** to compare your resume against a job description.
- **Cover letter generator** based on your resume.
- **Project link import** to fill in project details from a link.

### Export and sharing
- **PDF export** with selectable text (ATS-friendly, real A4 pages) via the browser print engine, with an image-based fallback.
- **PNG and JPG export** at the same size and quality on every device.
- **Public share links** (`/r/<shareId>`) that you can turn on and off at any time.

### Dashboard
- Search, sort (recent, oldest, name, completion) and manage all your resumes.
- **Resume versions:** duplicate a resume to tailor it for different jobs.
- **Trash:** deleted resumes can be restored or deleted permanently.

### Also included
- Landing page with hero, template gallery, ATS section, before/after, FAQ and more.
- Features, Templates, Pricing and About pages.
- Light and dark mode, and a responsive layout from phones to desktops.
- Rate limiting and per-user daily quotas on all AI routes.

---

## Tech Stack

| Area | Technology |
| --- | --- |
| Framework | Next.js 16 (App Router), React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS 4, shadcn/ui, Base UI, tw-animate-css |
| Animation | Framer Motion |
| Forms and validation | React Hook Form, Zod |
| Backend and auth | Supabase (Auth + Postgres + Row Level Security) |
| Image hosting | ImageKit |
| AI | Groq API (via the OpenAI-compatible SDK) |
| Export | Browser print engine, html2canvas-pro, jsPDF |
| Notifications | Sonner |
| Testing | Vitest, Testing Library, Playwright |
| Hosting | Vercel |

---

## Getting Started

### Prerequisites

- Node.js 22 or newer
- A [Supabase](https://supabase.com) project
- An [ImageKit](https://imagekit.io) account (for profile photos)
- A [Groq](https://console.groq.com) API key (for the AI features)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Aiman03-del/resumly.git
cd resumly

# 2. Install dependencies
npm install

# 3. Create your environment file, then fill in the values
cp .env.example .env.local

# 4. Start the development server
npm run dev
```

On Windows PowerShell, use `Copy-Item .env.example .env.local` for step 3.

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

Create a `.env.local` file in the project root:

| Variable | Required | Description |
| --- | :---: | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon (public) key |
| `NEXT_PUBLIC_SITE_URL` | Yes | Public site URL, e.g. `http://localhost:3000` |
| `NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT` | Yes | ImageKit URL endpoint |
| `IMAGEKIT_PUBLIC_KEY` | Yes | ImageKit public key (server) |
| `IMAGEKIT_PRIVATE_KEY` | Yes | ImageKit private key (server only) |
| `GROQ_API_KEY` | Yes | Groq API key for polish, ATS, job match and cover letter |
| `GROQ_MODEL` | No | Optional Groq model override |

> Never commit `.env.local`, and never expose `IMAGEKIT_PRIVATE_KEY` or `GROQ_API_KEY` to the browser.

---

## Supabase Setup

1. **Create a project** in Supabase and copy the project URL and anon key into `.env.local`.
2. **Create the `resumes` table** with a `user_id` column referencing `auth.users`. Its columns include:
   `title`, `personal_info`, `summary`, `experience`, `education`, `skills`, `projects`, `certifications`, `languages`, `achievements`, `awards`, `publications`, `courses`, `template_id`, `accent_color`, `theme_color`, `section_order`, `status`, `is_public`, `share_id`, `created_at`, `updated_at` and `deleted_at`.
3. **Apply the SQL migrations** in `supabase/migrations/`. The Trash view needs the `deleted_at` column added by the included migration.
4. **Create the usage-quota objects** used by the AI routes: an `api_usage` table and an `increment_api_usage(p_route)` RPC that atomically increments a per-user, per-day counter. The AI routes fail closed (HTTP 503) if this RPC is missing.
5. **Enable Row Level Security** on `resumes` and add owner-only policies (`auth.uid() = user_id`) for select, insert, update and delete.
6. **Public share links** are served by the `get_shared_resume(p_share_id)` RPC, so the table itself never needs a public read policy. Verify that the RPC returns only explicitly shared resumes and does not expose private user fields.
7. **Configure redirect URLs** under Auth → URL Configuration: add `http://localhost:3000/auth/callback` and your production URL's `/auth/callback`.

> Note: Settings such as font, page target and font size are stored inside the `personal_info` JSON column, so they do not need extra database columns.

---

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm start` | Serve the production build |
| `npm run lint` | Run ESLint |
| `npx tsc --noEmit` | Type-check the project |
| `npm test` | Run unit tests (Vitest) |
| `npm run test:watch` | Run unit tests in watch mode |
| `npm run test:coverage` | Run unit tests with coverage |
| `npm run test:e2e` | Run end-to-end tests (Playwright) |

---

## Project Structure

```text
resumly/
├── e2e/                      # Playwright end-to-end tests
├── public/                   # Static assets
├── supabase/migrations/      # SQL migrations
└── src/
    ├── app/
    │   ├── (auth)/           # Login and signup
    │   ├── api/              # ats, polish, job-match, cover-letter, project-link, imagekit-auth
    │   ├── builder/          # New resume, editor, template picker
    │   ├── dashboard/        # Resume list, versions and trash
    │   ├── preview/          # Preview, export, ATS check, share
    │   ├── r/[shareId]/      # Public shared resume
    │   └── ...               # Landing, features, templates, pricing, about, account
    ├── components/
    │   ├── builder/          # Editor form and live preview
    │   ├── form-steps/       # One component per editor step
    │   ├── templates/        # The 10 resume templates
    │   ├── landing/          # Landing page sections
    │   ├── ui/               # Shared UI primitives
    │   └── ...               # Pickers, export menu, ATS check, page-quality tools
    ├── lib/                  # Draft storage, fonts, themes, page settings, print/PDF, rate limiting, Supabase clients
    ├── types/                # Resume types and Zod schemas
    └── proxy.ts              # Route protection
```

---

## Authentication Flow

`src/proxy.ts` protects `/dashboard`, `/builder`, `/preview` and `/account`. Logged-out users are redirected to `/login?redirectTo=<page>` and returned to that page after signing in. Shared resumes at `/r/<shareId>` are public.

---

## AI Features and Usage Limits

All AI routes run on the server, so your Groq key is never exposed to the browser. Each route is protected by:

- **Input validation** with Zod, including length limits and URL checks.
- **In-memory rate limiting** to absorb bursts.
- **Persistent per-user daily quotas** stored in Supabase, which survive cold starts and multiple server instances.

The ATS score is an AI estimate based on your resume content, not a scan by a real ATS. The instant *ATS-friendly* indicator in the template step is a separate layout check.

---

## Testing

```bash
npm test            # unit tests
npm run test:e2e    # end-to-end tests (Playwright)
```

Unit tests cover the resume types, draft storage, keyword matching, rate limiting, resume text and versions, API error handling and the polish route. Continuous integration (`.github/workflows/ci.yml`) runs lint, type check, tests and a production build on every pull request and every push to `main`.

---

## Deployment

Resumly is deployed on [Vercel](https://vercel.com):

1. Import the repository into Vercel.
2. Add all environment variables from the table above in the project settings.
3. Set `NEXT_PUBLIC_SITE_URL` to your production URL.
4. Add the production URL to Supabase's redirect list (Auth → URL Configuration).
5. Deploy.

Any Node.js host works as well: `npm run build` followed by `npm start`.

---

## Contributing

Contributions, issues and feature requests are welcome.

1. Fork the repository.
2. Create a branch: `git checkout -b feature/my-feature`
3. Make your changes, then run `npm run lint`, `npx tsc --noEmit` and `npm test`.
4. Commit and push: `git push origin feature/my-feature`
5. Open a pull request.

---

<div align="center">

Built by [Aiman](https://github.com/Aiman03-del) · [Live Demo](https://myresumly.vercel.app/)

</div>