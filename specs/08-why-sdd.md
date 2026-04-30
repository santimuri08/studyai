# Spec 8 — Why Spec-Driven Development for This Sprint?

## 8.1 Before SDD (Sprints 1–6)

A typical interaction with the AI looked like this:

> "Make the landing page have a chat at the bottom"
> *(AI builds something)*
>
> "No, I meant the chat should be the WHOLE hero, no signup needed"
> *(AI rebuilds)*
>
> "And the title should disappear when I send a message"
> *(AI rebuilds again)*

Three rounds of guessing, three different mental models, three rebuilds.
The AI had no persistent picture of the goal.

## 8.2 With SDD (Sprint 7)

The spec was written first. It listed every requirement (GE-01..07,
IP-01..05), named the constitution (chat-first; rise, don't fall; one job
per page), and broke the work into 10 specific tasks tied to specific
files.

The implementation followed in **one pass**:

- Output matched intent on the first try because the AI knew what
  "chat-first" meant before it wrote a single line.
- The constitution prevented the AI from "fixing" things that weren't
  broken (e.g., refactoring the auth flow as a side effect).
- The task list became a checklist — every file was scoped and named,
  so no file got accidentally orphaned or duplicated.

## 8.3 Concrete Win

The original landing page took roughly a week of back-and-forth to land
on a shape we liked. The redesign — a bigger architectural change
involving a new page, a new API endpoint, a state-machine-like hero,
and scroll-driven animation — landed in a single working session.

That's the difference SDD makes: it compresses the senior-engineer
planning loop into a markdown file the AI can actually follow.

## 8.4 What the AI does without a spec

- Picks plausible-looking patterns that don't match the rest of the codebase.
- Refactors things adjacent to the request, "helpfully" breaking unrelated routes.
- Forgets earlier decisions between prompts (context amnesia).
- Re-asks for things the user already said.
- Produces code that compiles but doesn't satisfy the actual intent.

## 8.5 What the AI does with a spec

- Reads the constitution and respects the boundaries.
- Implements the named files and only those files.
- References stable IDs (GE-03, IP-02) instead of re-deriving the requirement.
- Stops when the verification checklist is satisfied — not when it gets bored.
- Leaves the code looking like the rest of the codebase.

## 8.6 The takeaway

Spec-driven development is not about writing more documentation. It's
about writing the **right** documentation — the kind an AI can use as a
working contract — so that the implementation is a transcription of the
spec rather than a guess at it.
