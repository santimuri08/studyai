// components/chat/ChatView.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import ExpandSheet from "@/components/chat/ExpandSheet";
import {
  downloadAssignment,
  downloadAssignments,
  downloadSchedule,
  downloadProgress,
} from "@/lib/download";

type Message = {
  id:        string;
  role:      "user" | "assistant";
  content:   string;
  cardType:  string | null;
  cardData:  unknown;
  createdAt: string;
};

interface Props {
  chatId:          string;
  initialMessages: Message[];
  userName:        string | null;
}

const STARTERS = [
  "My assignments",
  "Show my week",
  "How am I doing?",
  "Analyze new assignment",
];

export default function ChatView({ chatId, initialMessages, userName }: Props) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input,    setInput]    = useState("");
  const [loading,  setLoading]  = useState(false);

  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send(text?: string) {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;

    setInput("");
    setLoading(true);

    const tempUserId = `temp-${Date.now()}`;
    setMessages((p) => [
      ...p,
      { id: tempUserId, role: "user", content: msg,
        cardType: null, cardData: null, createdAt: new Date().toISOString() },
    ]);

    try {
      const res = await fetch("/api/chat", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ chatId, message: msg }),
      });
      if (!res.ok) throw new Error("Chat failed");
      const data = await res.json();
      setMessages((p) => [
        ...p,
        {
          id:        data.message.id,
          role:      "assistant",
          content:   data.message.content,
          cardType:  data.message.cardType ?? null,
          cardData:  data.message.cardData ?? null,
          createdAt: data.message.createdAt,
        },
      ]);
      router.refresh();
    } catch {
      setMessages((p) => [
        ...p,
        { id: `err-${Date.now()}`, role: "assistant",
          content: "Something went wrong. Try again?",
          cardType: null, cardData: null, createdAt: new Date().toISOString() },
      ]);
    } finally {
      setLoading(false);
    }
  }

  const isEmpty = messages.length === 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "28px 20px 0" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>

          {isEmpty && (
            <div style={{ textAlign: "center", padding: "80px 20px 40px" }}>
              <div style={{
                width: 56, height: 56, borderRadius: 16, margin: "0 auto 18px",
                background: "linear-gradient(135deg, var(--primary), #5b45e0)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 22, fontWeight: 800, color: "white",
                fontFamily: "var(--font-sora, 'Sora'), sans-serif",
                boxShadow: "0 8px 24px rgba(124,92,255,0.35)",
              }}>S</div>
              <h1 style={{
                fontSize: "1.8rem", fontWeight: 700,
                letterSpacing: "-0.025em", margin: "0 0 8px",
                fontFamily: "var(--font-sora, 'Sora'), sans-serif",
              }}>
                Hey {userName ? userName.split(" ")[0] : "there"} 👋
              </h1>
              <p style={{ fontSize: 14.5, color: "var(--text-muted)", marginBottom: 28 }}>
                What are we working on today?
              </p>
              <div style={{
                display: "flex", flexWrap: "wrap", gap: 8,
                justifyContent: "center", maxWidth: 520, margin: "0 auto",
              }}>
                {STARTERS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    disabled={loading}
                    style={{
                      padding: "9px 14px", fontSize: 13,
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid var(--border)", borderRadius: 999,
                      color: "var(--text)", cursor: "pointer",
                      fontFamily: "var(--font-dm-sans, 'DM Sans'), sans-serif",
                      transition: "background 0.15s ease, border-color 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(124,92,255,0.08)";
                      e.currentTarget.style.borderColor = "rgba(124,92,255,0.3)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                      e.currentTarget.style.borderColor = "var(--border)";
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <AnimatePresence initial={false}>
            {messages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
                style={{
                  display: "flex",
                  justifyContent: m.role === "user" ? "flex-end" : "flex-start",
                  marginBottom: 14,
                }}
              >
                <div style={{
                  maxWidth: m.cardType ? "92%" : "78%",
                  padding: "11px 15px",
                  fontSize: 14, lineHeight: 1.6, whiteSpace: "pre-wrap",
                  borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                  fontFamily: "var(--font-dm-sans, 'DM Sans'), sans-serif",
                  ...(m.role === "user"
                    ? {
                        background: "linear-gradient(135deg, var(--primary), #5b45e0)",
                        color: "white",
                        boxShadow: "0 4px 14px rgba(124,92,255,0.25)",
                      }
                    : {
                        background: "rgba(255,255,255,0.035)",
                        border: "1px solid var(--border)",
                        color: "var(--text)",
                      }),
                }}>
                  {m.content}
                  {m.cardType && <RichCard type={m.cardType} data={m.cardData} />}
                </div>
              </motion.div>
            ))}

            {loading && (
              <motion.div
                key="typing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ display: "flex", justifyContent: "flex-start", marginBottom: 14 }}
              >
                <div style={{
                  background: "rgba(255,255,255,0.035)",
                  border: "1px solid var(--border)",
                  borderRadius: "16px 16px 16px 4px",
                  padding: "14px 16px",
                  display: "flex", gap: 5,
                }}>
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--text-muted)" }}
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ repeat: Infinity, duration: 1, delay: i * 0.15 }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={endRef} />
        </div>
      </div>

      {/* Input */}
      <div style={{
        padding: "16px 20px 20px",
        borderTop: "1px solid var(--border)",
        background: "rgba(5,6,15,0.85)",
        backdropFilter: "blur(16px)",
        flexShrink: 0,
      }}>
        <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", gap: 8 }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="Ask anything…"
            disabled={loading}
            className="input"
            style={{ flex: 1 }}
          />
          <button
            onClick={() => send()}
            disabled={loading || !input.trim()}
            className="btn btn-primary"
            style={{ minWidth: 48, padding: "0 18px" }}
          >
            ↑
          </button>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Card dispatcher
// ──────────────────────────────────────────────────────────────────

function RichCard({ type, data }: { type: string; data: unknown }) {
  if (!data || typeof data !== "object") return null;
  const d = data as Record<string, unknown>;

  if (type === "undo" && typeof d.kind === "string" && typeof d.id === "string") {
    return (
      <UndoBanner
        kind={d.kind as "assignment" | "task"}
        id={d.id}
        title={String(d.title ?? "")}
      />
    );
  }
  if (type === "schedule"         && Array.isArray(d.tasks))        return <ScheduleCard data={d} />;
  if (type === "progress")                                          return <ProgressCard data={d} />;
  if (type === "assignment")                                        return <AssignmentCard data={d} />;
  if (type === "assignments_list" && Array.isArray(d.assignments))  return <AssignmentsListCard data={d} />;
  return null;
}

// ──────────────────────────────────────────────────────────────────
// Card: Assignment
// ──────────────────────────────────────────────────────────────────

type RawTask = { id?: string; name?: string; time?: string | null; completed?: boolean };

function AssignmentCard({ data }: { data: Record<string, unknown> }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const title      = String(data.title ?? "Assignment");
  const summary    = String(data.summary ?? "");
  const tasks      = Array.isArray(data.tasks) ? (data.tasks as RawTask[]) : [];
  const total      = typeof data.total === "string" ? data.total : undefined;
  const due        = typeof data.due   === "string" ? data.due   : undefined;
  const reqs       = Array.isArray(data.keyRequirements) ? (data.keyRequirements as string[]) : [];
  const visible    = tasks.slice(0, 4);
  const hasMore    = tasks.length > visible.length;

  async function toggleTask(taskId: string) {
    if (!taskId) return;
    await fetch(`/api/tasks/${taskId}/toggle`, { method: "POST" });
    router.refresh();
  }

  return (
    <>
      <div style={cardWrap}>
        <p style={cardLabel}>📄 {title}</p>
        {summary && <p style={cardSummary}>{summary}</p>}

        {visible.map((t, i) => (
          <TaskRow
            key={t.id ?? i}
            taskId={t.id}
            name={t.name ?? ""}
            time={t.time ?? null}
            completed={!!t.completed}
            onToggle={toggleTask}
          />
        ))}
        {hasMore && (
          <p style={{ ...cardHint, marginTop: 4 }}>
            + {tasks.length - visible.length} more — tap Expand
          </p>
        )}

        {(total || due) && (
          <div style={cardMeta}>
            {total && <div><span>Total</span><strong>{total}</strong></div>}
            {due   && <div><span>Due</span><strong>{due}</strong></div>}
          </div>
        )}

        <CardActions
          onExpand={() => setOpen(true)}
          onDownload={() => downloadAssignment({
            title, summary, due, total,
            tasks: tasks.map((t) => ({ name: t.name ?? "", time: t.time ?? null, completed: !!t.completed })),
            keyRequirements: reqs,
          })}
        />
      </div>

      <ExpandSheet open={open} onClose={() => setOpen(false)} title={title}>
        {summary && (
          <>
            <p style={expandSectionLabel}>Summary</p>
            <p style={{ fontSize: 14, lineHeight: 1.65, color: "var(--text)", marginBottom: 18 }}>
              {summary}
            </p>
          </>
        )}

        {(total || due) && (
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 18 }}>
            {due   && <Pill label="Due" value={due} />}
            {total && <Pill label="Total" value={total} />}
          </div>
        )}

        {reqs.length > 0 && (
          <>
            <p style={expandSectionLabel}>Requirements</p>
            <ul style={{ paddingLeft: 20, marginBottom: 18, color: "var(--text)" }}>
              {reqs.map((r, i) => (
                <li key={i} style={{ fontSize: 14, lineHeight: 1.7 }}>{r}</li>
              ))}
            </ul>
          </>
        )}

        {tasks.length > 0 && (
          <>
            <p style={expandSectionLabel}>Tasks</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 8 }}>
              {tasks.map((t, i) => (
                <TaskRow
                  key={t.id ?? i}
                  taskId={t.id}
                  name={t.name ?? ""}
                  time={t.time ?? null}
                  completed={!!t.completed}
                  onToggle={toggleTask}
                />
              ))}
            </div>
          </>
        )}
      </ExpandSheet>
    </>
  );
}

// ──────────────────────────────────────────────────────────────────
// Card: Assignments list
// ──────────────────────────────────────────────────────────────────

type RawAssignment = {
  id?: string;
  title?: string;
  summary?: string;
  due?: string;
  total?: string;
  tasks?: RawTask[];
  keyRequirements?: string[];
};

function AssignmentsListCard({ data }: { data: Record<string, unknown> }) {
  const [open, setOpen] = useState(false);
  const list = Array.isArray(data.assignments) ? (data.assignments as RawAssignment[]) : [];

  return (
    <>
      <div style={cardWrap}>
        <p style={cardLabel}>📚 Assignments ({list.length})</p>
        {list.slice(0, 4).map((a, i) => (
          <div key={a.id ?? i} style={{ ...cardRow, flexDirection: "column", alignItems: "flex-start", gap: 2 }}>
            <strong style={{ fontSize: 13 }}>{a.title ?? ""}</strong>
            <span style={{ color: "var(--text-muted)", fontSize: 12 }}>{a.due ?? ""}</span>
          </div>
        ))}
        {list.length > 4 && (
          <p style={cardHint}>+ {list.length - 4} more — tap Expand</p>
        )}

        <CardActions
          onExpand={() => setOpen(true)}
          onDownload={() =>
            downloadAssignments(
              list.map((a) => ({
                title:   a.title ?? "Untitled",
                summary: a.summary,
                due:     a.due,
                total:   a.total,
                tasks:   (a.tasks ?? []).map((t) => ({
                  name: t.name ?? "",
                  time: t.time ?? null,
                  completed: !!t.completed,
                })),
                keyRequirements: a.keyRequirements ?? [],
              }))
            )
          }
        />
      </div>

      <ExpandSheet open={open} onClose={() => setOpen(false)} title={`Your assignments (${list.length})`}>
        {list.map((a, i) => (
          <div key={a.id ?? i} style={{
            marginBottom: 20, paddingBottom: 18,
            borderBottom: i < list.length - 1 ? "1px solid var(--border)" : "none",
          }}>
            <h3 style={{
              fontSize: 15, fontWeight: 700, marginBottom: 6,
              fontFamily: "var(--font-sora, 'Sora'), sans-serif",
              color: "var(--text)",
            }}>{a.title}</h3>
            {a.summary && (
              <p style={{ fontSize: 13.5, color: "var(--text-muted)", marginBottom: 8, lineHeight: 1.6 }}>
                {a.summary}
              </p>
            )}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {a.due   && <Pill label="Due"   value={a.due}   small />}
              {a.total && <Pill label="Total" value={a.total} small />}
            </div>
          </div>
        ))}
      </ExpandSheet>
    </>
  );
}

// ──────────────────────────────────────────────────────────────────
// Card: Schedule (grouped by date in expanded view)
// ──────────────────────────────────────────────────────────────────

type RawScheduleTask = {
  id?: string;
  title?: string;
  when?: string;
  hours?: string | null;
  date?: string | null;
  time?: string | null;
};

function ScheduleCard({ data }: { data: Record<string, unknown> }) {
  const [open, setOpen] = useState(false);
  const tasks = Array.isArray(data.tasks) ? (data.tasks as RawScheduleTask[]) : [];

  // Group by date for the expanded view
  const byDate: Record<string, RawScheduleTask[]> = {};
  for (const t of tasks) {
    const d = t.date ?? "Unscheduled";
    if (!byDate[d]) byDate[d] = [];
    byDate[d].push(t);
  }
  const sortedDates = Object.keys(byDate).sort();

  // Inline preview shows up to 5 entries
  const preview = tasks.slice(0, 5);
  const more    = tasks.length - preview.length;

  return (
    <>
      <div style={cardWrap}>
        <p style={cardLabel}>📅 Schedule</p>
        {preview.map((t, i) => (
          <div key={t.id ?? i} style={cardRow}>
            <span style={{ fontWeight: 600 }}>{t.title ?? ""}</span>
            <span style={{ color: "var(--text-muted)", fontSize: 12 }}>{t.when ?? ""}</span>
          </div>
        ))}
        {more > 0 && (
          <p style={cardHint}>+ {more} more — tap Expand</p>
        )}

        <CardActions
          onExpand={() => setOpen(true)}
          onDownload={() => downloadSchedule(
            tasks.map((t) => ({
              title: t.title ?? "Study block",
              when:  t.when,
              hours: t.hours ?? null,
              date:  t.date ?? null,
              time:  t.time ?? null,
            }))
          )}
        />
      </div>

      <ExpandSheet open={open} onClose={() => setOpen(false)} title="Your week">
        {tasks.length === 0 && (
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
            Nothing scheduled yet.
          </p>
        )}

        {sortedDates.map((date, di) => (
          <div key={date} style={{ marginBottom: di < sortedDates.length - 1 ? 22 : 0 }}>
            <p style={{
              ...expandSectionLabel,
              color: "var(--primary-text)",
              marginBottom: 10,
            }}>
              {date}
            </p>
            {byDate[date].map((t, i) => (
              <div key={t.id ?? `${date}-${i}`} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "10px 0",
                borderBottom: i < byDate[date].length - 1 ? "1px solid var(--border)" : "none",
              }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", marginBottom: 2 }}>
                    {t.title}
                  </p>
                  {t.time && (
                    <p style={{ fontSize: 12.5, color: "var(--text-muted)" }}>{t.time}</p>
                  )}
                </div>
                {t.hours && (
                  <span style={{
                    fontSize: 12, padding: "4px 10px",
                    background: "rgba(124,92,255,0.14)", border: "1px solid rgba(124,92,255,0.25)",
                    borderRadius: 999, color: "var(--primary-text)", fontWeight: 600,
                  }}>{t.hours}</span>
                )}
              </div>
            ))}
          </div>
        ))}
      </ExpandSheet>
    </>
  );
}

// ──────────────────────────────────────────────────────────────────
// Card: Progress
// ──────────────────────────────────────────────────────────────────

function ProgressCard({ data }: { data: Record<string, unknown> }) {
  const [open, setOpen] = useState(false);
  const streak     = Number(data.streak     ?? 0);
  const hours      = Number(data.hours      ?? 0);
  const goal       = Number(data.goal       ?? 0);
  const tasksDone  = Number(data.tasksDone  ?? 0);
  const tasksTotal = Number(data.tasksTotal ?? 0);
  const pct        = goal > 0 ? Math.min(100, Math.round((hours / goal) * 100)) : 0;

  return (
    <>
      <div style={cardWrap}>
        <p style={cardLabel}>📈 Progress</p>
        <div style={cardRow}><span>Streak</span><strong>{streak} days</strong></div>
        <div style={cardRow}><span>Hours</span><strong>{hours} / {goal}</strong></div>
        <div style={cardRow}><span>Tasks</span><strong>{tasksDone} / {tasksTotal}</strong></div>

        <CardActions
          onExpand={() => setOpen(true)}
          onDownload={() => downloadProgress({ streak, hours, goal, tasksDone, tasksTotal })}
        />
      </div>

      <ExpandSheet open={open} onClose={() => setOpen(false)} title="Your progress">
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <StatBlock label="Current streak"    value={`${streak} days`} />
          <StatBlock label="Hours this week"   value={`${hours} / ${goal}`} progress={pct} />
          <StatBlock label="Tasks completed"   value={`${tasksDone} / ${tasksTotal}`} />
        </div>
      </ExpandSheet>
    </>
  );
}

// ──────────────────────────────────────────────────────────────────
// Shared sub-components
// ──────────────────────────────────────────────────────────────────

function CardActions({ onExpand, onDownload }: { onExpand: () => void; onDownload: () => void }) {
  return (
    <div style={{
      display: "flex", gap: 6, marginTop: 10,
      paddingTop: 10, borderTop: "1px solid var(--border)",
    }}>
      <ActionButton onClick={onExpand}   label="Expand"   />
      <ActionButton onClick={onDownload} label="Download" />
    </div>
  );
}

function ActionButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        fontSize: 12.5, fontWeight: 600,
        padding: "7px 10px",
        background: "rgba(255,255,255,0.035)",
        border: "1px solid var(--border)",
        borderRadius: 8,
        color: "var(--text)",
        cursor: "pointer",
        fontFamily: "var(--font-sora, 'Sora'), sans-serif",
        transition: "background 0.15s ease, border-color 0.15s ease, color 0.15s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(124,92,255,0.1)";
        e.currentTarget.style.borderColor = "rgba(124,92,255,0.3)";
        e.currentTarget.style.color = "var(--primary-text)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "rgba(255,255,255,0.035)";
        e.currentTarget.style.borderColor = "var(--border)";
        e.currentTarget.style.color = "var(--text)";
      }}
    >
      {label}
    </button>
  );
}

function TaskRow({
  taskId, name, time, completed, onToggle,
}: {
  taskId:   string | undefined;
  name:     string;
  time:     string | null;
  completed: boolean;
  onToggle: (id: string) => void;
}) {
  const [checked, setChecked] = useState(completed);

  async function handleClick() {
    if (!taskId) return;
    setChecked((c) => !c); // optimistic
    onToggle(taskId);
  }

  return (
    <div
      onClick={handleClick}
      style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "6px 2px",
        cursor: taskId ? "pointer" : "default",
        userSelect: "none",
      }}
    >
      <div style={{
        width: 18, height: 18, borderRadius: 6, flexShrink: 0,
        border: checked ? "1.5px solid var(--primary)" : "1.5px solid rgba(255,255,255,0.2)",
        background: checked ? "var(--primary)" : "transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "white", fontSize: 11,
        transition: "background 0.15s ease, border-color 0.15s ease",
      }}>
        {checked && "✓"}
      </div>
      <span style={{
        flex: 1, fontSize: 13,
        color: checked ? "var(--text-muted)" : "var(--text)",
        textDecoration: checked ? "line-through" : "none",
        transition: "color 0.15s ease",
      }}>
        {name}
      </span>
      {time && (
        <span style={{ fontSize: 11.5, color: "var(--text-muted)" }}>{time}</span>
      )}
    </div>
  );
}

function Pill({ label, value, small }: { label: string; value: string; small?: boolean }) {
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: small ? "4px 10px" : "6px 12px",
      background: "rgba(124,92,255,0.1)",
      border: "1px solid rgba(124,92,255,0.22)",
      borderRadius: 999,
      fontSize: small ? 11.5 : 12.5,
      color: "var(--primary-text)",
      fontWeight: 600,
      fontFamily: "var(--font-sora, 'Sora'), sans-serif",
    }}>
      <span style={{ opacity: 0.7 }}>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function StatBlock({ label, value, progress }: { label: string; value: string; progress?: number }) {
  return (
    <div>
      <div style={{
        display: "flex", justifyContent: "space-between",
        fontSize: 13, color: "var(--text-muted)", marginBottom: 4,
      }}>
        <span>{label}</span>
        <strong style={{ color: "var(--text)" }}>{value}</strong>
      </div>
      {typeof progress === "number" && (
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Undo banner
// ──────────────────────────────────────────────────────────────────

function UndoBanner({
  kind, id, title,
}: { kind: "assignment" | "task"; id: string; title: string }) {
  const [restored, setRestored]   = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (restored || dismissed) return;
    const t = setTimeout(() => setDismissed(true), 8000);
    return () => clearTimeout(t);
  }, [restored, dismissed]);

  async function undo() {
    const res = await fetch("/api/undo", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ kind, id }),
    });
    if (res.ok) setRestored(true);
  }

  if (restored) {
    return (
      <div style={{ ...cardWrap, borderColor: "rgba(52,211,153,0.3)", background: "rgba(52,211,153,0.06)" }}>
        <p style={{ fontSize: 13, color: "#34d399" }}>
          Restored &quot;{title}&quot;.
        </p>
      </div>
    );
  }
  if (dismissed) return null;

  return (
    <div style={{
      ...cardWrap,
      display: "flex", flexDirection: "row", alignItems: "center",
      justifyContent: "space-between", gap: 10,
    }}>
      <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Undo delete?</span>
      <button
        onClick={undo}
        style={{
          background: "linear-gradient(135deg, var(--primary), #5b45e0)",
          border: "none", borderRadius: 8,
          padding: "6px 12px", fontSize: 12, fontWeight: 600, color: "white",
          cursor: "pointer",
          fontFamily: "var(--font-sora, 'Sora'), sans-serif",
        }}
      >
        Undo
      </button>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Shared styles
// ──────────────────────────────────────────────────────────────────

const cardWrap: React.CSSProperties = {
  marginTop: 10, padding: "12px 14px",
  background: "rgba(124,92,255,0.06)",
  border: "1px solid rgba(124,92,255,0.18)",
  borderRadius: 12,
  display: "flex", flexDirection: "column", gap: 4,
};

const cardLabel: React.CSSProperties = {
  fontSize: 11, fontWeight: 700,
  color: "var(--primary-text)",
  letterSpacing: "0.08em", textTransform: "uppercase",
  marginBottom: 8,
  fontFamily: "var(--font-sora, 'Sora'), sans-serif",
};

const cardRow: React.CSSProperties = {
  display: "flex", justifyContent: "space-between", alignItems: "center",
  fontSize: 13, padding: "4px 0",
};

const cardSummary: React.CSSProperties = {
  fontSize: 13, color: "var(--text-muted)", marginBottom: 8, lineHeight: 1.55,
};

const cardHint: React.CSSProperties = {
  fontSize: 11.5, color: "var(--text-faint)", padding: "4px 2px",
};

const cardMeta: React.CSSProperties = {
  marginTop: 8, paddingTop: 8, borderTop: "1px solid var(--border)",
  display: "flex", gap: 16, fontSize: 12.5, flexWrap: "wrap",
  color: "var(--text-muted)",
};

const expandSectionLabel: React.CSSProperties = {
  fontSize: 11, fontWeight: 700,
  color: "var(--primary-text)",
  letterSpacing: "0.1em", textTransform: "uppercase",
  marginBottom: 8,
  fontFamily: "var(--font-sora, 'Sora'), sans-serif",
};