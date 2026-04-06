"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import Sidebar from "@/components/dashboard/Sidebar";
import { useStore } from "@/store/index";
import type { WeeklyDay, AssignmentProgress } from "@/store/index";
import { PageWrapper, SectionHeader, StaggerList, StaggerItem } from "@/components/PageWrapper";

const F: React.CSSProperties    = { fontFamily: "var(--font-sora,'Sora'),sans-serif" };
const CARD: React.CSSProperties = { background: "rgba(255,255,255,0.025)", border: "1px solid var(--border)", borderRadius: 16 };

interface StatItem { label: string; value: string | number; sub: string; color: string; }
interface RingRow  { label: string; value: string; color: string; }

export default function ProgressPage(): React.ReactElement {
  const { getDashboardStats } = useStore();
  const stats = getDashboardStats();
  const [activeBar, setActiveBar] = useState<number | null>(null);

  const totalHours = stats.studyHoursScheduled;
  const maxBar     = Math.max(...stats.weeklyHours.map((d: WeeklyDay) => d.hours), 1);
  const goalHours  = 15;
  const goalPct    = Math.min(100, Math.round((totalHours / goalHours) * 100));
  const circ       = 2 * Math.PI * 50;

  const statItems: StatItem[] = [
    { label: "Study Hours", value: `${totalHours}h`,      sub: "scheduled",                color: "var(--primary-text)" },
    { label: "Tasks Done",  value: stats.completedTasks,   sub: `of ${stats.totalTasks} total`, color: "#34d399" },
    { label: "Weekly Goal", value: `${goalPct}%`,          sub: `${totalHours}/${goalHours}h`,  color: "#f59e0b" },
    { label: "Streak",      value: `${stats.streak} days`, sub: "keep it up!",              color: "#ec4899" },
  ];

  const ringRows: RingRow[] = [
    { label: "Completed", value: `${totalHours}h`,                         color: "var(--primary-text)" },
    { label: "Goal",      value: `${goalHours}h`,                           color: "var(--text)"         },
    { label: "Remaining", value: `${Math.max(0, goalHours - totalHours)}h`, color: "#f59e0b"             },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      <Sidebar />
      <PageWrapper>
        <main style={{ padding: "40px", overflowY: "auto" }}>

          <SectionHeader>
            <div style={{ marginBottom: 32 }}>
              <h1 style={{ ...F, fontSize: "1.75rem", fontWeight: 700, color: "var(--text)", marginBottom: 6, letterSpacing: "-0.025em" }}>Progress</h1>
              <p style={{ color: "var(--text-muted)", fontSize: 13, margin: 0 }}>Your study activity and assignment progress.</p>
            </div>
          </SectionHeader>

          <StaggerList>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 28 }}>
              {statItems.map((s: StatItem) => (
                <StaggerItem key={s.label}>
                  <motion.div whileHover={{ y: -3 }} style={{ ...CARD, padding: "20px" }}>
                    <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8 }}>{s.label}</p>
                    <p style={{ ...F, fontSize: "1.8rem", fontWeight: 700, color: s.color, marginBottom: 4, letterSpacing: "-0.03em" }}>{s.value}</p>
                    <p style={{ fontSize: 11, color: "var(--text-faint)", margin: 0 }}>{s.sub}</p>
                  </motion.div>
                </StaggerItem>
              ))}
            </div>
          </StaggerList>

          <StaggerList>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
              <StaggerItem>
                <div style={{ ...CARD, padding: 24 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
                    <h3 style={{ ...F, color: "var(--text)", fontWeight: 600, fontSize: 15, letterSpacing: "-0.01em", margin: 0 }}>Study Hours</h3>
                    <span style={{ fontSize: 12, color: "var(--text-muted)" }}>This week</span>
                  </div>
                  {stats.weeklyHours.every((d: WeeklyDay) => d.hours === 0) ? (
                    <div style={{ height: 140, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <p style={{ fontSize: 13, color: "var(--text-faint)", textAlign: "center", margin: 0 }}>Schedule tasks to see your study hours here.</p>
                    </div>
                  ) : (
                    <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 140 }}>
                      {stats.weeklyHours.map((d: WeeklyDay, i: number) => {
                        const pct      = maxBar > 0 ? (d.hours / maxBar) * 100 : 0;
                        const isActive = activeBar === i;
                        return (
                          <div key={d.day} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, cursor: "pointer" }}
                            onMouseEnter={() => setActiveBar(i)} onMouseLeave={() => setActiveBar(null)}>
                            {isActive && (
                              <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                                style={{ background: "var(--primary)", color: "white", fontSize: 10, fontWeight: 600, padding: "3px 6px", borderRadius: 6, whiteSpace: "nowrap" }}>
                                {d.hours}h
                              </motion.div>
                            )}
                            <div style={{ width: "100%", flex: 1, display: "flex", alignItems: "flex-end" }}>
                              <motion.div initial={{ height: 0 }} animate={{ height: `${Math.max(pct, 3)}%` }} transition={{ duration: 0.6, delay: i * 0.06, ease: "easeOut" }}
                                style={{ width: "100%", background: isActive ? "var(--primary)" : "rgba(124,92,255,0.35)", borderRadius: "6px 6px 0 0", minHeight: 4 }} />
                            </div>
                            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{d.day}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </StaggerItem>

              <StaggerItem>
                <div style={{ ...CARD, padding: 24 }}>
                  <h3 style={{ ...F, color: "var(--text)", fontWeight: 600, fontSize: 15, letterSpacing: "-0.01em", marginBottom: 20 }}>Weekly Goal</h3>
                  <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
                    <div style={{ position: "relative", width: 120, height: 120, flexShrink: 0 }}>
                      <svg width={120} height={120} viewBox="0 0 120 120">
                        <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
                        <motion.circle cx="60" cy="60" r="50" fill="none" stroke="var(--primary)" strokeWidth="10"
                          strokeLinecap="round" strokeDasharray={circ}
                          initial={{ strokeDashoffset: circ }} animate={{ strokeDashoffset: circ * (1 - goalPct / 100) }}
                          transition={{ duration: 1, delay: 0.3, ease: "easeOut" }} transform="rotate(-90 60 60)" />
                      </svg>
                      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ ...F, fontSize: "1.3rem", fontWeight: 700, color: "var(--text)" }}>{goalPct}%</span>
                        <span style={{ fontSize: 10, color: "var(--text-muted)" }}>done</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {ringRows.map((r: RingRow) => (
                        <div key={r.label}>
                          <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 2 }}>{r.label}</p>
                          <p style={{ ...F, fontSize: "1.2rem", fontWeight: 700, color: r.color, margin: 0 }}>{r.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </StaggerItem>
            </div>
          </StaggerList>

          <StaggerItem>
            <div style={{ ...CARD, padding: 24, marginBottom: 20 }}>
              <h3 style={{ ...F, color: "var(--text)", fontWeight: 600, fontSize: 15, letterSpacing: "-0.01em", marginBottom: 20 }}>Assignment Progress</h3>
              {stats.assignmentProgress.length === 0 ? (
                <p style={{ fontSize: 13, color: "var(--text-faint)", textAlign: "center", padding: "16px 0", margin: 0 }}>No assignments yet. Go to Assignments to get started.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  {stats.assignmentProgress.map((a: AssignmentProgress, i: number) => (
                    <motion.div key={a.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 8, height: 8, borderRadius: "50%", background: a.color }} />
                          <span style={{ color: "var(--text)", fontSize: 14, fontWeight: 500 }}>{a.title}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Due {a.dueDate}</span>
                          <span style={{ ...F, fontSize: 12, fontWeight: 600, color: a.color }}>{a.pct}%</span>
                        </div>
                      </div>
                      <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 9999, overflow: "hidden" }}>
                        <motion.div initial={{ width: 0 }} animate={{ width: `${a.pct}%` }} transition={{ duration: 0.8, delay: 0.3 + i * 0.1, ease: "easeOut" }}
                          style={{ height: "100%", background: a.color, borderRadius: 9999, minWidth: a.pct > 0 ? 6 : 0 }} />
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </StaggerItem>

          <StaggerItem>
            <div style={{ ...CARD, padding: 24 }}>
              <h3 style={{ ...F, color: "var(--text)", fontWeight: 600, fontSize: 15, letterSpacing: "-0.01em", marginBottom: 16 }}>Daily Breakdown</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {stats.weeklyHours.map((d: WeeklyDay, i: number) => (
                  <motion.div key={d.day} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i }}
                    style={{ display: "flex", alignItems: "center", gap: 16, padding: "12px 14px", borderRadius: 10, background: i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent" }}>
                    <span style={{ width: 36, fontSize: 13, color: "var(--text-muted)", fontWeight: 500 }}>{d.day}</span>
                    <div style={{ flex: 1, height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 9999, overflow: "hidden" }}>
                      <motion.div initial={{ width: 0 }} animate={{ width: `${maxBar > 0 ? (d.hours / maxBar) * 100 : 0}%` }} transition={{ duration: 0.6, delay: 0.1 + i * 0.05, ease: "easeOut" }}
                        style={{ height: "100%", background: "linear-gradient(90deg,var(--primary),var(--primary-text))", borderRadius: 9999 }} />
                    </div>
                    <span style={{ ...F, width: 32, fontSize: 13, color: "var(--primary-text)", fontWeight: 600, textAlign: "right" }}>{d.hours}h</span>
                    <span style={{ width: 60, fontSize: 12, color: "var(--text-muted)", textAlign: "right" }}>{d.tasks} tasks</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </StaggerItem>

        </main>
      </PageWrapper>
    </div>
  );
}