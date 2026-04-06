import { NextRequest } from "next/server";
import { CLAUDE_MODEL, getAnthropicHeaders, CHAT_SYSTEM_PROMPT } from "@/lib/anthropic";

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: getAnthropicHeaders(),
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 1024,
        system: CHAT_SYSTEM_PROMPT,
        messages,
        stream: true,
      }),
    });

    // Stream the response back to the client
    return new Response(response.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
      },
    });
  } catch (err) {
    console.error("Chat error:", err);
    return new Response(JSON.stringify({ error: "Chat failed" }), { status: 500 });
  }
}