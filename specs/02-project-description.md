# Spec 2 — Project Description

StudyAI is an AI-powered academic productivity platform for college students.
It reads a student's assignment, breaks it into tasks, schedules those tasks
across the week, tracks progress, and answers academic questions in chat —
all powered by Claude.

The current sprint redesigns the public-facing entry to be **chat-first**.
Visitors land directly inside a working StudyAI conversation. If they want
their work saved, they create an account.

## Format

This project uses **Spec-Driven Development (SDD)**. Instead of prompting
the AI iteratively and hoping it gets there, the spec is written first.
The AI then implements *against* the spec. This forces clarity up-front,
eliminates "context amnesia" between prompts, and produces output that
matches the original intent on the first try.

## Document index

| # | Title | What it covers |
|---|-------|----------------|
| 1 | Constitution | Non-negotiable principles for any change |
| 2 | Project Description | This document |
| 3 | Functional Requirements | What the system must do, with stable IDs |
| 4 | Non-Functional Requirements | Performance, accessibility, privacy, cost |
| 5 | Technical Plan | Stack, architecture, AI endpoints |
| 6 | Task Breakdown | Sprint 7 work, file by file |
| 7 | Sprint History | The journey from sprint 0 to today |
| 8 | Why SDD? | Before/after comparison on this same project |
| 9 | Verification Checklist | What must be true to call the sprint done |
| 10 | Out of Scope | What we explicitly did NOT do |
