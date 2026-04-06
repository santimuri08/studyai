"use client";
import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Sidebar from "@/components/dashboard/Sidebar";
import { useStore } from "@/store/index";
import type { StoreAssignment, WeeklyDay, AssignmentProgress } from "@/store/index";
import type { Task } from "@/types";
import { PageWrapper, SectionHeader, StaggerList, StaggerItem } from "@/components/PageWrapper";

const SL = { strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
function IcoClock({ z = 14 }: { z?: number }): React.ReactElement { return <svg width={z} height={z} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...SL}><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>; }
function IcoCheck({ z = 14 }: { z?: number }): React.ReactElement { return <svg width={z} height={z} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...SL}><polyline points="20 6 9 17 4 12" /></svg>; }
function IcoChart({ z = 14 }: { z?: number }): React.ReactElement { return <svg width={z} height={z} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...SL}><path d="M18 20V10M12 20V4M6 20v-6" /><path d="M3 20h18" /></svg>; }
function IcoFire({ z = 14 }: { z?: number }): React.ReactElement { return <svg width={z} height={z} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...SL}><path d="M12 2c0 0-4 4-4 8a4 4 0 008 0c0-1.5-.5-3-1-4 0 0-1 2-2 2s-2-2-2-2c1-2 1-4 1-4z" /></svg>; }
function IcoBook({ z = 13 }: { z?: number }): React.ReactElement { return <svg width={z} height={z} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...SL}><path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" /></svg>; }
function IcoPlus({ z = 13 }: { z?: number }): React.ReactElement { return <svg width={z} height={z} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...SL}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>; }
function IcoCheckSm({ z = 10 }: { z?: number }): React.ReactElement { return <svg width={z} height={z} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" {...SL}><polyline points="20 6 9 17 4 12" /></svg>; }

const CARD: React.CSSProperties = { background: "rgba(255,255,255,0.025)", border: "1px solid var(--border)", borderRadius: 16 };
const F: React.CSSProperties    = { fontFamily: "var(--font-sora,'Sora'),sans-serif" };
const TASK_COLORS = ["var(--primary)", "#34d399", "#f59e0b", "#ec4899", "#60a5fa"];

function fmtH(m: number): string { const h = Math.floor(m / 60), r = m % 60; return h > 0 ? (r ? `${h}h ${r}m` : `${h}h`) : `${m}m`; }

interface StatCard { Icon: React.FC<{ z?: number }>; label: string; value: string; sub: string; color: string; }
interface RingRow  { label: string; value: string; color: string; }

export default function DashboardPage(): React.ReactElement {
  const { getDashboardStats, tasks, assignments, toggleTask } = useStore();
  const stats = getDashboardStats();

  const totalHours = stats.studyHoursScheduled;
  const goalHours  = 15;
  const goalPct    = Math.min(100, Math.round((totalHours / goalHours) * 100));
  const circ       = 2 * Math.PI * 50;
  const maxBar     = Math.max(...stats.weeklyHours.map((d: WeeklyDay) => d.hours), 1);

  const upcoming: Task[] = tasks
    .filter((t: Task) => !t.completed && !!t.scheduledDate)
    .sort((a: Task, b: Task) => (a.scheduledDate! > b.scheduledDate! ? 1 : -1))
    .slice(0, 6);

  const statCards: StatCard[] = [
    { Icon: IcoClock, label: "Study Hours", value: `${totalHours}h`,         sub: "scheduled",                color: "var(--primary-text)" },
    { Icon: IcoCheck, label: "Tasks Done",  value: `${stats.completedTasks}`, sub: `of ${stats.totalTasks} total`, color: "#34d399" },
    { Icon: IcoChart, label: "Weekly Goal", value: `${goalPct}%`,            sub: `${totalHours}/${goalHours}h`,  color: "#f59e0b" },
    { Icon: IcoFire,  label: "Streak",      value: `${stats.streak} days`,    sub: "keep it up!",              color: "#ec4899" },
  ];

  const ringRows: RingRow[] = [
    { label: "Scheduled", value: `${totalHours}h`,                         color: "var(--primary-text)" },
    { label: "Goal",       value: `${goalHours}h`,                          color: "var(--text)"         },
    { label: "Remaining",  value: `${Math.max(0, goalHours - totalHours)}h`, color: "#f59e0b"             },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      <Sidebar />
      <PageWrapper>
        <main style={{ flex: 1, padding: "36px 36px 60px", overflowY: "auto", maxWidth: 1100 }}>

          <SectionHeader>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 28 }}>
              <div>
                <h1 style={{ ...F, fontSize: "1.65rem", fontWeight: 700, color: "var(--text)", letterSpacing: "-0.025em", marginBottom: 4 }}>Dashboard</h1>
                <p style={{ color: "var(--text-muted)", fontSize: 13, margin: 0 }}>Welcome back. Here's your study overview.</p>
              </div>
              <Link href="/assignments" style={{ textDecoration: "none" }}>
                <motion.div whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }}
                  style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 16px", background: "linear-gradient(135deg,var(--primary),#5b45e0)", borderRadius: 11, cursor: "none", boxShadow: "0 3px 12px rgba(124,92,255,0.28)" }}>
                  <IcoPlus z={13} /><span style={{ ...F, fontSize: 12.5, fontWeight: 700, color: "white" }}>New Assignment</span>
                </motion.div>
              </Link>
            </div>
          </SectionHeader>

          <StaggerList>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 }}>
              {statCards.map((s: StatCard) => (
                <StaggerItem key={s.label}>
                  <motion.div whileHover={{ y: -3 }} style={{ ...CARD, padding: "18px 20px", transition: "all 0.22s ease" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 8, background: `${s.color}18`, border: `1px solid ${s.color}28`, display: "flex", alignItems: "center", justifyContent: "center", color: s.color }}><s.Icon z={14} /></div>
                      <p style={{ fontSize: 11.5, color: "var(--text-muted)", margin: 0, fontWeight: 500 }}>{s.label}</p>
                    </div>
                    <p style={{ ...F, fontSize: "1.75rem", fontWeight: 700, color: s.color, margin: "0 0 3px", letterSpacing: "-0.03em" }}>{s.value}</p>
                    <p style={{ fontSize: 11, color: "var(--text-faint)", margin: 0 }}>{s.sub}</p>
                  </motion.div>
                </StaggerItem>
              ))}
            </div>
          </StaggerList>

          <StaggerList>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 18 }}>
              <StaggerItem>
                <div style={{ ...CARD, padding: 22 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
                    <h3 style={{ ...F, color: "var(--text)", fontWeight: 600, fontSize: 14, letterSpacing: "-0.01em", margin: 0 }}>Study Hours</h3>
                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>This week</span>
                  </div>
                  {stats.weeklyHours.every((d: WeeklyDay) => d.hours === 0) ? (
                    <div style={{ height: 130, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 8 }}>
                      <p style={{ fontSize: 12, color: "var(--text-faint)", textAlign: "center", margin: 0 }}>No scheduled tasks yet.</p>
                      <Link href="/calendar" style={{ fontSize: 12, color: "var(--primary-text)", textDecoration: "none" }}>Go to Calendar →</Link>
                    </div>
                  ) : (
                    <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 130 }}>
                      {stats.weeklyHours.map((d: WeeklyDay, i: number) => (
                        <div key={d.day} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5, height: "100%" }}>
                          <div style={{ flex: 1, width: "100%", display: "flex", alignItems: "flex-end" }}>
                            <motion.div initial={{ height: 0 }} animate={{ height: `${Math.max((d.hours / maxBar) * 100, 3)}%` }} transition={{ duration: 0.55, delay: i * 0.06, ease: "easeOut" }}
                              style={{ width: "100%", background: "linear-gradient(180deg,var(--primary),rgba(124,92,255,0.35))", borderRadius: "5px 5px 0 0", minHeight: 3 }} />
                          </div>
                          <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{d.day}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </StaggerItem>

              <StaggerItem>
                <div style={{ ...CARD, padding: 22 }}>
                  <h3 style={{ ...F, color: "var(--text)", fontWeight: 600, fontSize: 14, letterSpacing: "-0.01em", marginBottom: 18 }}>Weekly Goal</h3>
                  <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
                    <div style={{ position: "relative", width: 110, height: 110, flexShrink: 0 }}>
                      <svg width={110} height={110} viewBox="0 0 120 120">
                        <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
                        <motion.circle cx="60" cy="60" r="50" fill="none" stroke="var(--primary)" strokeWidth="10"
                          strokeLinecap="round" strokeDasharray={circ}
                          initial={{ strokeDashoffset: circ }} animate={{ strokeDashoffset: circ * (1 - goalPct / 100) }}
                          transition={{ duration: 1, delay: 0.3, ease: "easeOut" }} transform="rotate(-90 60 60)" />
                      </svg>
                      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ ...F, fontSize: "1.2rem", fontWeight: 700, color: "var(--text)" }}>{goalPct}%</span>
                        <span style={{ fontSize: 9.5, color: "var(--text-muted)" }}>done</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {ringRows.map((r: RingRow) => (
                        <div key={r.label}>
                          <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 1 }}>{r.label}</p>
                          <p style={{ ...F, fontSize: "1.1rem", fontWeight: 700, color: r.color, margin: 0 }}>{r.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </StaggerItem>
            </div>
          </StaggerList>

          <StaggerItem>
            <div style={{ ...CARD, padding: 22, marginBottom: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                <h3 style={{ ...F, color: "var(--text)", fontWeight: 600, fontSize: 14, letterSpacing: "-0.01em", margin: 0 }}>Assignment Progress</h3>
                {stats.assignmentProgress.length === 0 && (
                  <Link href="/assignments" style={{ fontSize: 12, color: "var(--primary-text)", textDecoration: "none", display: "flex", alignItems: "center", gap: 5 }}><IcoPlus z={12} /> Add assignment</Link>
                )}
              </div>
              {stats.assignmentProgress.length === 0 ? (
                <div style={{ padding: "24px 0", textAlign: "center" }}>
                  <p style={{ fontSize: 12, color: "var(--text-faint)", margin: "0 0 12px" }}>No assignments yet. Analyze one to get started.</p>
                  <Link href="/assignments" style={{ textDecoration: "none" }}>
                    <motion.div whileHover={{ scale: 1.03 }} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 18px", background: "linear-gradient(135deg,var(--primary),#5b45e0)", borderRadius: 10, cursor: "none" }}>
                      <IcoBook z={13} /><span style={{ ...F, fontSize: 12.5, fontWeight: 700, color: "white" }}>Analyze Assignment</span>
                    </motion.div>
                  </Link>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {stats.assignmentProgress.map((a: AssignmentProgress, i: number) => (
                    <motion.div key={a.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.08 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                          <div style={{ width: 7, height: 7, borderRadius: "50%", background: a.color }} />
                          <span style={{ color: "var(--text)", fontSize: 13, fontWeight: 500 }}>{a.title}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Due {a.dueDate}</span>
                          <span style={{ ...F, fontSize: 11.5, fontWeight: 700, color: a.color }}>{a.pct}%</span>
                        </div>
                      </div>
                      <div style={{ height: 5, background: "rgba(255,255,255,0.05)", borderRadius: 9999, overflow: "hidden" }}>
                        <motion.div initial={{ width: 0 }} animate={{ width: `${a.pct}%` }} transition={{ duration: 0.7, delay: 0.2 + i * 0.08, ease: "easeOut" }}
                          style={{ height: "100%", background: a.color, borderRadius: 9999 }} />
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </StaggerItem>

          <StaggerItem>
            <div style={{ ...CARD, padding: 22 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 style={{ ...F, color: "var(--text)", fontWeight: 600, fontSize: 14, letterSpacing: "-0.01em", margin: 0 }}>Upcoming Tasks</h3>
                <Link href="/calendar" style={{ fontSize: 12, color: "var(--primary-text)", textDecoration: "none" }}>View calendar →</Link>
              </div>
              {upcoming.length === 0 ? (
                <p style={{ fontSize: 12, color: "var(--text-faint)", textAlign: "center", padding: "20px 0", margin: 0 }}>
                  {tasks.length === 0 ? "No tasks yet. Analyze an assignment first." : "No upcoming scheduled tasks."}
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  {upcoming.map((t: Task, i: number) => {
                    const aIdx  = assignments.findIndex((a: StoreAssignment) => a.id === t.assignmentId);
                    const color = TASK_COLORS[aIdx % TASK_COLORS.length];
                    return (
                      <motion.div key={t.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.06 }}
                        style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", borderRadius: 10, transition: "all 0.18s ease" }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(124,92,255,0.22)"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; }}>
                        <button onClick={() => toggleTask(t.id)}
                          style={{ width: 18, height: 18, borderRadius: 5, border: `1.5px solid ${t.completed ? color : "rgba(255,255,255,0.2)"}`, background: t.completed ? color : "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "none", flexShrink: 0, transition: "all 0.18s ease" }}>
                          {t.completed && <IcoCheckSm z={10} />}
                        </button>
                        <p style={{ fontSize: 13, color: t.completed ? "var(--text-faint)" : "var(--text)", fontWeight: 500, margin: 0, flex: 1, textDecoration: t.completed ? "line-through" : "none" }}>{t.title}</p>
                        <span style={{ fontSize: 10, color: "var(--text-muted)", flexShrink: 0 }}>{t.scheduledDate}</span>
                        <span style={{ ...F, fontSize: 10, fontWeight: 600, color, background: `${color}15`, border: `1px solid ${color}25`, borderRadius: 9999, padding: "1px 7px", flexShrink: 0 }}>{fmtH(t.estimatedMinutes)}</span>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </StaggerItem>

        </main>
      </PageWrapper>
    </div>
  );
}