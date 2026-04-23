"use client";

// app/dashboard/page.tsx
// Pure chat-first dashboard with:
// - Task state (complete, delete, auto-hide past-due)
// - Assignment state (list, details, delete)
// - Expandable modal for schedule / progress / assignment cards
// - Downloads on all three card types
// - Warm multi-bubble onboarding

import { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Send,
  Plus,
  Flame,
  FileText,
  Calendar as CalendarIcon,
  Download,
  X,
  ChevronRight,
  Trash2,
  Maximize2,
} from "lucide-react";

import ScheduleCard, { type Task } from "../../components/dashboard/Schedulecard";
import ProgressCard from "../../components/dashboard/Progresscard";

// ------------------------------------------------------------------
// Types
// ------------------------------------------------------------------

type Assignment = {
  id: string;
  title: string;
  summary: string;
  tasks: { name: string; time: string }[];
  total: string;
  due: string;
  completed?: boolean;
};

type ExpandedView =
  | { kind: "schedule" }
  | { kind: "progress" }
  | { kind: "assignment-list" }
  | { kind: "assignment-detail"; id: string }
  | null;

type CardData =
  | { kind: "schedule" }
  | { kind: "progress" }
  | { kind: "assignment-list" }
  | { kind: "assignment"; assignmentId: string };

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  card?: CardData;
  icon?: "file" | "calendar" | "download";
};

// ------------------------------------------------------------------
// Constants
// ------------------------------------------------------------------

const SUGGESTIONS = [
  { label: "My assignments", prompt: "What assignments do I have?" },
  { label: "Show my week", prompt: "Show me my schedule for this week." },
  { label: "How am I doing?", prompt: "How am I doing this week?" },
  {
    label: "Analyze new assignment",
    prompt: "I want to analyze a new assignment.",
  },
];

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------

const uid = () => Math.random().toString(36).slice(2, 10);

function buildICS(tasks: Task[]): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const fmt = (d: Date) =>
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(
      d.getUTCHours()
    )}${pad(d.getUTCMinutes())}00Z`;

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//StudyAI//EN",
    "CALSCALE:GREGORIAN",
  ];

  tasks.forEach((t, i) => {
    const start = t.start ? new Date(t.start) : new Date();
    const end = t.end
      ? new Date(t.end)
      : new Date(start.getTime() + 60 * 60 * 1000);

    lines.push(
      "BEGIN:VEVENT",
      `UID:studyai-${t.id}-${i}@studyai`,
      `DTSTAMP:${fmt(new Date())}`,
      `DTSTART:${fmt(start)}`,
      `DTEND:${fmt(end)}`,
      `SUMMARY:${(t.title || "Study block").replace(/\n/g, " ")}`,
      `DESCRIPTION:${(t.description || "").replace(/\n/g, " ")}`,
      "END:VEVENT"
    );
  });

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

function downloadFile(filename: string, content: string, mime = "text/plain") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

type Intent =
  | { kind: "schedule" }
  | { kind: "progress" }
  | { kind: "export" }
  | { kind: "analyze" }
  | { kind: "assignments-list" }
  | { kind: "complete"; target?: string }
  | { kind: "delete"; target?: string }
  | { kind: "chat" };

function detectIntent(text: string): Intent {
  const t = text.toLowerCase().trim();

  const completeMatch = t.match(
    /\b(?:finished|done(?:\s+with)?|completed|complete|mark(?:ed)?\s+(?:as\s+)?(?:done|complete|completed))\b\s*(.+)?/
  );
  if (completeMatch) {
    return { kind: "complete", target: completeMatch[1]?.trim() };
  }

  const deleteMatch = t.match(
    /\b(?:delete|remove|cancel|drop|get\s+rid\s+of)\b\s*(.+)?/
  );
  if (deleteMatch) {
    return { kind: "delete", target: deleteMatch[1]?.trim() };
  }

  // Assignment list queries
  if (
    /\b(what|which|list|show|my)\b.*\b(assignments?|homework|papers?|essays?)\b/.test(
      t
    ) ||
    /\b(assignments?|homework)\b.*\b(do\s+i\s+have|list|all)\b/.test(t) ||
    /^(?:assignments?|my\s+assignments?)$/.test(t)
  ) {
    return { kind: "assignments-list" };
  }

  if (/\b(progress|streak|how\s+am\s+i\s+doing|stats)\b/.test(t)) {
    return { kind: "progress" };
  }
  if (/\b(download|export|\.ics|\.csv|\.pdf|calendar\s+file)\b/.test(t)) {
    return { kind: "export" };
  }
  if (/\b(schedule|week|plan|agenda|due|upcoming|calendar)\b/.test(t)) {
    return { kind: "schedule" };
  }
  if (/\b(analyze|paste|new\s+assignment)\b/.test(t)) {
    return { kind: "analyze" };
  }
  return { kind: "chat" };
}

function findTask(tasks: Task[], target: string | undefined): Task | null {
  if (!target) return null;
  const t = target.toLowerCase();
  const clean = t
    .replace(/^(my|the|that|a|an)\s+/g, "")
    .replace(/\s+(assignment|task|homework|hw)$/g, "")
    .trim();
  if (!clean) return null;

  const bySubject = tasks.find((task) =>
    task.subject ? task.subject.toLowerCase().includes(clean) : false
  );
  if (bySubject) return bySubject;

  const byTitle = tasks.find((task) =>
    task.title.toLowerCase().includes(clean)
  );
  if (byTitle) return byTitle;

  const words = clean.split(/\s+/);
  for (const w of words) {
    if (w.length < 3) continue;
    const match = tasks.find((task) => task.title.toLowerCase().includes(w));
    if (match) return match;
  }

  return null;
}

function findAssignment(
  assignments: Assignment[],
  target: string | undefined
): Assignment | null {
  if (!target) return null;
  const t = target.toLowerCase();
  const clean = t
    .replace(/^(my|the|that|a|an)\s+/g, "")
    .replace(/\s+(assignment|task|homework|hw)$/g, "")
    .trim();
  if (!clean) return null;

  const byTitle = assignments.find((a) => a.title.toLowerCase().includes(clean));
  if (byTitle) return byTitle;

  const words = clean.split(/\s+/);
  for (const w of words) {
    if (w.length < 3) continue;
    const match = assignments.find((a) => a.title.toLowerCase().includes(w));
    if (match) return match;
  }

  return null;
}

// ------------------------------------------------------------------
// AssignmentDetail — used both inline and expanded
// ------------------------------------------------------------------

function AssignmentDetail({
  data,
  onDelete,
  onDownload,
  onExpand,
  expanded = false,
}: {
  data: Assignment;
  onDelete?: (id: string) => void;
  onDownload?: (data: Assignment) => void;
  onExpand?: () => void;
  expanded?: boolean;
}) {
  return (
    <div
      className={onExpand ? "glass-card card-clickable" : "glass-card"}
      style={{ padding: expanded ? "22px 24px" : "14px 16px" }}
      onClick={(e) => {
        if (onExpand && !(e.target as HTMLElement).closest("button")) {
          onExpand();
        }
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 10,
          marginBottom: expanded ? 14 : 10,
        }}
      >
        <div
          style={{
            width: expanded ? 40 : 32,
            height: expanded ? 40 : 32,
            borderRadius: "var(--radius-md)",
            background: "rgba(124, 92, 255, 0.12)",
            border: "1px solid rgba(124, 92, 255, 0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <FileText
            size={expanded ? 18 : 14}
            style={{ color: "var(--primary-text)" }}
          />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontFamily: "'Sora', sans-serif",
              fontSize: expanded ? 17 : 14,
              fontWeight: 600,
              color: "var(--text)",
              letterSpacing: "-0.01em",
              lineHeight: 1.25,
            }}
          >
            {data.title}
          </div>
          <div
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: expanded ? 12 : 11,
              color: "var(--primary-text)",
              marginTop: 4,
              fontWeight: 500,
            }}
          >
            Due: {data.due}
          </div>
        </div>
        {onExpand && !expanded && (
          <Maximize2
            size={13}
            style={{
              color: "var(--text-muted)",
              opacity: 0.6,
              marginTop: 4,
              flexShrink: 0,
            }}
          />
        )}
      </div>

      <p
        style={{
          fontSize: expanded ? 14 : 12,
          color: "var(--text-muted)",
          marginBottom: expanded ? 16 : 10,
          lineHeight: 1.6,
        }}
      >
        {data.summary}
      </p>

      <div
        className="eyebrow"
        style={{
          fontSize: 10,
          padding: "3px 10px",
          marginBottom: 8,
        }}
      >
        Breakdown ({data.tasks.length})
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {data.tasks.map((task, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: expanded ? "10px 14px" : "6px 10px",
              background: "rgba(255,255,255,0.03)",
              borderRadius: "var(--radius-sm)",
              fontSize: expanded ? 13 : 12,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            <span style={{ color: "var(--text)" }}>{task.name}</span>
            <span
              style={{
                color: "var(--text-muted)",
                fontWeight: 500,
                marginLeft: 12,
                flexShrink: 0,
              }}
            >
              {task.time}
            </span>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: expanded ? 14 : 10,
          paddingTop: expanded ? 14 : 10,
          borderTop: "1px solid var(--border)",
          display: "flex",
          justifyContent: "space-between",
          fontSize: expanded ? 13 : 11,
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <span style={{ color: "var(--text-muted)" }}>
          Estimated total
        </span>
        <span style={{ color: "var(--text)", fontWeight: 600 }}>
          {data.total}
        </span>
      </div>

      {(onDownload || onDelete) && (
        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
          {onDownload && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDownload(data);
              }}
              className="btn btn-ghost"
              style={{ flex: 1, fontSize: 12, padding: "7px 10px" }}
            >
              <Download size={12} /> Download
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(data.id);
              }}
              className="btn btn-secondary"
              style={{
                flex: 1,
                fontSize: 12,
                padding: "7px 10px",
                color: "#f9a8d4",
              }}
            >
              <Trash2 size={11} /> Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ------------------------------------------------------------------
// AssignmentList — compact list of all assignments
// ------------------------------------------------------------------

function AssignmentList({
  assignments,
  onSelect,
  onExpand,
  expanded = false,
}: {
  assignments: Assignment[];
  onSelect: (id: string) => void;
  onExpand?: () => void;
  expanded?: boolean;
}) {
  return (
    <div
      className={onExpand ? "glass-card card-clickable" : "glass-card"}
      style={{ padding: expanded ? "20px 22px" : "14px 16px" }}
      onClick={(e) => {
        if (onExpand && !(e.target as HTMLElement).closest("button")) {
          onExpand();
        }
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        <div
          className="eyebrow"
          style={{ fontSize: expanded ? 11 : 10, padding: "3px 10px" }}
        >
          {assignments.length === 0
            ? "No assignments yet"
            : `Your assignments (${assignments.length})`}
        </div>
        {onExpand && !expanded && assignments.length > 0 && (
          <Maximize2
            size={12}
            style={{ color: "var(--text-muted)", opacity: 0.6 }}
          />
        )}
      </div>

      {assignments.length === 0 ? (
        <div
          style={{
            padding: "18px 10px",
            textAlign: "center",
            color: "var(--text-muted)",
            fontSize: 13,
            fontFamily: "'DM Sans', sans-serif",
            lineHeight: 1.5,
          }}
        >
          Paste one in or tap the + button to analyze a new assignment.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {assignments.map((a) => (
            <button
              key={a.id}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(a.id);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: expanded ? "12px 14px" : "10px 12px",
                background: "rgba(124, 92, 255, 0.06)",
                borderLeft: "2px solid var(--primary)",
                borderRadius: "var(--radius-sm)",
                cursor: "none",
                transition: "var(--transition)",
                textAlign: "left",
                fontFamily: "'DM Sans', sans-serif",
                width: "100%",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(124, 92, 255, 0.12)";
                e.currentTarget.style.transform = "translateX(2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(124, 92, 255, 0.06)";
                e.currentTarget.style.transform = "translateX(0)";
              }}
            >
              <FileText
                size={14}
                style={{ color: "var(--primary-text)", flexShrink: 0 }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: expanded ? 14 : 13,
                    color: "var(--text)",
                    fontWeight: 500,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {a.title}
                </div>
                <div
                  style={{
                    fontSize: expanded ? 12 : 11,
                    color: "var(--text-muted)",
                    marginTop: 2,
                  }}
                >
                  Due {a.due} · {a.total}
                </div>
              </div>
              <ChevronRight
                size={14}
                style={{ color: "var(--text-muted)", flexShrink: 0 }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ------------------------------------------------------------------
// ExpandedModal — full-screen sheet for any card type
// ------------------------------------------------------------------

function ExpandedModal({
  onClose,
  children,
}: {
  onClose: () => void;
  children: React.ReactNode;
}) {
  // Lock scroll on body while open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(5, 6, 15, 0.8)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        zIndex: 60,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        padding: 0,
        animation: "fadeIn 0.2s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 640,
          maxHeight: "92vh",
          overflowY: "auto",
          background: "rgba(11, 13, 26, 0.98)",
          border: "1px solid var(--border)",
          borderRadius: "24px 24px 0 0",
          padding: "14px 14px calc(20px + env(safe-area-inset-bottom)) 14px",
          animation: "slideUp 0.28s cubic-bezier(0.34, 1.28, 0.64, 1)",
        }}
      >
        {/* Drag handle */}
        <div
          style={{
            width: 40,
            height: 4,
            background: "rgba(255,255,255,0.15)",
            borderRadius: 2,
            margin: "0 auto 16px",
          }}
        />
        {/* Close button */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: 8,
          }}
        >
          <button
            onClick={onClose}
            className="btn-icon"
            aria-label="Close"
            style={{ padding: 8 }}
          >
            <X size={14} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// TipBubble
// ------------------------------------------------------------------

function TipBubble({
  icon,
  children,
}: {
  icon?: "file" | "calendar" | "download";
  children: React.ReactNode;
}) {
  const Icon =
    icon === "file"
      ? FileText
      : icon === "calendar"
      ? CalendarIcon
      : icon === "download"
      ? Download
      : null;
  return (
    <div
      className="chat-bubble-ai"
      style={{
        padding: "10px 14px",
        fontSize: 13.5,
        color: "var(--text)",
        fontFamily: "'DM Sans', sans-serif",
        lineHeight: 1.55,
        display: "flex",
        alignItems: "flex-start",
        gap: 9,
      }}
    >
      {Icon && (
        <Icon
          size={14}
          style={{
            color: "var(--primary-text)",
            marginTop: 2,
            flexShrink: 0,
          }}
        />
      )}
      <div>{children}</div>
    </div>
  );
}

// ------------------------------------------------------------------
// Main page
// ------------------------------------------------------------------

export default function DashboardPage() {
  // --- Tasks (scheduled study blocks) ---
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "t1",
      title: "Calculus HW Ch. 4",
      when: "Mon 6-8 PM",
      hours: 2,
      subject: "math",
      start: new Date(Date.now() + 24 * 3600e3).toISOString(),
      end: new Date(Date.now() + 24 * 3600e3 + 2 * 3600e3).toISOString(),
    },
    {
      id: "t2",
      title: "English essay draft",
      when: "Wed 4-7 PM",
      hours: 3,
      subject: "english",
      start: new Date(Date.now() + 3 * 24 * 3600e3).toISOString(),
      end: new Date(Date.now() + 3 * 24 * 3600e3 + 3 * 3600e3).toISOString(),
    },
    {
      id: "t3",
      title: "Bio lab report",
      when: "Fri 2-3:30 PM",
      hours: 1.5,
      subject: "science",
      start: new Date(Date.now() + 5 * 24 * 3600e3).toISOString(),
      end: new Date(Date.now() + 5 * 24 * 3600e3 + 1.5 * 3600e3).toISOString(),
    },
  ]);

  // --- Assignments (the big deliverables) ---
  const [assignments, setAssignments] = useState<Assignment[]>([
    {
      id: "a1",
      title: "Climate Policy Research Paper",
      summary:
        "6-page APA paper analyzing socioeconomic impacts of climate policy in developing nations. Requires 5 peer-reviewed sources and two competing theoretical frameworks.",
      tasks: [
        { name: "Find 5 peer-reviewed sources", time: "90 min" },
        { name: "Write outline", time: "45 min" },
        { name: "Draft intro + body", time: "2h" },
        { name: "Revise & citations", time: "1h" },
      ],
      total: "~6.5 hours",
      due: "Friday 11:59 PM",
    },
    {
      id: "a2",
      title: "Calculus Problem Set 4",
      summary:
        "Chapter 4 problems covering integration by parts, partial fractions, and improper integrals. Show all work.",
      tasks: [
        { name: "Review lecture notes", time: "30 min" },
        { name: "Problems 1-8 (integration)", time: "1h" },
        { name: "Problems 9-12 (partial fractions)", time: "45 min" },
      ],
      total: "~2 hours",
      due: "Monday 10 AM",
    },
  ]);

  const activeTasks = useMemo(() => {
    const now = Date.now();
    return tasks.filter((t) => {
      if (t.completed) return false;
      if (t.end && new Date(t.end).getTime() < now) return false;
      return true;
    });
  }, [tasks]);

  const activeAssignments = useMemo(
    () => assignments.filter((a) => !a.completed),
    [assignments]
  );

  const tasksDone = tasks.filter((t) => t.completed).length;
  const tasksTotal = tasks.length;

  const [streak] = useState(3);
  const [hours] = useState(4.5);
  const [goal] = useState(15);

  // --- Messages ---
  const [messages, setMessages] = useState<Message[]>([
    {
      id: uid(),
      role: "assistant",
      content:
        "Hey 👋 I'm StudyAI. Think of me as your study buddy that never sleeps — I'll help you break down assignments, plan your week, and keep track of what's due.",
    },
    {
      id: uid(),
      role: "assistant",
      icon: "file",
      content:
        "**Paste an assignment** and I'll turn it into clear tasks with time estimates. Works for essays, problem sets, labs — anything.",
    },
    {
      id: uid(),
      role: "assistant",
      icon: "calendar",
      content:
        "**Ask about your schedule or assignments** — try \"what's due Friday?\" or \"what assignments do I have?\" Tap any card to see more detail.",
    },
    {
      id: uid(),
      role: "assistant",
      icon: "download",
      content:
        "**Export anytime** — say \"download my schedule\" and I'll give you a calendar file you can import into Apple, Google, or Outlook.",
    },
    {
      id: uid(),
      role: "assistant",
      content:
        "When you finish a task, tell me (\"I finished my essay\") and I'll clean it off your list. Same if you want to delete one.",
    },
    {
      id: uid(),
      role: "assistant",
      content: "Tap a suggestion below to get started, or just type what you need.",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<ExpandedView>(null);

  const endRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // --- Downloads ---

  const handleScheduleDownload = (format: "ics" | "csv" | "txt") => {
    if (format === "ics") {
      downloadFile("studyai-week.ics", buildICS(activeTasks), "text/calendar");
    } else if (format === "csv") {
      const csv =
        "Title,When,Hours,Subject\n" +
        activeTasks
          .map(
            (t) => `"${t.title}","${t.when}",${t.hours},${t.subject || ""}`
          )
          .join("\n");
      downloadFile("studyai-week.csv", csv, "text/csv");
    } else {
      const txt = activeTasks
        .map((t) => `${t.when} - ${t.title} (${t.hours}h)`)
        .join("\n");
      downloadFile("studyai-week.txt", txt);
    }
  };

  const handleProgressDownload = () => {
    const pct = goal > 0 ? Math.round((hours / goal) * 100) : 0;
    const report =
      `StudyAI Progress Report\n` +
      `========================\n\n` +
      `Streak:     ${streak} days\n` +
      `Hours:      ${hours}h\n` +
      `Goal:       ${goal}h (${pct}%)\n` +
      `Tasks:      ${tasksDone}/${tasksTotal} done\n\n` +
      `Completed tasks:\n` +
      tasks
        .filter((t) => t.completed)
        .map((t) => `  ✓ ${t.title} (${t.when})`)
        .join("\n") +
      `\n\nActive tasks:\n` +
      activeTasks.map((t) => `  • ${t.title} (${t.when})`).join("\n");
    downloadFile("studyai-progress.txt", report);
  };

  const handleAssignmentDownload = (a: Assignment) => {
    const txt =
      `${a.title}\n` +
      `${"=".repeat(a.title.length)}\n\n` +
      `${a.summary}\n\n` +
      `Tasks:\n` +
      a.tasks.map((t) => `  • ${t.name} — ${t.time}`).join("\n") +
      `\n\nTotal: ${a.total}\n` +
      `Due: ${a.due}\n`;
    const safeName = a.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
    downloadFile(`${safeName}.txt`, txt);
  };

  // --- Mutations ---

  const completeTask = (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: true } : t))
    );
    setMessages((p) => [
      ...p,
      {
        id: uid(),
        role: "assistant",
        content: `Nice — marked "${task.title}" as done. Keep it up! 🎯`,
      },
    ]);
  };

  const deleteTask = (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setMessages((p) => [
      ...p,
      {
        id: uid(),
        role: "assistant",
        content: `Removed "${task.title}" from your list.`,
      },
    ]);
  };

  const deleteAssignment = (id: string) => {
    const a = assignments.find((x) => x.id === id);
    if (!a) return;
    setAssignments((prev) => prev.filter((x) => x.id !== id));
    if (expanded?.kind === "assignment-detail" && expanded.id === id) {
      setExpanded(null);
    }
    setMessages((p) => [
      ...p,
      {
        id: uid(),
        role: "assistant",
        content: `Removed "${a.title}" from your assignments.`,
      },
    ]);
  };

  // --- Send ---

  const sendMessage = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;

    setInput("");
    setMessages((p) => [...p, { id: uid(), role: "user", content: msg }]);
    setLoading(true);

    const intent = detectIntent(msg);

    // Complete
    if (intent.kind === "complete") {
      const target = findTask(activeTasks, intent.target);
      setLoading(false);
      if (target) {
        completeTask(target.id);
      } else if (intent.target) {
        // maybe they meant an assignment
        const asn = findAssignment(activeAssignments, intent.target);
        if (asn) {
          setAssignments((prev) =>
            prev.map((x) => (x.id === asn.id ? { ...x, completed: true } : x))
          );
          setMessages((p) => [
            ...p,
            {
              id: uid(),
              role: "assistant",
              content: `Awesome — marked "${asn.title}" as done! 🎉`,
            },
          ]);
        } else {
          setMessages((p) => [
            ...p,
            {
              id: uid(),
              role: "assistant",
              content: `I couldn't find "${intent.target}". Here's what you have:`,
              card: { kind: "schedule" },
            },
          ]);
        }
      } else {
        setMessages((p) => [
          ...p,
          {
            id: uid(),
            role: "assistant",
            content: "Which one did you finish? Tell me the name.",
            card: { kind: "schedule" },
          },
        ]);
      }
      return;
    }

    // Delete
    if (intent.kind === "delete") {
      setLoading(false);
      const targetTask = findTask(activeTasks, intent.target);
      if (targetTask) {
        deleteTask(targetTask.id);
        return;
      }
      const targetAsn = findAssignment(activeAssignments, intent.target);
      if (targetAsn) {
        deleteAssignment(targetAsn.id);
        return;
      }
      if (intent.target) {
        setMessages((p) => [
          ...p,
          {
            id: uid(),
            role: "assistant",
            content: `I couldn't find "${intent.target}" in your list.`,
          },
        ]);
      } else {
        setMessages((p) => [
          ...p,
          {
            id: uid(),
            role: "assistant",
            content: "Which one should I remove?",
            card: { kind: "schedule" },
          },
        ]);
      }
      return;
    }

    if (intent.kind === "assignments-list") {
      setLoading(false);
      setMessages((p) => [
        ...p,
        {
          id: uid(),
          role: "assistant",
          content:
            activeAssignments.length === 0
              ? "You don't have any assignments yet. Paste one in and I'll break it down:"
              : `Here are your ${activeAssignments.length} assignment${
                  activeAssignments.length === 1 ? "" : "s"
                }. Tap one for the full breakdown:`,
          card: { kind: "assignment-list" },
        },
      ]);
      return;
    }

    if (intent.kind === "schedule" || intent.kind === "export") {
      setLoading(false);
      setMessages((p) => [
        ...p,
        {
          id: uid(),
          role: "assistant",
          content:
            intent.kind === "export"
              ? "Here's your schedule — pick a format to download:"
              : activeTasks.length > 0
              ? "Here's your week at a glance — tap to expand:"
              : "You're all caught up — nothing on the schedule.",
          card: { kind: "schedule" },
        },
      ]);
      return;
    }

    if (intent.kind === "progress") {
      setLoading(false);
      setMessages((p) => [
        ...p,
        {
          id: uid(),
          role: "assistant",
          content:
            streak > 0
              ? `You're on a ${streak}-day streak — keep it going!`
              : "Here's how you're doing this week:",
          card: { kind: "progress" },
        },
      ]);
      return;
    }

    if (intent.kind === "analyze") {
      setLoading(false);
      setMessages((p) => [
        ...p,
        {
          id: uid(),
          role: "assistant",
          content:
            "Tap the + button to upload your assignment, or paste the text into the box below. I'll break it down for you.",
        },
      ]);
      return;
    }

    // API fallback
    try {
      const r = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg }),
      });
      if (r.ok) {
        const d = await r.json();
        if (d.reply) {
          setMessages((p) => [
            ...p,
            { id: uid(), role: "assistant", content: d.reply as string },
          ]);
        }
      } else {
        throw new Error("API error");
      }
    } catch {
      setMessages((p) => [
        ...p,
        {
          id: uid(),
          role: "assistant",
          content:
            "I can help with planning, analyzing assignments, or exporting your schedule. Try one of the suggestions, or just tell me what you need.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setInput(`Analyze this assignment:\n\n${text.slice(0, 2000)}`);
    e.target.value = "";
  };

  const showSuggestions = messages.every((m) => m.role === "assistant");

  const renderContent = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} style={{ color: "var(--text)", fontWeight: 600 }}>
            {part.slice(2, -2)}
          </strong>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  // ----------------------------------------------------------------
  // Render
  // ----------------------------------------------------------------

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100dvh",
        color: "var(--text)",
        position: "relative",
      }}
    >
      {/* HEADER */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 20px",
          borderBottom: "1px solid var(--border)",
          background: "rgba(11, 13, 26, 0.6)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          flexShrink: 0,
        }}
      >
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            textDecoration: "none",
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: "var(--radius-md)",
              background: "linear-gradient(135deg, var(--primary), #5b45e0)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "'Sora', sans-serif",
              fontWeight: 700,
              fontSize: 15,
              color: "white",
              boxShadow: "0 4px 14px rgba(124,92,255,0.28)",
            }}
          >
            S
          </div>
          <div style={{ lineHeight: 1.2 }}>
            <div
              className="gradient-text"
              style={{
                fontFamily: "'Sora', sans-serif",
                fontWeight: 700,
                fontSize: 16,
                letterSpacing: "-0.01em",
              }}
            >
              StudyAI
            </div>
            <div
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 10,
                color: "var(--text-muted)",
              }}
            >
              Online · Claude
            </div>
          </div>
        </Link>

        <div
          className="badge"
          style={{
            background: "rgba(236, 72, 153, 0.12)",
            color: "#f9a8d4",
            border: "1px solid rgba(236, 72, 153, 0.25)",
            gap: 4,
          }}
        >
          <Flame size={11} /> {streak}d streak
        </div>
      </header>

      {/* MESSAGES */}
      <main
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "20px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        {messages.map((m) => (
          <div
            key={m.id}
            style={{
              display: "flex",
              justifyContent: m.role === "user" ? "flex-end" : "flex-start",
            }}
          >
            <div style={{ maxWidth: "88%" }}>
              {m.role === "user" ? (
                <div
                  className="chat-bubble-user"
                  style={{
                    padding: "10px 14px",
                    fontSize: 14,
                    color: "white",
                    fontFamily: "'DM Sans', sans-serif",
                    whiteSpace: "pre-wrap",
                    lineHeight: 1.5,
                  }}
                >
                  {m.content}
                </div>
              ) : (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                  {m.content && m.icon ? (
                    <TipBubble icon={m.icon}>
                      {renderContent(m.content)}
                    </TipBubble>
                  ) : m.content ? (
                    <div
                      className="chat-bubble-ai"
                      style={{
                        padding: "10px 14px",
                        fontSize: 14,
                        color: "var(--text)",
                        fontFamily: "'DM Sans', sans-serif",
                        whiteSpace: "pre-wrap",
                        lineHeight: 1.55,
                      }}
                    >
                      {renderContent(m.content)}
                    </div>
                  ) : null}

                  {m.card?.kind === "schedule" && (
                    <ScheduleCard
                      tasks={activeTasks}
                      onDownload={handleScheduleDownload}
                      onComplete={completeTask}
                      onDelete={deleteTask}
                      onExpand={() => setExpanded({ kind: "schedule" })}
                    />
                  )}
                  {m.card?.kind === "progress" && (
                    <ProgressCard
                      streak={streak}
                      hours={hours}
                      goal={goal}
                      tasksDone={tasksDone}
                      tasksTotal={tasksTotal}
                      onDownload={handleProgressDownload}
                      onExpand={() => setExpanded({ kind: "progress" })}
                    />
                  )}
                  {m.card?.kind === "assignment-list" && (
                    <AssignmentList
                      assignments={activeAssignments}
                      onSelect={(id) =>
                        setExpanded({ kind: "assignment-detail", id })
                      }
                      onExpand={
                        activeAssignments.length > 0
                          ? () => setExpanded({ kind: "assignment-list" })
                          : undefined
                      }
                    />
                  )}
                  {m.card?.kind === "assignment" &&
                    (() => {
                      const card = m.card;
                      const a = assignments.find(
                        (x) => x.id === card.assignmentId
                      );
                      return a ? (
                        <AssignmentDetail
                          data={a}
                          onDownload={handleAssignmentDownload}
                          onDelete={deleteAssignment}
                          onExpand={() =>
                            setExpanded({
                              kind: "assignment-detail",
                              id: a.id,
                            })
                          }
                        />
                      ) : null;
                    })()}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div
              className="chat-bubble-ai ai-processing"
              style={{
                padding: "12px 16px",
                display: "flex",
                gap: 6,
                alignItems: "center",
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "var(--primary-text)",
                  animation: "pulse 1.4s ease-in-out infinite",
                }}
              />
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "var(--primary-text)",
                  animation: "pulse 1.4s ease-in-out infinite 0.2s",
                }}
              />
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "var(--primary-text)",
                  animation: "pulse 1.4s ease-in-out infinite 0.4s",
                }}
              />
            </div>
          </div>
        )}

        <div ref={endRef} />
      </main>

      {/* SUGGESTION CHIPS */}
      {showSuggestions && (
        <div
          style={{
            padding: "0 16px 10px",
            display: "flex",
            gap: 8,
            overflowX: "auto",
            flexShrink: 0,
          }}
        >
          {SUGGESTIONS.map((s) => (
            <button
              key={s.label}
              onClick={() => sendMessage(s.prompt)}
              className="btn btn-secondary"
              style={{
                flexShrink: 0,
                fontSize: 12,
                padding: "7px 14px",
                borderRadius: 9999,
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}

      {/* INPUT BAR */}
      <footer
        style={{
          padding: "10px 14px",
          paddingBottom: "calc(10px + env(safe-area-inset-bottom))",
          borderTop: "1px solid var(--border)",
          background: "rgba(11, 13, 26, 0.75)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.md"
            onChange={handleFileUpload}
            style={{ display: "none" }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn-icon"
            aria-label="Attach assignment"
            style={{ padding: 10 }}
          >
            <Plus size={16} />
          </button>
          <input
            className="input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Ask anything…"
            style={{ flex: 1, borderRadius: 9999 }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className="btn btn-primary"
            aria-label="Send message"
            style={{ padding: 10, borderRadius: "50%", width: 40, height: 40 }}
          >
            <Send size={14} />
          </button>
        </div>
      </footer>

      {/* EXPANDED MODAL */}
      {expanded && (
        <ExpandedModal onClose={() => setExpanded(null)}>
          {expanded.kind === "schedule" && (
            <ScheduleCard
              tasks={activeTasks}
              onDownload={handleScheduleDownload}
              onComplete={completeTask}
              onDelete={deleteTask}
              expanded
            />
          )}
          {expanded.kind === "progress" && (
            <ProgressCard
              streak={streak}
              hours={hours}
              goal={goal}
              tasksDone={tasksDone}
              tasksTotal={tasksTotal}
              onDownload={handleProgressDownload}
              expanded
              completedTasks={tasks
                .filter((t) => t.completed)
                .map((t) => ({ title: t.title, when: t.when }))}
              activeTasks={activeTasks.map((t) => ({
                title: t.title,
                when: t.when,
              }))}
            />
          )}
          {expanded.kind === "assignment-list" && (
            <AssignmentList
              assignments={activeAssignments}
              onSelect={(id) => setExpanded({ kind: "assignment-detail", id })}
              expanded
            />
          )}
          {expanded.kind === "assignment-detail" &&
            (() => {
              const a = assignments.find((x) => x.id === expanded.id);
              return a ? (
                <AssignmentDetail
                  data={a}
                  onDownload={handleAssignmentDownload}
                  onDelete={deleteAssignment}
                  expanded
                />
              ) : null;
            })()}
        </ExpandedModal>
      )}

      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes pulse {
              0%, 100% { opacity: 0.3; transform: scale(0.8); }
              50%      { opacity: 1;   transform: scale(1.1); }
            }
            @keyframes fadeIn {
              from { opacity: 0; }
              to   { opacity: 1; }
            }
            @keyframes slideUp {
              from { transform: translateY(100%); }
              to   { transform: translateY(0); }
            }
          `,
        }}
      />
    </div>
  );
}