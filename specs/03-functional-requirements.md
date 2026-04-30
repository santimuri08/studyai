# Spec 3 — Functional Requirements

## 3.1 Guest Experience (Unauthenticated)

| ID | Requirement |
|----|-------------|
| GE-01 | The homepage `/` displays only the hero: title "Understand. Plan. Study Smarter.", subtitle, and a guest chat input. |
| GE-02 | A guest can type a message and receive a real Claude reply *without* creating an account. |
| GE-03 | When the guest sends their first message, the title and subtitle slide upward and fade out. The chat expands to fill the hero. |
| GE-04 | Guest conversation persists in `localStorage` (key: `studyai_guest_chat_v1`) so a refresh restores the chat. |
| GE-05 | Guest mode does NOT support assignment-saving, scheduling, progress tracking, or calendar export. The guest model is told this and politely invites the user to sign up if they ask for those features. |
| GE-06 | A "Clear" button wipes the local conversation. |
| GE-07 | The TopNav exposes an "Info" link to `/info` and "Log in" / "Sign up" buttons. |

## 3.2 Info Page (`/info`)

| ID | Requirement |
|----|-------------|
| IP-01 | The page opens with `InfoIntro` ("From messy assignment to a clear plan."), serving as a soft anchor before the rising sections. |
| IP-02 | Four sections render below, in order: `PainSection`, `ProblemSection` (4-step AI transformation), `FeaturesSection`, `AISection` ("Powered by Claude AI"). |
| IP-03 | Each section is wrapped in `<SectionRise>`, which translates it from `+distance` px below to `0` as it scrolls into view, and continues slightly negative as it leaves. Opacity fades in on entry and softens on exit. |
| IP-04 | A `prefers-reduced-motion` user gets the same content with translation disabled. |
| IP-05 | The "Info" link in the TopNav highlights with a purple background when the user is on `/info`. |

## 3.3 Authenticated Experience (Unchanged)

| ID | Requirement |
|----|-------------|
| AE-01 | `/chat` remains protected by middleware — unauthenticated visitors are redirected to `/login`. |
| AE-02 | Logged-in users see "Open StudyAI" + "Log out" in the TopNav instead of "Log in" / "Sign up". |
| AE-03 | All existing chat features (assignment cards, schedule cards, progress, ICS export, soft-delete + restore) continue to work. |
| AE-04 | The guest chat on `/` remains visible to logged-in users but is intentionally NOT linked to their persistent chat history — it's a demo surface. |

## 3.4 Auth Flow (Unchanged)

| ID | Requirement |
|----|-------------|
| AU-01 | `/login` and `/signup` use the existing `AuthShell`. |
| AU-02 | Successful signup auto-signs-in and redirects to `/chat`. |
| AU-03 | Middleware on `/chat/*` is preserved verbatim. |
