"use client";

// components/dashboard/ScheduleCard.tsx
// Expandable schedule card with complete/delete actions and downloads.

import { Download, Check, Trash2, Maximize2 } from "lucide-react";

export type Task = {
  id: string;
  title: string;
  when: string;
  hours: number;
  subject?: string;
  start?: string;
  end?: string;
  description?: string;
  completed?: boolean;
};

type Props = {
  tasks: Task[];
  onDownload: (format: "ics" | "csv" | "txt") => void;
  onComplete?: (id: string) => void;
  onDelete?: (id: string) => void;
  onExpand?: () => void;
  actions?: boolean;
  expanded?: boolean;
};

const subjectColor = (s?: string): string => {
  switch ((s || "").toLowerCase()) {
    case "math":
      return "#7C5CFF";
    case "english":
      return "#ec4899";
    case "science":
      return "#34d399";
    case "history":
      return "#f59e0b";
    default:
      return "#A78BFA";
  }
};

export default function ScheduleCard({
  tasks,
  onDownload,
  onComplete,
  onDelete,
  onExpand,
  actions = true,
  expanded = false,
}: Props) {
  return (
    <div
      className={onExpand ? "glass-card card-clickable" : "glass-card"}
      style={{ padding: expanded ? "20px 22px" : "14px 16px" }}
      onClick={(e) => {
        // Don't expand if clicking on an action button inside
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
          {expanded ? "Your full schedule" : "Your week"}
        </div>
        {onExpand && !expanded && (
          <Maximize2
            size={12}
            style={{ color: "var(--text-muted)", opacity: 0.6 }}
          />
        )}
      </div>

      {tasks.length === 0 ? (
        <div
          style={{
            padding: "14px 10px",
            textAlign: "center",
            color: "var(--text-muted)",
            fontSize: 12,
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          Nothing scheduled. Ask me to plan your week.
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: expanded ? 8 : 6,
          }}
        >
          {tasks.map((t) => {
            const c = subjectColor(t.subject);
            return (
              <div
                key={t.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: expanded ? "12px 14px" : "8px 10px",
                  background: `${c}14`,
                  borderLeft: `2px solid ${c}`,
                  borderRadius: "var(--radius-sm)",
                  transition: "var(--transition)",
                }}
              >
                <div
                  style={{
                    minWidth: 0,
                    display: "flex",
                    flexDirection: "column",
                    flex: 1,
                  }}
                >
                  <span
                    style={{
                      fontSize: expanded ? 14 : 13,
                      color: "var(--text)",
                      fontFamily: "'DM Sans', sans-serif",
                      fontWeight: 500,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: expanded ? "normal" : "nowrap",
                    }}
                  >
                    {t.title}
                  </span>
                  <span
                    style={{
                      fontSize: expanded ? 12 : 11,
                      color: "var(--text-muted)",
                      fontFamily: "'DM Sans', sans-serif",
                      marginTop: expanded ? 2 : 0,
                    }}
                  >
                    {t.when} · {t.hours}h
                    {expanded && t.subject && (
                      <>
                        {" · "}
                        <span style={{ color: c, textTransform: "capitalize" }}>
                          {t.subject}
                        </span>
                      </>
                    )}
                  </span>
                </div>

                {actions && (
                  <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                    {onComplete && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onComplete(t.id);
                        }}
                        aria-label={`Mark "${t.title}" complete`}
                        title="Mark complete"
                        style={{
                          width: expanded ? 30 : 26,
                          height: expanded ? 30 : 26,
                          borderRadius: 8,
                          background: "rgba(52, 211, 153, 0.1)",
                          border: "1px solid rgba(52, 211, 153, 0.2)",
                          color: "#34d399",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "none",
                          transition: "var(--transition)",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background =
                            "rgba(52, 211, 153, 0.2)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background =
                            "rgba(52, 211, 153, 0.1)";
                        }}
                      >
                        <Check size={expanded ? 14 : 12} />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(t.id);
                        }}
                        aria-label={`Delete "${t.title}"`}
                        title="Delete"
                        style={{
                          width: expanded ? 30 : 26,
                          height: expanded ? 30 : 26,
                          borderRadius: 8,
                          background: "rgba(236, 72, 153, 0.08)",
                          border: "1px solid rgba(236, 72, 153, 0.18)",
                          color: "#f9a8d4",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "none",
                          transition: "var(--transition)",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background =
                            "rgba(236, 72, 153, 0.18)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background =
                            "rgba(236, 72, 153, 0.08)";
                        }}
                      >
                        <Trash2 size={expanded ? 13 : 11} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {tasks.length > 0 && (
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDownload("ics");
            }}
            className="btn btn-ghost"
            style={{ flex: 1, fontSize: 12, padding: "7px 10px" }}
          >
            <Download size={12} /> .ics
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDownload("csv");
            }}
            className="btn btn-secondary"
            style={{ flex: 1, fontSize: 12, padding: "7px 10px" }}
          >
            <Download size={12} /> .csv
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDownload("txt");
            }}
            className="btn btn-secondary"
            style={{ flex: 1, fontSize: 12, padding: "7px 10px" }}
          >
            <Download size={12} /> .txt
          </button>
        </div>
      )}
    </div>
  );
}