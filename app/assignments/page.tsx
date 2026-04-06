"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "@/components/dashboard/Sidebar";
import { useStore } from "@/store/index";
import type { StoreAssignment } from "@/store/index";
import type { AnalysisResult, Task } from "@/types";

const SL = { strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
function IcoBook({ z = 16 }: { z?: number }): React.ReactElement { return <svg width={z} height={z} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...SL}><path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" /></svg>; }
function IcoSpark({ z = 14 }: { z?: number }): React.ReactElement { return <svg width={z} height={z} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...SL}><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z" /></svg>; }
function IcoClock({ z = 15 }: { z?: number }): React.ReactElement { return <svg width={z} height={z} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...SL}><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>; }
function IcoCal({ z = 15 }: { z?: number }): React.ReactElement { return <svg width={z} height={z} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...SL}><rect x="3" y="4" width="18" height="18" rx="2.5" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>; }
function IcoZap({ z = 13 }: { z?: number }): React.ReactElement { return <svg width={z} height={z} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...SL}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>; }
function IcoCheck({ z = 13 }: { z?: number }): React.ReactElement { return <svg width={z} height={z} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" {...SL}><polyline points="20 6 9 17 4 12" /></svg>; }
function IcoPlus({ z = 14 }: { z?: number }): React.ReactElement { return <svg width={z} height={z} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...SL}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>; }
function IcoSave({ z = 14 }: { z?: number }): React.ReactElement { return <svg width={z} height={z} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...SL}><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>; }
function IcoTrash({ z = 12 }: { z?: number }): React.ReactElement { return <svg width={z} height={z} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...SL}><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" /><path d="M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" /></svg>; }

type Diff = "easy" | "medium" | "hard";
const DC: Record<Diff, { color: string; bg: string; border: string }> = {
  easy:   { color: "#34d399", bg: "rgba(52,211,153,0.1)",  border: "rgba(52,211,153,0.22)" },
  medium: { color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.22)" },
  hard:   { color: "#ef4444", bg: "rgba(239,68,68,0.1)",   border: "rgba(239,68,68,0.22)"  },
};
function diffCfg(d: string): { color: string; bg: string; border: string } { return DC[d as Diff] ?? DC.medium; }
function fmt(m: number): string { const h = Math.floor(m / 60), r = m % 60; return h > 0 ? (r ? `${h}h ${r}m` : `${h}h`) : `${m}m`; }
const F: React.CSSProperties = { fontFamily: "var(--font-sora,'Sora'),sans-serif" };

interface StatRow { Icon: React.FC<{ z?: number }>; label: string; value: string; color: string; }

interface RightProps {
  analyzing: boolean; result: AnalysisResult | null; title: string;
  tasks: Task[]; saved: boolean; onSave: () => void;
}

function RightPanel({ analyzing, result, title, tasks, saved, onSave }: RightProps): React.ReactElement {
  if (!analyzing && !result) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", padding: 40, textAlign: "center" }}>
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
        <div style={{ width: 64, height: 64, borderRadius: 18, background: "rgba(124,92,255,0.1)", border: "1px solid rgba(124,92,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", color: "var(--primary-text)" }}><IcoBook z={26} /></div>
        <h3 style={{ ...F, fontSize: "1.1rem", fontWeight: 700, color: "var(--text)", letterSpacing: "-0.02em", marginBottom: 8 }}>Select an assignment</h3>
        <p style={{ fontSize: 13, color: "var(--text-muted)", maxWidth: 240, lineHeight: 1.6 }}>Pick one from the list or analyze a new one to see the full AI breakdown.</p>
      </motion.div>
    </div>
  );

  if (analyzing) return (
    <div style={{ padding: 32, overflowY: "auto", height: "100%" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {[220, 160, 120].map((w: number, i: number) => (
          <motion.div key={i} animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ repeat: Infinity, duration: 1.6, delay: i * 0.12 }}
            style={{ height: i === 0 ? 28 : 16, width: `${w}px`, background: "rgba(255,255,255,0.06)", borderRadius: 8 }} />
        ))}
        <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
          {[1, 2, 3].map((i: number) => (
            <motion.div key={i} animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ repeat: Infinity, duration: 1.6, delay: i * 0.18 }}
              style={{ flex: 1, height: 80, background: "rgba(255,255,255,0.06)", borderRadius: 12 }} />
          ))}
        </div>
        {[1, 2, 3, 4, 5].map((i: number) => (
          <motion.div key={i} animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ repeat: Infinity, duration: 1.6, delay: i * 0.1 }}
            style={{ height: 44, background: "rgba(255,255,255,0.04)", borderRadius: 10 }} />
        ))}
      </div>
      <p style={{ textAlign: "center", color: "var(--primary-text)", fontSize: 13, marginTop: 28, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
        <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.2 }}><IcoSpark z={14} /></motion.span>
        Analyzing your assignment…
      </p>
    </div>
  );

  const diff = (result!.difficulty ?? "medium") as string;
  const cfg  = diffCfg(diff);
  const statRows: StatRow[] = [
    { Icon: IcoClock, label: "Hours",      value: `${result!.estimatedHours}h`, color: "var(--primary-text)" },
    { Icon: IcoCal,   label: "Deadline",   value: result!.deadline,             color: "#f59e0b"             },
    { Icon: IcoZap,   label: "Difficulty", value: diff,                          color: cfg.color             },
  ];

  return (
    <motion.div key="result" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.38 }}
      style={{ padding: 32, overflowY: "auto", height: "100%", display: "flex", flexDirection: "column", gap: 20 }}>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
        <div>
          <p style={{ fontSize: 10, fontWeight: 700, color: "var(--primary-text)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6, display: "flex", alignItems: "center", gap: 5 }}><IcoSpark z={10} /> AI Analysis</p>
          <h2 style={{ ...F, fontSize: "1.45rem", fontWeight: 700, color: "var(--text)", letterSpacing: "-0.025em", margin: 0 }}>{title || "Assignment Breakdown"}</h2>
        </div>
        <motion.button onClick={onSave} disabled={saved} whileHover={!saved ? { scale: 1.03, y: -1 } : {}} whileTap={!saved ? { scale: 0.97 } : {}}
          style={{ padding: "9px 18px", background: saved ? "rgba(52,211,153,0.1)" : "linear-gradient(135deg,var(--primary),#5b45e0)", border: saved ? "1px solid rgba(52,211,153,0.28)" : "none", borderRadius: 10, color: saved ? "#34d399" : "white", fontSize: 12, fontWeight: 700, ...F, cursor: saved ? "default" : "none", display: "flex", alignItems: "center", gap: 6, flexShrink: 0, boxShadow: saved ? "none" : "0 3px 12px rgba(124,92,255,0.25)", transition: "all 0.2s ease" }}>
          {saved ? <><IcoCheck z={12} /> Saved</> : <><IcoSave z={12} /> Save</>}
        </motion.button>
      </div>

      <div style={{ background: "rgba(124,92,255,0.06)", border: "1px solid rgba(124,92,255,0.18)", borderRadius: 14, padding: "16px 18px" }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: "var(--primary-text)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8, display: "flex", alignItems: "center", gap: 5 }}><IcoBook z={10} /> Summary</p>
        <p style={{ fontSize: 13.5, color: "var(--text)", lineHeight: 1.65, margin: 0 }}>{result!.summary}</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
        {statRows.map(({ Icon, label, value, color }: StatRow) => (
          <div key={label} style={{ background: "rgba(255,255,255,0.025)", border: "1px solid var(--border)", borderRadius: 12, padding: "13px 14px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 6 }}>
            <Icon z={15} />
            <p style={{ ...F, fontSize: "1.1rem", fontWeight: 700, color, letterSpacing: "-0.02em", margin: 0 }}>{value}</p>
            <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0 }}>{label}</p>
          </div>
        ))}
      </div>

      {(result!.keyRequirements?.length ?? 0) > 0 && (
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", borderRadius: 14, padding: "16px 18px" }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10, display: "flex", alignItems: "center", gap: 5 }}><IcoZap z={10} /> Key Requirements</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {result!.keyRequirements.map((req: string, i: number) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 9 }}>
                <div style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--primary)", marginTop: 7, flexShrink: 0 }} />
                <p style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.55, margin: 0 }}>{req}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", display: "flex", alignItems: "center", gap: 5, margin: 0 }}><IcoCheck z={10} /> Tasks — {tasks.length}</p>
          <span style={{ ...F, fontSize: 10, fontWeight: 700, color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 9999, padding: "2px 9px" }}>{diff}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {tasks.map((task: Task, i: number) => (
            <motion.div key={task.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 13px", background: "rgba(255,255,255,0.025)", border: "1px solid var(--border)", borderRadius: 10, transition: "all 0.18s ease" }}
              onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "rgba(124,92,255,0.25)"; el.style.background = "rgba(124,92,255,0.04)"; }}
              onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "var(--border)"; el.style.background = "rgba(255,255,255,0.025)"; }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--primary)", flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: "var(--text)", fontWeight: 500 }}>{task.title}</span>
              </div>
              <span style={{ ...F, fontSize: 11, fontWeight: 600, color: "var(--primary-text)", background: "rgba(124,92,255,0.1)", border: "1px solid rgba(124,92,255,0.2)", borderRadius: 9999, padding: "2px 8px", flexShrink: 0 }}>{fmt(task.estimatedMinutes)}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {!saved && (
        <motion.button onClick={onSave} whileHover={{ scale: 1.01, y: -1 }} whileTap={{ scale: 0.98 }}
          style={{ width: "100%", padding: 13, background: "linear-gradient(135deg,var(--primary),#5b45e0)", border: "none", borderRadius: 12, color: "white", fontSize: 13.5, fontWeight: 700, ...F, cursor: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, boxShadow: "0 4px 16px rgba(124,92,255,0.28)", marginTop: 4 }}>
          <IcoSave z={14} /> Save Assignment
        </motion.button>
      )}
    </motion.div>
  );
}

export default function AssignmentsPage(): React.ReactElement {
  const { assignments, addAssignment, removeAssignment, getTasksForAssignment } = useStore();
  const [titleInput,   setTitleInput]  = useState("");
  const [textInput,    setTextInput]   = useState("");
  const [analyzing,    setAnalyzing]   = useState(false);
  const [pendingRes,   setPendingRes]  = useState<AnalysisResult | null>(null);
  const [pendingTitle, setPendTitle]   = useState("");
  const [pendingText,  setPendText]    = useState("");
  const [selectedId,   setSelectedId]  = useState<string | null>(null);
  const [error,        setError]       = useState("");

  const selectedA = assignments.find((a: StoreAssignment) => a.id === selectedId);
  const displayRes: AnalysisResult | null = selectedA
    ? { summary: selectedA.summary ?? "", tasks: getTasksForAssignment(selectedId!).map((t: Task) => ({ title: t.title, estimatedMinutes: t.estimatedMinutes })), estimatedHours: selectedA.estimatedHours ?? 0, deadline: selectedA.deadline ?? "Not specified", difficulty: selectedA.difficulty ?? "medium", keyRequirements: selectedA.keyRequirements ?? [] }
    : pendingRes;
  const displayTitle = selectedA ? selectedA.title : pendingTitle;
  const isSaved      = !!selectedA;
  const displayTasks = selectedId ? getTasksForAssignment(selectedId) : [];

  async function handleAnalyze(): Promise<void> {
    if (!textInput.trim()) return;
    setAnalyzing(true); setPendingRes(null); setSelectedId(null); setError("");
    try {
      const res  = await fetch("/api/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: textInput, title: titleInput }) });
      const data = await res.json() as AnalysisResult & { error?: string };
      if (data.error) throw new Error(data.error);
      setPendingRes(data); setPendTitle(titleInput || "Untitled Assignment"); setPendText(textInput);
    } catch (e: unknown) { setError(e instanceof Error ? e.message : "Analysis failed."); }
    finally { setAnalyzing(false); }
  }

  function handleSave(): void {
    if (!pendingRes) return;
    const a = addAssignment(pendingTitle, pendingText, pendingRes);
    setSelectedId(a.id); setPendingRes(null); setTitleInput(""); setTextInput("");
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      <Sidebar />
      <div style={{ flex: 1, display: "flex", overflow: "hidden", height: "100vh" }}>

        <div style={{ width: 360, flexShrink: 0, borderRight: "1px solid var(--border)", overflowY: "auto", background: "rgba(5,6,15,0.5)", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "28px 22px 0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}><IcoBook z={17} /><h1 style={{ ...F, fontSize: "1.15rem", fontWeight: 700, color: "var(--text)", letterSpacing: "-0.025em", margin: 0 }}>Assignments</h1></div>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 22 }}>Analyze and manage your work.</p>
          </div>

          <div style={{ padding: "0 22px 20px", borderBottom: "1px solid var(--border)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 16 }}>
              <div style={{ width: 26, height: 26, borderRadius: 8, background: "rgba(124,92,255,0.12)", border: "1px solid rgba(124,92,255,0.22)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary-text)" }}><IcoPlus z={13} /></div>
              <p style={{ ...F, fontSize: 13, fontWeight: 700, color: "var(--text)", margin: 0 }}>New Assignment</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
              <div>
                <label style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: 5, letterSpacing: "0.05em", textTransform: "uppercase" }}>Title</label>
                <input className="input" value={titleInput} onChange={(e) => setTitleInput(e.target.value)} placeholder="e.g. Biology Lab Report" style={{ fontSize: 13, padding: "8px 12px" }} />
              </div>
              <div>
                <label style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: 5, letterSpacing: "0.05em", textTransform: "uppercase" }}>Assignment text</label>
                <textarea className="textarea" value={textInput} onChange={(e) => setTextInput(e.target.value)} placeholder="Paste your full assignment description here…" rows={5} style={{ fontSize: 13, padding: "9px 12px", resize: "vertical" }} />
              </div>
              {error && <p style={{ fontSize: 12, color: "#ef4444", padding: "7px 11px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8 }}>{error}</p>}
              <motion.button onClick={handleAnalyze} disabled={analyzing || !textInput.trim()}
                whileHover={!analyzing && !!textInput.trim() ? { scale: 1.02, y: -1 } : {}} whileTap={!analyzing && !!textInput.trim() ? { scale: 0.98 } : {}}
                style={{ width: "100%", padding: 11, background: analyzing ? "rgba(124,92,255,0.4)" : "linear-gradient(135deg,var(--primary),#5b45e0)", border: "none", borderRadius: 11, color: "white", fontSize: 13, fontWeight: 700, ...F, cursor: analyzing || !textInput.trim() ? "not-allowed" : "none", opacity: !textInput.trim() ? 0.45 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 4px 14px rgba(124,92,255,0.26)", transition: "all 0.2s ease" }}>
                {analyzing ? <><motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} style={{ width: 13, height: 13, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%" }} />Analyzing…</> : <><IcoSpark z={13} />Analyze with AI</>}
              </motion.button>
            </div>
          </div>

          {assignments.length > 0 && (
            <div style={{ padding: "16px 22px", flex: 1 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: "var(--text-faint)", letterSpacing: "0.09em", textTransform: "uppercase", marginBottom: 10 }}>Saved — {assignments.length}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {assignments.map((a: StoreAssignment) => {
                  const aTasks = getTasksForAssignment(a.id);
                  const done   = aTasks.filter((t: Task) => t.completed).length;
                  const pct    = aTasks.length ? Math.round((done / aTasks.length) * 100) : 0;
                  const diff   = a.difficulty ?? "medium";
                  const cfg    = diffCfg(diff);
                  const active = selectedId === a.id;
                  return (
                    <motion.div key={a.id} whileHover={{ x: 2 }} onClick={() => { setSelectedId(a.id); setPendingRes(null); }}
                      style={{ background: active ? "rgba(124,92,255,0.1)" : "rgba(255,255,255,0.025)", border: `1px solid ${active ? "rgba(124,92,255,0.28)" : "var(--border)"}`, borderRadius: 10, padding: "10px 12px", cursor: "none", transition: "all 0.18s ease" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                        <p style={{ ...F, fontSize: 12.5, fontWeight: 600, color: active ? "var(--primary-text)" : "var(--text)", letterSpacing: "-0.01em", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{a.title}</p>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                          <span style={{ ...F, fontSize: 10, fontWeight: 700, color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 9999, padding: "1px 7px" }}>{diff}</span>
                          <button onClick={(e) => { e.stopPropagation(); removeAssignment(a.id); if (selectedId === a.id) setSelectedId(null); }}
                            style={{ background: "none", border: "none", color: "var(--text-faint)", cursor: "none", padding: 2, display: "flex", alignItems: "center", borderRadius: 4, transition: "color 0.15s ease" }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#ef4444"; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--text-faint)"; }}><IcoTrash z={12} /></button>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6 }}>
                        <div style={{ flex: 1, height: 3, background: "rgba(255,255,255,0.05)", borderRadius: 9999, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg,${cfg.color},${cfg.color}aa)`, borderRadius: 9999, transition: "width 0.4s ease" }} />
                        </div>
                        <span style={{ fontSize: 10, color: "var(--text-muted)", flexShrink: 0 }}>{pct}%</span>
                        <span style={{ fontSize: 10, color: "var(--text-muted)", flexShrink: 0 }}>{aTasks.length} tasks</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div style={{ flex: 1, overflowY: "auto" }}>
          <AnimatePresence mode="wait">
            <RightPanel key={analyzing ? "loading" : selectedId ?? (pendingRes ? "pending" : "empty")}
              analyzing={analyzing} result={displayRes} title={displayTitle}
              tasks={displayTasks} saved={isSaved} onSave={handleSave} />
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}