# Spec 7 — Sprint History (The Journey)

| Sprint | Focus | Outcome |
|--------|-------|---------|
| 0 | Setup | Next.js + Postgres + Prisma + NextAuth scaffolded; Anthropic SDK wired. |
| 1 | Marketing landing v1 | Video-background hero + 4 marketing sections. Pretty, but signup-gated. |
| 2 | Auth + dashboard shell | Login/signup with shared `AuthShell`; middleware-protected `/chat`. |
| 3 | Assignment interpreter | `/api/analyze` returning structured JSON; assignment cards in chat. |
| 4 | Task planner / schedule | `TaskOccurrence` table for true multi-date scheduling; ICS export. |
| 5 | Conversational AI | Router prompt classifies every message into an action. Context-aware. |
| 6 | Progress tracking + polish | Progress card; markdown export; `ExpandSheet`. |
| **7** | **Landing redesign — chat-first** | **The current sprint, documented in this spec.** |

## What changed between Sprint 1 and Sprint 7

| Aspect | Sprint 1 | Sprint 7 |
|--------|----------|----------|
| Hero background | Looping video file | Animated mesh gradient (CSS + Framer Motion) |
| First action available | "Sign up" button | Talk to the AI immediately |
| Marketing sections | All on `/` below the hero | Moved to `/info`, accessed via nav |
| Scroll feel | Static blocks fading in as you fall past | Sections rising up into the viewport |
| Signup conversion path | Forced (gated CTA) | Earned (after the user sees value) |

## What stayed the same

- Auth flow (`/login`, `/signup`, `AuthShell`, middleware)
- The full authenticated app at `/chat`
- All API routes that read/write the database
- The Prisma schema
- The brand palette, fonts, and custom-cursor convention
