// components/chat/ChatShell.tsx
"use client";

import { useState, useTransition, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { motion } from "framer-motion";

type ChatSummary = {
  id:        string;
  title:     string;
  updatedAt: string;
};

type User = {
  name:  string | null;
  email: string;
};

interface Props {
  initialChats: ChatSummary[];
  user:         User;
  children:     ReactNode;
}

function groupByDate(chats: ChatSummary[]) {
  const now       = new Date();
  const startDay  = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const today     = startDay(now);
  const yesterday = today - 86400000;
  const sevenDays = today - 7 * 86400000;
  const thirty    = today - 30 * 86400000;

  const g: Record<string, ChatSummary[]> = {
    "Today": [],
    "Yesterday": [],
    "Previous 7 days": [],
    "Previous 30 days": [],
    "Older": [],
  };

  for (const c of chats) {
    const t = new Date(c.updatedAt).getTime();
    if (t >= today)            g["Today"].push(c);
    else if (t >= yesterday)   g["Yesterday"].push(c);
    else if (t >= sevenDays)   g["Previous 7 days"].push(c);
    else if (t >= thirty)      g["Previous 30 days"].push(c);
    else                       g["Older"].push(c);
  }

  return Object.entries(g).filter(([, list]) => list.length > 0);
}

export default function ChatShell({ initialChats, user, children }: Props) {
  const [chats, setChats] = useState<ChatSummary[]>(initialChats);
  const [menuOpen, setMenuOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const router   = useRouter();
  const pathname = usePathname();

  const activeId = pathname.startsWith("/chat/") ? pathname.split("/chat/")[1] : null;

  async function newChat() {
    const res = await fetch("/api/chats", { method: "POST" });
    if (!res.ok) return;
    const { chat } = await res.json();
    setChats((prev) => [{ ...chat, updatedAt: chat.updatedAt ?? new Date().toISOString() }, ...prev]);
    startTransition(() => router.push(`/chat/${chat.id}`));
  }

  async function deleteChat(id: string) {
    const confirmed = confirm("Delete this chat? This can't be undone.");
    if (!confirmed) return;

    const res = await fetch(`/api/chats/${id}`, { method: "DELETE" });
    if (!res.ok) return;

    setChats((prev) => prev.filter((c) => c.id !== id));

    if (activeId === id) {
      const next = chats.find((c) => c.id !== id);
      startTransition(() => router.push(next ? `/chat/${next.id}` : "/chat"));
    }
  }

  const initials = (user.name ?? user.email).slice(0, 1).toUpperCase();
  const groups   = groupByDate(chats);

  return (
    <div style={{ display: "flex", height: "100vh", background: "var(--bg)" }}>

      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <aside
        style={{
          width:        260,
          minHeight:    "100vh",
          background:   "rgba(5, 6, 15, 0.96)",
          borderRight:  "1px solid var(--border)",
          display:      "flex",
          flexDirection: "column",
          padding:      "16px 12px",
          backdropFilter: "blur(24px)",
          flexShrink:   0,
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{
            display:      "flex",
            alignItems:   "center",
            gap:          10,
            padding:      "8px 10px",
            marginBottom: 14,
            textDecoration: "none",
            borderRadius: 10,
          }}
        >
          <div style={{
            width: 30, height: 30, borderRadius: 9,
            background: "linear-gradient(135deg, var(--primary), #5b45e0)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 13, fontWeight: 800, color: "white",
            fontFamily: "var(--font-sora, 'Sora'), sans-serif",
            boxShadow: "0 4px 12px rgba(124,92,255,0.35)",
          }}>S</div>
          <span style={{
            fontWeight: 700, fontSize: 14.5, color: "var(--text)",
            fontFamily: "var(--font-sora, 'Sora'), sans-serif",
            letterSpacing: "-0.02em",
          }}>StudyAI</span>
        </Link>

        {/* New chat */}
        <button
          onClick={newChat}
          disabled={pending}
          style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "10px 12px",
            marginBottom: 16,
            background: "linear-gradient(135deg, var(--primary) 0%, #5b45e0 100%)",
            border: "none", borderRadius: 11,
            color: "white", fontSize: 13.5, fontWeight: 600,
            cursor: "pointer",
            fontFamily: "var(--font-sora, 'Sora'), sans-serif",
            boxShadow: "0 4px 14px rgba(124,92,255,0.35)",
            opacity: pending ? 0.6 : 1,
            transition: "transform 0.15s ease, box-shadow 0.2s ease",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = ""; }}
        >
          <span style={{ fontSize: 16, lineHeight: 1 }}>＋</span>
          New chat
        </button>

        {/* Chat list */}
        <div style={{ flex: 1, overflowY: "auto", marginBottom: 12 }}>
          {chats.length === 0 && (
            <p style={{
              fontSize: 12, color: "var(--text-faint)",
              padding: "10px 12px", textAlign: "center",
            }}>
              No chats yet. Tap + New chat to start.
            </p>
          )}

          {groups.map(([label, list]) => (
            <div key={label} style={{ marginBottom: 14 }}>
              <p style={{
                fontSize: 10, fontWeight: 700,
                color: "var(--text-faint)",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                padding: "0 10px",
                marginBottom: 6,
                fontFamily: "var(--font-sora, 'Sora'), sans-serif",
              }}>{label}</p>

              {list.map((c) => {
                const isActive = c.id === activeId;
                return (
                  <div
                    key={c.id}
                    style={{
                      display: "flex", alignItems: "center",
                      gap: 4, position: "relative",
                    }}
                  >
                    <Link
                      href={`/chat/${c.id}`}
                      style={{
                        flex: 1,
                        padding: "8px 12px",
                        fontSize: 13,
                        borderRadius: 9,
                        color: isActive ? "var(--primary-text)" : "var(--text-muted)",
                        background: isActive ? "rgba(124,92,255,0.1)" : "transparent",
                        border: isActive
                          ? "1px solid rgba(124,92,255,0.22)"
                          : "1px solid transparent",
                        textDecoration: "none",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        fontFamily: "var(--font-dm-sans, 'DM Sans'), sans-serif",
                        transition: "background 0.15s ease, color 0.15s ease",
                      }}
                    >
                      {c.title || "New chat"}
                    </Link>
                    <button
                      onClick={(e) => { e.preventDefault(); deleteChat(c.id); }}
                      title="Delete chat"
                      style={{
                        opacity: 0,
                        background: "transparent",
                        border: "none",
                        color: "var(--text-faint)",
                        fontSize: 12,
                        cursor: "pointer",
                        padding: "4px 8px",
                        borderRadius: 6,
                        transition: "opacity 0.15s ease, color 0.15s ease",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.color = "#ef4444"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.opacity = "0"; e.currentTarget.style.color = "var(--text-faint)"; }}
                      className="chat-row-delete"
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* User menu */}
        <div style={{ position: "relative" }}>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                position: "absolute",
                bottom: "calc(100% + 6px)",
                left: 0, right: 0,
                background: "rgba(15, 17, 34, 0.98)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                padding: 6,
                boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
                backdropFilter: "blur(20px)",
              }}
            >
              <Link
                href="/"
                onClick={() => setMenuOpen(false)}
                style={menuItemStyle}
              >
                Landing page
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                style={{ ...menuItemStyle, width: "100%", textAlign: "left", background: "transparent", border: "none" }}
              >
                Log out
              </button>
            </motion.div>
          )}

          <button
            onClick={() => setMenuOpen((o) => !o)}
            style={{
              width: "100%",
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 10px",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              color: "var(--text)",
              cursor: "pointer",
              transition: "background 0.15s ease",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
          >
            <div style={{
              width: 28, height: 28, borderRadius: "50%",
              background: "linear-gradient(135deg, var(--primary), #5b45e0)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 700, color: "white",
              flexShrink: 0,
              fontFamily: "var(--font-sora, 'Sora'), sans-serif",
            }}>{initials}</div>
            <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
              <p style={{
                fontSize: 13, fontWeight: 600, color: "var(--text)",
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                margin: 0,
              }}>
                {user.name ?? user.email}
              </p>
              {user.name && (
                <p style={{
                  fontSize: 11, color: "var(--text-muted)",
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  margin: 0,
                }}>
                  {user.email}
                </p>
              )}
            </div>
            <span style={{ color: "var(--text-muted)", fontSize: 12 }}>⋯</span>
          </button>
        </div>
      </aside>

      {/* ── Main content ──────────────────────────────────────── */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
        {children}
      </main>
    </div>
  );
}

const menuItemStyle: React.CSSProperties = {
  display: "block",
  padding: "9px 12px",
  fontSize: 13,
  color: "var(--text)",
  textDecoration: "none",
  borderRadius: 8,
  transition: "background 0.12s ease",
  cursor: "pointer",
  fontFamily: "var(--font-dm-sans, 'DM Sans'), sans-serif",
};