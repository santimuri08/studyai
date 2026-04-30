# StudyAI

> An AI-powered academic productivity platform that helps college students
> understand assignments, plan their week, and get unstuck — powered by Claude.

**🔗 Live site:** [REPLACE THIS WITH YOUR HOSTED URL]

**📁 Specs:** see [`specs/`](./specs) for the full Spec-Driven Development
documentation behind this project.

---

## What it does

StudyAI is **chat-first**. You land on the homepage, and you're already
talking to it — no signup gate, no marketing wall.

- **Try as a guest.** Type a question on the homepage, get a real Claude
  reply. Your conversation lives in your browser.
- **Sign up to save.** Create an account to unlock assignment-saving,
  multi-date scheduling, progress tracking, and calendar export.
- **Paste an assignment, get a plan.** StudyAI reads the assignment,
  pulls out requirements, breaks it into tasks with time estimates, and
  detects the deadline.
- **Schedule across the week.** "Schedule the portfolio for Tuesday and
  Friday" — it understands and writes the schedule.
- **Track your progress.** Streak, hours studied, completion rate.
- **Export.** Markdown for assignments, ICS for the calendar.

---

## Quick start

```bash
# 1. Install
npm install

# 2. Configure
cp .env.example .env.local
# then edit .env.local and set:
#   DATABASE_URL=postgres://...
#   NEXTAUTH_SECRET=...           (generate with: openssl rand -base64 32)
#   NEXTAUTH_URL=http://localhost:3000
#   ANTHROPIC_API_KEY=sk-ant-...

# 3. Migrate
npx prisma migrate deploy

# 4. Run
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 (App Router) |
| UI | React 19 · TypeScript |
| Styling | Tailwind v4 + global CSS tokens |
| Animation | Framer Motion |
| Auth | NextAuth v5 (credentials provider) + bcryptjs |
| ORM | Prisma 6 |
| Database | Postgres |
| AI | Anthropic Claude (`claude-sonnet-4-5-20250929`) via `@anthropic-ai/sdk` |
| Hosting | Vercel |

---

## Routes

| Route | Auth | Purpose |
|-------|------|---------|
| `/` | public | Chat-first hero — talk to the AI as a guest |
| `/info` | public | "How it works" — sections rise into view as you scroll |
| `/login` | public | Sign in |
| `/signup` | public | Create an account |
| `/chat` | required | Redirects to your latest chat (or creates one) |
| `/chat/[id]` | required | A specific saved conversation |
| `/api/chat/guest` | none | Stateless Claude reply for landing-page guests |
| `/api/chat` | required | Routed, context-aware Claude with full DB access |
| `/api/analyze` | required | Structured assignment breakdown (JSON) |
| `/api/signup` | none | Creates an account |
| `/api/chats/[id]` | required | Read / rename / delete a chat |
| `/api/tasks/[id]/toggle` | required | Mark a task complete/incomplete |

---

## How the chat works

The authenticated `/api/chat` endpoint is **routed**: every user message
goes through Claude once first to classify it into an action, and only
then is the action executed. The router can return any of:

- `list_assignments` · `show_schedule` · `show_progress`
- `analyze_paste` (turns pasted assignment text into a structured assignment row + tasks)
- `delete` / `restore` / `complete` (with soft-delete for undo)
- `schedule_or_deadline` (multi-date scheduling via the `TaskOccurrence` table)
- `answer` (default — natural language reply, optionally with the user's real assignments + tasks injected as context)

The guest endpoint at `/api/chat/guest` is much simpler: stateless,
no DB, just forwards the last 16 messages to Claude with a guest-mode
system prompt and returns the reply.

---

## Project structure

```
app/
├── page.tsx                 ← Chat-first landing (TopNav + Hero)
├── info/page.tsx            ← "How it works" page
├── login/, signup/          ← Auth pages
├── chat/                    ← Authenticated app
│   ├── layout.tsx           (ChatShell sidebar)
│   ├── page.tsx             (redirects to latest chat)
│   └── [id]/page.tsx        (single chat view)
└── api/
    ├── chat/route.ts        (authed, full DB)
    ├── chat/guest/route.ts  (stateless, no DB)
    ├── analyze/route.ts
    ├── signup/route.ts
    └── chats/[id]/...

components/
├── landing/
│   ├── Hero.tsx             ← Hosts the guest chat
│   ├── GuestChat.tsx        ← localStorage-backed
│   ├── SectionRise.tsx      ← Scroll-driven rise animation
│   ├── InfoIntro.tsx        ← Top of /info
│   ├── TopNav.tsx
│   ├── PainSection.tsx
│   ├── ProblemSection.tsx
│   ├── FeaturesSection.tsx
│   └── AISection.tsx
├── chat/                    ← Sidebar, ChatView, cards, ExpandSheet
├── HeroTransition.tsx
├── NeuralBackground.tsx
└── GlobalBackground.tsx     ← Custom cursor + glow trail

lib/
├── auth.ts                  ← NextAuth config
├── prisma.ts
├── userData.ts              ← Domain helpers (assignments, tasks, schedule)
├── dates.ts                 ← Natural-language date parsing
└── download.ts              ← Markdown / ICS file generation

prisma/
├── schema.prisma
└── migrations/

specs/                       ← Spec-Driven Development documentation
├── README.md
├── 01-constitution.md
├── 02-project-description.md
├── ...
└── 10-out-of-scope.md
```

---

## Data model

```
User ──┬── Chat ──── Message
       ├── Assignment ──── Task ──── TaskOccurrence
       └── Account / Session  (NextAuth)
```

- **Assignment** — a piece of academic work, with summary, deadline,
  estimated hours, key requirements.
- **Task** — a unit inside an assignment, with a time estimate. Soft-deletable.
- **TaskOccurrence** — a (task, date) pair. Lets a single task be
  scheduled on multiple days.
- **Chat / Message** — conversation history. Messages can carry a
  `cardType` and `cardData` to render rich cards (schedule, assignment,
  progress, undo) inline.

---

## Spec-Driven Development

This project is built using **SDD**: the spec is written first, and
implementation follows from it. The full spec lives in [`specs/`](./specs)
and is split into 10 numbered files:

1. **Constitution** — non-negotiable principles
2. **Project Description**
3. **Functional Requirements** (with stable IDs like GE-01, IP-03)
4. **Non-Functional Requirements**
5. **Technical Plan**
6. **Task Breakdown**
7. **Sprint History**
8. **Why SDD?** — before/after on this same project
9. **Verification Checklist**
10. **Out of Scope**

Inspired by [GitHub Spec Kit](https://github.com/github/spec-kit) and
the [scrollytelling spec-driven](https://github.com/kaw393939/scrollytelling_spec_driven)
process.

The short version of why: AI agents work much better when you write
the contract first and let them implement against it, rather than
prompting iteratively and hoping they end up at the right place.

---

## Environment variables

```bash
# Required
DATABASE_URL=postgres://user:pass@host:5432/dbname
NEXTAUTH_SECRET=          # openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000
ANTHROPIC_API_KEY=sk-ant-...

# Optional (Vercel sets this automatically)
VERCEL_URL=
```

---

## Scripts

| Command | What it does |
|---------|--------------|
| `npm run dev` | Start the local dev server on port 3000 |
| `npm run build` | Production build |
| `npm start` | Run the production build |
| `npm run lint` | ESLint |
| `npx prisma studio` | Open the Prisma data browser |
| `npx prisma migrate dev` | Create and apply a new migration |
| `npx prisma migrate deploy` | Apply migrations in production |

---

## Deployment

The recommended host is **Vercel**.

1. Push the repo to GitHub.
2. Import the repo into Vercel.
3. Add the environment variables (`DATABASE_URL`, `NEXTAUTH_SECRET`,
   `NEXTAUTH_URL`, `ANTHROPIC_API_KEY`) in the project settings.
4. The first deploy will run `prisma migrate deploy` automatically if
   you've wired the build command to do so.

After the site is live, **paste the URL at the top of this README**
where it says `[REPLACE THIS WITH YOUR HOSTED URL]`.

---

## Credits

- Built by Santiago Murillo for SP26-IT265002 Game Architecture and Design.
- AI provided by [Anthropic Claude](https://www.anthropic.com/claude).
- Spec-driven workflow inspired by Keith Williams's
  [scrollytelling_spec_driven](https://github.com/kaw393939/scrollytelling_spec_driven).