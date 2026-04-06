import { NextRequest, NextResponse } from "next/server";
import { CLAUDE_MODEL, getAnthropicHeaders, ANALYZE_SYSTEM_PROMPT } from "@/lib/anthropic";

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text || text.trim().length < 10) {
      return NextResponse.json({ error: "Assignment text too short" }, { status: 400 });
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: getAnthropicHeaders(),
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 1024,
        system: ANALYZE_SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: `Analyze this assignment:\n\n${text}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const data = await response.json();
    const rawText = data.content[0]?.text || "{}";

    // Strip markdown code blocks if present
    const clean = rawText.replace(/```json|```/g, "").trim();
    const result = JSON.parse(clean);

    return NextResponse.json(result);
  } catch (err) {
    console.error("Analyze error:", err);
    return NextResponse.json({ error: "Failed to analyze assignment" }, { status: 500 });
  }
}