# Spec 9 — Verification Checklist

Before considering this sprint done, all of these must be true.
Each item maps back to a functional requirement in
[Spec 3](./03-functional-requirements.md).

## 9.1 Homepage (`/`)

- [ ] Shows ONLY the chat-first hero. No marketing sections below it. *(GE-01)*
- [ ] A guest can send a message and receive a Claude reply without signing up. *(GE-02)*
- [ ] Title and subtitle fade out when the first message is sent. *(GE-03)*
- [ ] Refreshing `/` after sending messages restores the conversation. *(GE-04)*
- [ ] Refreshing while messages exist boots straight into chat-active mode. *(GE-04)*
- [ ] "Clear" wipes localStorage and the on-screen chat. *(GE-06)*
- [ ] No video assets are loaded.

## 9.2 Info Page (`/info`)

- [ ] Renders InfoIntro at the top. *(IP-01)*
- [ ] Renders Pain → Problem → Features → AI sections in that order below. *(IP-02)*
- [ ] Each section translates upward as it scrolls in. *(IP-03)*
- [ ] `prefers-reduced-motion` disables the rise translations. *(IP-04)*
- [ ] "Info" link in TopNav highlights when active. *(IP-05)*

## 9.3 Authenticated Surfaces

- [ ] `/login`, `/signup`, `/chat` all still work exactly as before. *(AU-01..03, AE-01)*
- [ ] Logged-in users see "Open StudyAI" + "Log out" in the nav. *(AE-02)*
- [ ] Assignment cards, schedule cards, progress, ICS export, soft-delete + restore still work. *(AE-03)*

## 9.4 Cross-cutting

- [ ] No API key is exposed to the browser. *(Constitution rule 6)*
- [ ] Brand palette, fonts, and custom-cursor convention preserved. *(Constitution rule 7)*
- [ ] No file outside the task list in [Spec 6](./06-task-breakdown.md) was modified.
