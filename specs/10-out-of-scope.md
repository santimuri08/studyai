# Spec 10 — Out of Scope (Explicitly NOT in This Sprint)

These are things the AI MUST NOT attempt during sprint 7. They are
either deferred to a later sprint, or out of scope for this project
entirely. Listing them here prevents the AI from "helpfully" expanding
the work.

## 10.1 Deferred to a future sprint

- **Migrate guest chats into a user's account on signup.** Right now the
  guest conversation in `localStorage` is dropped when the user signs up.
  Could be sprint 8.

- **Streaming responses from `/api/chat/guest`.** Currently the guest
  endpoint buffers the full reply before sending it back. Streaming
  would feel snappier but adds complexity.

- **Rate limiting on `/api/chat/guest`.** Will add before broad launch.
  For now the per-request 16-message / 4000-char caps are the only
  bounds.

- **Mobile-specific layout tuning** beyond the existing responsive
  rules. The hero and info page work on mobile but haven't been
  hand-tuned.

## 10.2 Not in scope for this project

- **Internationalization.** Single-language (English) for now.

- **Native mobile apps.** Web only.

- **Drag-and-drop calendar** in the guest chat. That's a feature of the
  authenticated `/chat` experience, not the guest landing.

- **Telemetry / analytics.** Not collecting behavioral data from
  visitors on the public surfaces.

## 10.3 What "out of scope" means in practice

If the AI is asked a follow-up question that touches one of these
items, the right response is:

> "That's listed as out of scope in spec 10. Do you want to update the
> spec to bring it in, or defer it to a future sprint?"

This keeps the sprint focused and prevents scope creep from quietly
contaminating the implementation.
