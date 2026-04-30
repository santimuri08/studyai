// app/api/chat/guest/route.ts
//
// Stateless guest chat endpoint. No auth, no DB.
// Accepts the full conversation history in the request body and returns
// a single Claude reply. Used by the landing-page hero so visitors can
// try StudyAI without signing up.
//
// Guest mode does NOT support assignment-saving, scheduling, or progress —
// those require an account because they need persistent storage.

import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = "claude-sonnet-4-5-20250929";

const GUEST_SYSTEM_PROMPT = `You are StudyAI, a friendly academic assistant for college students.

You are talking to a GUEST visitor who has not signed up yet. They are trying out the product on the landing page.

Rules:
- Be warm, direct, concise. No emojis.
- Help with study strategies, explaining concepts, breaking down assignments, time management, study tips.
- If they paste an assignment, give them a quick plain-English summary, key requirements, and a rough task breakdown — but tell them that to SAVE assignments, schedule tasks, and track progress, they need to create a free account.
- Keep replies to 2-4 short paragraphs unless they ask for more depth.
- If they ask about features that need an account (saving assignments, scheduling, progress tracking, calendar export), briefly explain what those features do and invite them to sign up — don't be pushy.
- Never claim to remember past sessions; you don't, because guest chats are local-only.

Respond with valid JSON only (no markdown, no preamble):
  { "reply": "your text answer" }`;

type ClientMessage = { role: "user" | "assistant"; content: string };

function parseJSON<T = unknown>(raw: string): T | null {
  const cleaned = raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/, "")
    .replace(/```\s*$/, "")
    .trim();
  try { return JSON.parse(cleaned) as T; } catch { return null; }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const messages = Array.isArray(body?.messages) ? body.messages as ClientMessage[] : [];

    if (messages.length === 0) {
      return NextResponse.json({ error: "messages array required" }, { status: 400 });
    }

    // Sanitize + cap to last 16 turns so the prompt stays bounded
    const sanitized: ClientMessage[] = messages
      .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
      .map((m) => ({ role: m.role, content: m.content.slice(0, 4000) }))
      .slice(-16);

    if (sanitized.length === 0 || sanitized[sanitized.length - 1].role !== "user") {
      return NextResponse.json({ error: "last message must be from user" }, { status: 400 });
    }

    const response = await anthropic.messages.create({
      model:       MODEL,
      max_tokens:  1024,
      temperature: 0.4,
      system:      GUEST_SYSTEM_PROMPT,
      messages:    sanitized,
    });

    const first = response.content[0];
    const raw   = first && first.type === "text" ? first.text.trim() : "";

    const parsed = parseJSON<{ reply?: string }>(raw);
    const reply  = parsed?.reply ?? raw ?? "Sorry, I had trouble with that. Try rephrasing?";

    return NextResponse.json({ ok: true, reply });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("Guest chat error:", msg);
    return NextResponse.json(
      { error: "Something went wrong. Try again in a moment." },
      { status: 500 },
    );
  }
}