// app/api/chat/route.ts
// Updated API route. Teaches Claude to respond with structured JSON so the
// dashboard can render rich cards (schedule, progress, assignment) inline.
//
// Response shapes the client understands:
//   { reply: "plain text" }                             ← plain chat reply
//   { reply: "text", type: "schedule"|"progress"|"assignment", data: {...} }  ← rich card
//
// If Claude returns anything non-JSON, we fall back to { reply: text } so
// nothing breaks.

import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM = `You are StudyAI, an AI study assistant built into a chat-first app.

Your job is to help students understand assignments, plan their week, track progress, and export schedules.

RESPONSE FORMAT — ALWAYS return valid JSON. No markdown, no backticks, no text outside the JSON object.

Two response shapes:

1. Plain conversation (advice, questions, explanations):
{ "reply": "your text answer" }

2. Rich card (schedule, progress, or assignment analysis):
{ "reply": "one-sentence intro", "type": "schedule" | "progress" | "assignment", "data": { ... } }

SCHEMAS for rich cards:

Schedule ("show my week", "what's due Friday"):
{
  "reply": "Here's your week at a glance:",
  "type": "schedule",
  "data": {
    "tasks": [
      {
        "title": "Calculus HW",
        "when": "Mon 6-8 PM",
        "hours": 2,
        "subject": "math",
        "start": "2026-04-21T18:00:00Z",
        "end": "2026-04-21T20:00:00Z"
      }
    ]
  }
}

Progress ("how am I doing", "my streak"):
{
  "reply": "You're on a 3-day streak — keep it going.",
  "type": "progress",
  "data": {
    "streak": 3,
    "hours": 4.5,
    "goal": 15,
    "tasksDone": 2,
    "tasksTotal": 8
  }
}

Assignment (user pasted assignment text):
{
  "reply": "Here's what this assignment needs:",
  "type": "assignment",
  "data": {
    "title": "Climate policy research paper",
    "summary": "6-page APA paper on climate policy in developing nations.",
    "tasks": [
      { "name": "Find 5 peer-reviewed sources", "time": "90 min" },
      { "name": "Write outline", "time": "45 min" }
    ],
    "total": "~6.5 hours",
    "due": "Friday 11:59 PM"
  }
}

RULES:
- ALWAYS valid JSON. No code fences. No preamble.
- Keep "reply" to one or two short sentences — the rich card carries the detail.
- Default to plain { "reply": "..." } for anything that isn't a schedule, progress, or assignment request.
- Be friendly and direct. No emojis.`;

type HistoryMessage = {
  role: "user" | "assistant";
  content: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      message?: string;
      history?: HistoryMessage[];
    };

    const message = body.message;
    const history = body.history ?? [];

    if (!message) {
      return NextResponse.json(
        { error: "Message required" },
        { status: 400 }
      );
    }

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 1024,
      temperature: 0.4,
      system: SYSTEM,
      messages: [
        ...history.map((m) => ({ role: m.role, content: m.content })),
        { role: "user" as const, content: message },
      ],
    });

    const firstBlock = response.content[0];
    const raw =
      firstBlock && firstBlock.type === "text" ? firstBlock.text.trim() : "";

    // Strip any accidental markdown fences
    const cleaned = raw
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/, "")
      .replace(/```\s*$/, "")
      .trim();

    try {
      const parsed = JSON.parse(cleaned);
      return NextResponse.json(parsed);
    } catch {
      // Non-JSON output — return as plain reply so UI still renders something
      return NextResponse.json({ reply: raw });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("StudyAI chat error:", message);
    return NextResponse.json(
      { error: "Processing failed: " + message },
      { status: 500 }
    );
  }
}