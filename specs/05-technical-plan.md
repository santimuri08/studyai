# Spec 5 — Technical Plan

## 5.1 Stack (Unchanged from Prior Sprints)

- Next.js 16 (App Router) · React 19 · TypeScript
- Tailwind v4 + global CSS tokens
- Framer Motion for animation
- NextAuth v5 (credentials) + Prisma adapter + bcryptjs
- Postgres + Prisma 6
- `@anthropic-ai/sdk`, model `claude-sonnet-4-5-20250929`
- Deployed on Vercel

## 5.2 Architecture

```
app/
├── page.tsx               ← TopNav + Hero (chat-first)
├── info/
│   └── page.tsx           ← TopNav + InfoIntro + 4 rising sections
├── login/, signup/        ← unchanged
├── chat/                  ← unchanged (auth-gated)
└── api/
    ├── chat/route.ts          ← authed, full DB access (unchanged)
    ├── chat/guest/route.ts    ← NEW: stateless, no DB, calls Claude
    ├── analyze/route.ts       ← unchanged
    └── ...

components/
├── landing/
│   ├── Hero.tsx           ← rewritten: no video, hosts GuestChat
│   ├── GuestChat.tsx      ← NEW: localStorage-backed guest chat
│   ├── SectionRise.tsx    ← NEW: scroll-driven rise animation
│   ├── InfoIntro.tsx      ← NEW: top of /info
│   ├── TopNav.tsx         ← updated: adds "Info" link
│   ├── PainSection.tsx    ← unchanged
│   ├── ProblemSection.tsx ← unchanged
│   ├── FeaturesSection.tsx← unchanged
│   └── AISection.tsx      ← unchanged
└── HeroTransition.tsx     ← retuned for non-video hero, used on /info
```

## 5.3 AI Integration Points

| Endpoint | Auth | DB | Purpose |
|----------|------|----|---------|
| `POST /api/chat/guest` | none | none | Stateless Claude reply for landing-page visitors. Accepts last 16 messages, returns `{ reply: string }`. |
| `POST /api/chat` | required | full | Routed, context-aware Claude with the user's assignments + tasks. |
| `POST /api/analyze` | required | writes | Structured assignment JSON output. |
| `POST /api/signup` | none | writes | Account creation. |

## 5.4 Data Model Deltas

None. The redesign adds a new API route and new components but does not
touch the Prisma schema. Guest chats live in `localStorage`, not in the
database.

## 5.5 State Boundaries

| Surface | State location | Lifetime |
|---------|----------------|----------|
| Guest chat messages | `localStorage` (browser) | Until user clears or site origin is wiped |
| Guest chat "active" mode | React state (`Hero` component) | Per page load — re-derived from localStorage on mount |
| Authenticated chat | Postgres via Prisma | Persistent, scoped to userId |
| Auth session | JWT cookie via NextAuth | Per session |
