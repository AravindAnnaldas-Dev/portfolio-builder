# Portfolio Builder

A full-stack tool for building, previewing, and exporting a developer portfolio as a standalone static site. Live demo: `TODO — add deployed URL`.

![Dashboard screenshot](TODO)
![Editor screenshot](TODO)

## Stack

- **Client:** Next.js 14 (App Router) + TypeScript + Tailwind CSS + React Query
- **Server:** Node.js + Express + TypeScript + Prisma ORM 7 (via `@prisma/adapter-pg`) + PostgreSQL
- **Export:** `archiver` (server-side ZIP streaming), `html2canvas` + `jsPDF` (client-side PDF)

## Setup

### 1. Database

Create a local Postgres database (or use a hosted one, e.g. Supabase/Neon/Railway).

### 2. Server

```bash
cd server
cp .env.example .env    # fill in DATABASE_URL and JWT_SECRET
npm install
npm run prisma:migrate  # creates tables
npm run seed             # creates demo@example.com / password123
npm run dev               # http://localhost:4000
```

### 3. Client

```bash
cd client
cp .env.local.example .env.local
npm install
npm run dev                # http://localhost:3000
```

Log in with `demo@example.com` / `password123`, or register a new account.

## Data model

```text
User
  id, email, password (bcrypt hash), name, timestamps
  → has many Portfolio

Portfolio
  id, userId, title, slug, template, content (Json), timestamps
```

`content` holds the entire section tree (hero, about, skills, projects, experience, education,
certifications, languages, interests, section order, hidden sections) as one JSON blob rather than
a table per section. A portfolio's shape is inherently variable — zero or many projects, optional sections,
variable-length tech-stack arrays — and the data is always read/written as a whole (the editor
loads and autosaves the entire tree at once), so there's no query pattern that benefits from
normalizing it into separate tables. The tradeoff: no DB-level FK/uniqueness constraints inside
the JSON, and no cheap cross-portfolio queries into nested fields — both fine here since a Zod
schema validates the shape on every write.

Every `Portfolio` row is scoped to a `userId`. Every read/update/delete/export route loads the row
and checks `portfolio.userId === req.userId` before doing anything else — this prevents an IDOR
(Insecure Direct Object Reference), where a valid but unauthenticated-for-that-resource token could
otherwise read or modify another user's data just by guessing/passing their portfolio id.

## Template + export architecture

One shared `PortfolioContent` shape (defined once, validated with Zod on the server and mirrored
as a TypeScript type on the client) feeds three consumers identically:

1. **The live preview** — rendered client-side into an `<iframe srcDoc>` so the portfolio's own
   styling never leaks into (or is affected by) the builder UI's dark/light theme.
2. **Any of the four templates** — `minimal-dev`, `creative-grid`, `single-page-scroll`,
   `sidebar-profile` — each is a CSS/layout shell around the *same* section-rendering functions,
   so switching templates re-renders identical content with zero data loss, and adding a fifth
   template never requires touching how a project/skill/certification becomes markup.
3. **The exported static bundle** — the server-side export route (`GET /api/portfolios/:id/export`)
   loads the portfolio's JSON, renders it through the matching template function into one
   self-contained HTML string (CSS inlined, no external font/CDN/JS dependency), and streams it
   back as a ZIP via `archiver`. Because nothing in that HTML calls back to this app's API, the
   exported site has zero dependency on the backend — the user can drop it on Netlify, Vercel, or
   GitHub Pages and it just works, forever, even if this project disappears.

Server-side generation was chosen over generating the bundle purely client-side because it
guarantees the exported HTML is byte-identical to the template definitions in one place, without
shipping a second templating/zipping pipeline to the browser bundle. The tradeoff is that adding a
template requires a backend change + redeploy, rather than being purely a frontend iteration.

## Auth

Passwords are hashed with bcrypt before storage. Login compares the submitted password against
the stored hash and issues a JWT containing only the user id, expiring in 7 days. Protected routes
verify the token from the `Authorization: Bearer <token>` header and reject missing/invalid/expired
tokens with `401`. This is stateless — no session table — at the cost of not being able to revoke a
token before it expires.

## Autosave

The editor debounces autosave: edits update local state immediately (so the preview is instant),
but the `PUT /api/portfolios/:id` request only fires 1.2s after the user stops changing anything.
That coalesces an entire typing burst into one write instead of one write per keystroke, keeping
the API load proportional to "edits per session" rather than "keystrokes per session."

## Scope notes

- Section and item reordering both use real drag-and-drop (`@dnd-kit/core` + `@dnd-kit/sortable`),
  with keyboard support via `KeyboardSensor` alongside `PointerSensor` for accessibility.
- PDF export rasterizes the preview iframe's rendered DOM (`html2canvas`) into a PDF (`jsPDF`) —
  it's a "leave-behind" snapshot, not a second templating pipeline.

## Possible next steps

- Custom domain / slug-based public hosting of a portfolio directly from this app
- Image upload (currently URL-only) via S3/Cloudinary
