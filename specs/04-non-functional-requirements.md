# Spec 4 — Non-Functional Requirements

## 4.1 Performance

- Hero must reach interactive in under 1.5s on a fast 3G connection.
- No video assets on the landing page.
- Mesh gradient blobs use `transform` only (no layout thrashing).
- Framer Motion `useScroll` + `useTransform` for `SectionRise` so scroll
  work happens on the compositor thread.

## 4.2 Accessibility

- All interactive elements reachable by keyboard.
- `prefers-reduced-motion` honored — `SectionRise` collapses its translate
  to `0` and the rise becomes a pure opacity fade.
- Color contrast on text against the mesh gradient meets WCAG AA.
- The custom cursor does not break native focus rings.

## 4.3 Privacy

- Guest chat is local-only — stored in `localStorage` under
  `studyai_guest_chat_v1`.
- The server endpoint `/api/chat/guest` is stateless. No DB writes,
  no logging of message content beyond what the AI provider sees.
- No analytics or third-party scripts on the landing or info pages.

## 4.4 Cost

- Guest endpoint capped to the **last 16 messages** per request.
- Each message capped at **~4000 characters** server-side before being
  forwarded to Claude.
- `max_tokens` on the guest call is capped at **1024** to bound output cost.
- Authenticated `/api/chat` is unchanged — it already has its own caps via
  the router prompt and per-action handling.
