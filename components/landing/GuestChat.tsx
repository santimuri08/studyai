// components/landing/GuestChat.tsx
//
// Live chat that runs in the hero for unauthenticated visitors.
// - Starts as a single input bar at the bottom of the hero.
// - On first message, the parent (Hero) hides the title/subtitle and
//   this component expands into a scrollable conversation.
// - Persists in localStorage so a refresh doesn't blow away the chat.
// - Hits /api/chat/guest (no auth, no DB, stateless server-side).

"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

type Msg = { id: string; role: "user" | "assistant"; content: string };

const STORAGE_KEY = "studyai_guest_chat_v1";
const STARTERS = [
  "Explain the Pomodoro technique",
  "How do I study for finals?",
  "Help me break down an essay",
  "What's spaced repetition?",
];

interface Props {
  /** Notified when the user sends their first message — Hero uses this to hide the title. */
  onActivate?: () => void;
  /** True once the chat has been activated (controlled by Hero so refresh restores correct state). */
  active: boolean;
}

export default function GuestChat({ onActivate, active }: Props) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input,    setInput]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const endRef    = useRef<HTMLDivElement>(null);

  // ── Restore from localStorage on mount ────────────────────────
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Msg[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
          onActivate?.();
        }
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Persist on change ────────────────────────────────────────
  useEffect(() => {
    if (!hydrated) return;
    try {
      if (messages.length === 0) localStorage.removeItem(STORAGE_KEY);
      else                       localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      /* quota / private mode — ignore */
    }
  }, [messages, hydrated]);

  // ── Auto-scroll on new message ───────────────────────────────
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  async function send(text?: string) {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;

    // First message activates the chat (hides title)
    if (messages.length === 0) onActivate?.();

    const userMsg: Msg = {
      id: `u-${Date.now()}`,
      role: "user",
      content: msg,
    };

    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat/guest", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          messages: next.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "Request failed");

      setMessages((p) => [
        ...p,
        { id: `a-${Date.now()}`, role: "assistant", content: data.reply ?? "Hmm, I didn't catch that. Try again?" },
      ]);
    } catch {
      setMessages((p) => [
        ...p,
        { id: `e-${Date.now()}`, role: "assistant", content: "Something went wrong on my end. Mind trying again?" },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function clearChat() {
    setMessages([]);
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  }

  // ──────────────────────────────────────────────────────────────
  // Two visual modes:
  // 1. Idle (no messages yet) → just an input bar with starters above
  // 2. Active                  → full-height card with messages + input
  // ──────────────────────────────────────────────────────────────

  if (!active && messages.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.95, ease: [0.25, 0.1, 0.25, 1] }}
        style={{ width: "100%", maxWidth: 680, margin: "0 auto" }}
      >
        {/* Starter chips */}
        <div style={{
          display: "flex", flexWrap: "wrap", gap: 8,
          justifyContent: "center", marginBottom: 14,
        }}>
          {STARTERS.map((s, i) => (
            <motion.button
              key={s}
              data-hover
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 1.1 + i * 0.06 }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => send(s)}
              style={{
                fontSize:   12.5,
                fontWeight: 500,
                color:      "rgba(229,231,235,0.85)",
                background: "rgba(255,255,255,0.04)",
                border:     "1px solid rgba(255,255,255,0.10)",
                borderRadius: 9999,
                padding:    "7px 14px",
                cursor:     "none",
                backdropFilter: "blur(10px)",
                fontFamily: "var(--font-dm-sans, 'DM Sans'), sans-serif",
              }}
            >
              {s}
            </motion.button>
          ))}
        </div>

        {/* Input row */}
        <InputRow
          input={input}
          setInput={setInput}
          onSend={() => send()}
          loading={loading}
          big
        />

        <p style={{
          marginTop: 12, fontSize: 12, textAlign: "center",
          color: "rgba(156,163,175,0.7)",
        }}>
          Try it free — no account needed.{" "}
          <Link href="/signup" style={{ color: "#a78bfa", textDecoration: "none", fontWeight: 600 }}>
            Sign up
          </Link>{" "}
          to save your chats.
        </p>
      </motion.div>
    );
  }

  // ── Active conversation ────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.25, 0.1, 0.25, 1] }}
      style={{
        width:        "100%",
        maxWidth:     760,
        margin:       "0 auto",
        height:       "min(560px, 70vh)",
        display:      "flex",
        flexDirection: "column",
        background:   "rgba(10, 12, 26, 0.55)",
        border:       "1px solid rgba(124,111,255,0.18)",
        borderRadius: 20,
        overflow:     "hidden",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        boxShadow:    "0 24px 70px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.02) inset",
      }}
    >
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 16px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        flexShrink: 0,
        background: "rgba(255,255,255,0.015)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 28, height: 28, borderRadius: "50%",
            background: "linear-gradient(135deg, rgba(124,111,255,0.25), rgba(91,69,224,0.18))",
            border: "1px solid rgba(124,111,255,0.35)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, fontWeight: 800, color: "#c4b5fd",
            fontFamily: "var(--font-sora, 'Sora'), sans-serif",
          }}>S</div>
          <div>
            <p style={{
              margin: 0, fontSize: 13, fontWeight: 700, color: "white",
              fontFamily: "var(--font-sora, 'Sora'), sans-serif",
              letterSpacing: "-0.01em",
            }}>
              StudyAI <span style={{ color: "rgba(167,139,250,0.85)", fontWeight: 500 }}>· Guest</span>
            </p>
            <p style={{ margin: 0, fontSize: 10, color: "#34d399" }}>● Online · Powered by Claude</p>
          </div>
        </div>
        <button
          onClick={clearChat}
          data-hover
          style={{
            fontSize:   11,
            fontWeight: 600,
            color:      "rgba(229,231,235,0.65)",
            background: "transparent",
            border:     "1px solid rgba(255,255,255,0.10)",
            borderRadius: 8,
            padding:    "5px 10px",
            cursor:     "none",
            fontFamily: "var(--font-dm-sans, 'DM Sans'), sans-serif",
          }}
        >
          Clear
        </button>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        style={{
          flex: 1, overflowY: "auto",
          padding: "16px 18px",
          display: "flex", flexDirection: "column", gap: 10,
        }}
      >
        <AnimatePresence initial={false}>
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              style={{
                display: "flex",
                justifyContent: m.role === "user" ? "flex-end" : "flex-start",
              }}
            >
              <div style={{
                maxWidth:   "85%",
                padding:    "10px 14px",
                fontSize:   13.5,
                lineHeight: 1.6,
                whiteSpace: "pre-wrap",
                fontFamily: "var(--font-dm-sans, 'DM Sans'), sans-serif",
                ...(m.role === "user"
                  ? {
                      background: "linear-gradient(135deg, #7c6fff, #5b45e0)",
                      color: "white",
                      borderRadius: "14px 14px 4px 14px",
                      boxShadow: "0 4px 14px rgba(124,111,255,0.35)",
                    }
                  : {
                      background: "rgba(255,255,255,0.045)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      color: "rgba(229,231,235,0.95)",
                      borderRadius: "14px 14px 14px 4px",
                    }),
              }}>
                {m.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div style={{
              padding:    "12px 14px",
              background: "rgba(255,255,255,0.045)",
              border:     "1px solid rgba(255,255,255,0.08)",
              borderRadius: "14px 14px 14px 4px",
              display:    "flex", gap: 5, alignItems: "center",
            }}>
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  animate={{ opacity: [0.25, 1, 0.25], y: [0, -2, 0] }}
                  transition={{ repeat: Infinity, duration: 1, delay: i * 0.18 }}
                  style={{
                    display: "inline-block",
                    width: 5, height: 5, borderRadius: "50%",
                    background: "rgba(167,139,250,0.85)",
                  }}
                />
              ))}
            </div>
          </div>
        )}

        <div ref={endRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: "12px 14px",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        flexShrink: 0,
        background: "rgba(255,255,255,0.01)",
      }}>
        <InputRow
          input={input}
          setInput={setInput}
          onSend={() => send()}
          loading={loading}
          big={false}
        />
        <p style={{
          margin: "8px 2px 0", fontSize: 11,
          color: "rgba(156,163,175,0.7)", textAlign: "center",
        }}>
          Guest chat is local-only.{" "}
          <Link href="/signup" style={{ color: "#a78bfa", textDecoration: "none", fontWeight: 600 }}>
            Sign up
          </Link>{" "}
          to save chats and unlock assignment tools.
        </p>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Input row — used in both idle and active modes
// ─────────────────────────────────────────────────────────────────

function InputRow({
  input, setInput, onSend, loading, big,
}: {
  input:    string;
  setInput: (v: string) => void;
  onSend:   () => void;
  loading:  boolean;
  big:      boolean;
}) {
  return (
    <div style={{
      display:    "flex",
      gap:        8,
      background: big ? "rgba(10,12,26,0.6)" : "rgba(255,255,255,0.03)",
      border:     `1px solid ${big ? "rgba(124,111,255,0.28)" : "rgba(255,255,255,0.10)"}`,
      borderRadius: big ? 16 : 12,
      padding:    big ? "8px 8px 8px 18px" : "6px 6px 6px 14px",
      backdropFilter: "blur(14px)",
      WebkitBackdropFilter: "blur(14px)",
      boxShadow:  big ? "0 12px 40px rgba(0,0,0,0.35)" : "none",
      transition: "border-color 0.2s ease, box-shadow 0.2s ease",
    }}>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSend();
          }
        }}
        placeholder={big ? "Ask anything — try \"explain the pomodoro technique\"" : "Ask anything…"}
        disabled={loading}
        style={{
          flex: 1,
          background: "transparent",
          border:     "none",
          color:      "white",
          fontSize:   big ? 15 : 13.5,
          padding:    big ? "10px 0" : "8px 0",
          outline:    "none",
          fontFamily: "var(--font-dm-sans, 'DM Sans'), sans-serif",
        }}
      />
      <button
        onClick={onSend}
        disabled={loading || !input.trim()}
        data-hover
        style={{
          background: "linear-gradient(135deg, #7c6fff, #5b45e0)",
          border:     "none",
          borderRadius: big ? 12 : 10,
          padding:    big ? "10px 18px" : "8px 14px",
          color:      "white",
          fontSize:   big ? 14 : 13,
          fontWeight: 700,
          cursor:     "none",
          opacity:    loading || !input.trim() ? 0.4 : 1,
          transition: "transform 0.15s ease, box-shadow 0.2s ease",
          boxShadow:  "0 4px 14px rgba(124,111,255,0.35)",
          fontFamily: "var(--font-sora, 'Sora'), sans-serif",
          display:    "flex", alignItems: "center", gap: 6,
        }}
      >
        {big ? "Send" : "↑"}
        {big && <span style={{ fontSize: 14 }}>→</span>}
      </button>
    </div>
  );
}