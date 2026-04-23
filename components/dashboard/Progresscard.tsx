"use client";

// components/dashboard/ProgressCard.tsx
// Expandable progress card with download option.

import { Download, Maximize2 } from "lucide-react";

type Props = {
  streak: number;
  hours: number;
  goal: number;
  tasksDone: number;
  tasksTotal: number;
  onDownload?: () => void;
  onExpand?: () => void;
  expanded?: boolean;
  // Optional extra detail (shown only when expanded)
  completedTasks?: { title: string; when: string }[];
  activeTasks?: { title: string; when: string }[];
};

function Stat({
  label,
  value,
  color,
  big,
}: {
  label: string;
  value: string;
  color: string;
  big?: boolean;
}) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        padding: big ? "14px 16px" : "10px 12px",
      }}
    >
      <div
        style={{
          fontFamily: "'Sora', sans-serif",
          fontSize: big ? 10 : 9,
          fontWeight: 700,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--text-muted)",
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: "'Sora', sans-serif",
          fontSize: big ? 26 : 20,
          fontWeight: 700,
          color,
          letterSpacing: "-0.02em",
        }}
      >
        {value}
      </div>
    </div>
  );
}

export default function ProgressCard({
  streak,
  hours,
  goal,
  tasksDone,
  tasksTotal,
  onDownload,
  onExpand,
  expanded = false,
  completedTasks = [],
  activeTasks = [],
}: Props) {
  const pct = goal > 0 ? Math.round((hours / goal) * 100) : 0;

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
          This week
        </div>
        {onExpand && !expanded && (
          <Maximize2
            size={12}
            style={{ color: "var(--text-muted)", opacity: 0.6 }}
          />
        )}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 8,
          marginBottom: 12,
        }}
      >
        <Stat label="Streak" value={`${streak}d`} color="#ec4899" big={expanded} />
        <Stat label="Hours" value={`${hours}h`} color="#A78BFA" big={expanded} />
        <Stat label="Goal" value={`${pct}%`} color="#f59e0b" big={expanded} />
        <Stat
          label="Tasks"
          value={`${tasksDone}/${tasksTotal}`}
          color="#34d399"
          big={expanded}
        />
      </div>

      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
      <div
        style={{
          marginTop: 6,
          display: "flex",
          justifyContent: "space-between",
          fontSize: expanded ? 12 : 10,
          fontFamily: "'DM Sans', sans-serif",
          color: "var(--text-muted)",
        }}
      >
        <span>
          {hours}h of {goal}h goal
        </span>
        <span style={{ color: "var(--primary-text)" }}>{pct}%</span>
      </div>

      {expanded && (completedTasks.length > 0 || activeTasks.length > 0) && (
        <div style={{ marginTop: 18 }}>
          {completedTasks.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div
                className="eyebrow"
                style={{ fontSize: 10, padding: "3px 10px", marginBottom: 8 }}
              >
                Completed ({completedTasks.length})
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {completedTasks.map((t, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "8px 12px",
                      background: "rgba(52, 211, 153, 0.06)",
                      borderLeft: "2px solid #34d399",
                      borderRadius: "var(--radius-sm)",
                      fontSize: 12,
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    <span
                      style={{
                        color: "var(--text)",
                        textDecoration: "line-through",
                        opacity: 0.7,
                      }}
                    >
                      {t.title}
                    </span>
                    <span style={{ color: "var(--text-muted)" }}>{t.when}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTasks.length > 0 && (
            <div>
              <div
                className="eyebrow"
                style={{ fontSize: 10, padding: "3px 10px", marginBottom: 8 }}
              >
                Still to do ({activeTasks.length})
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {activeTasks.map((t, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "8px 12px",
                      background: "rgba(124, 92, 255, 0.06)",
                      borderLeft: "2px solid var(--primary)",
                      borderRadius: "var(--radius-sm)",
                      fontSize: 12,
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    <span style={{ color: "var(--text)" }}>{t.title}</span>
                    <span style={{ color: "var(--text-muted)" }}>{t.when}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {onDownload && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDownload();
          }}
          className="btn btn-secondary"
          style={{
            marginTop: 12,
            width: "100%",
            fontSize: 12,
            padding: "7px 10px",
          }}
        >
          <Download size={12} /> Download progress report
        </button>
      )}
    </div>
  );
}