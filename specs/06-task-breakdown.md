# Spec 6 — Task Breakdown (This Sprint)

This is sprint 7 — the chat-first landing redesign. Each task is scoped
to a specific file (or small set of files) so the AI can pick up any one
task without needing to touch others.

| # | Task | Files | Status |
|---|------|-------|--------|
| 1 | Write the spec (this folder) | `specs/01..10*.md` | ✓ |
| 2 | Build the stateless guest API | `app/api/chat/guest/route.ts` | ✓ |
| 3 | Build the guest chat component with `localStorage` persistence | `components/landing/GuestChat.tsx` | ✓ |
| 4 | Rewrite Hero — no video, host guest chat, fade title on activation | `components/landing/Hero.tsx` | ✓ |
| 5 | Build the scroll-rise wrapper | `components/landing/SectionRise.tsx` | ✓ |
| 6 | Build the info-page intro section | `components/landing/InfoIntro.tsx` | ✓ |
| 7 | Build `/info` page wiring all four marketing sections in `SectionRise` | `app/info/page.tsx` | ✓ |
| 8 | Add "Info" link + active highlight to TopNav | `components/landing/TopNav.tsx` | ✓ |
| 9 | Slim homepage to TopNav + Hero only | `app/page.tsx` | ✓ |
| 10 | Retune `HeroTransition` for non-video hero | `components/HeroTransition.tsx` | ✓ |

## Task ordering rationale

Tasks 2–10 can be done in **any order** because each one is scoped to a
single file or a single new route. The only ordering constraint is that
task 7 (the `/info` page) imports from tasks 5 and 6, so those should be
done before wiring the page together — but because the spec is fully
written, the AI can read ahead and pick up tasks 5, 6, and 7 in one pass.

## What "done" means for each task

A task is done when:
1. The file exists at the path in column "Files."
2. It satisfies every functional requirement that references it
   (see [Spec 3](./03-functional-requirements.md)).
3. It does not break any existing route or component
   (see Constitution rule 5 in [Spec 1](./01-constitution.md)).
