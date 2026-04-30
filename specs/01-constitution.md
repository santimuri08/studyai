# Spec 1 — Constitution (Immutable Principles)

These are the rules every change to this project MUST respect. They are
non-negotiable. Any AI working on this codebase reads this section first.

1. **Chat-first product.** The hero IS the product. A visitor must be able
   to talk to the AI within 3 seconds of loading the homepage, with no
   signup gate.

2. **Try → Save.** The product is free to try as a guest. Account creation
   only unlocks *persistence* (saved chats, assignments, schedules,
   progress). It does not gate the core "talk to Claude about my work"
   experience.

3. **Rise, don't fall.** On the marketing/info page, content rises into
   the viewport as the user scrolls. The user should feel like the page is
   bringing content to them, not that they are falling past static blocks.

4. **One job per page.** The homepage's job is "talk to it." The info page's
   job is "explain how it works." The chat page's job is "do real work."
   Pages are not allowed to mix jobs.

5. **No silent breakage.** Any change to the landing experience MUST keep
   `/login`, `/signup`, `/chat`, and the existing `/api/chat` (authed) route
   working exactly as they did. The auth flow and protected routes are
   load-bearing — they don't get refactored as a side effect.

6. **Server-side AI only.** API keys never reach the browser. Every call to
   Claude goes through a Next.js route handler.

7. **Brand consistency.** Sora for display, DM Sans for body, the established
   purple gradient palette (`#7c6fff → #5b45e0 → #a78bfa`), and the existing
   custom-cursor convention (`cursor: "none"` on interactive elements).
