"use client";
import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  DndContext, DragEndEvent, DragOverlay, DragStartEvent,
  PointerSensor, useSensor, useSensors, useDroppable, useDraggable,
} from "@dnd-kit/core";
import Sidebar from "@/components/dashboard/Sidebar";
import { useStore } from "@/store/index";
import type { StoreAssignment } from "@/store/index";
import type { Task } from "@/types";

const SL = { strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
function IcoCal({ z = 16 }: { z?: number }): React.ReactElement { return <svg width={z} height={z} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...SL}><rect x="3" y="4" width="18" height="18" rx="2.5" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>; }
function IcoSpark({ z = 13 }: { z?: number }): React.ReactElement { return <svg width={z} height={z} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...SL}><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z" /></svg>; }
function IcoCheck({ z = 11 }: { z?: number }): React.ReactElement { return <svg width={z} height={z} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" {...SL}><polyline points="20 6 9 17 4 12" /></svg>; }
function IcoGrip({ z = 12 }: { z?: number }): React.ReactElement { return <svg width={z} height={z} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...SL}><circle cx="9" cy="6" r="1" fill="currentColor" /><circle cx="15" cy="6" r="1" fill="currentColor" /><circle cx="9" cy="12" r="1" fill="currentColor" /><circle cx="15" cy="12" r="1" fill="currentColor" /><circle cx="9" cy="18" r="1" fill="currentColor" /><circle cx="15" cy="18" r="1" fill="currentColor" /></svg>; }
function IcoX({ z = 10 }: { z?: number }): React.ReactElement { return <svg width={z} height={z} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...SL}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>; }

const TIME_SLOTS = ["8:00 AM","10:00 AM","12:00 PM","2:00 PM","4:00 PM","6:00 PM","8:00 PM"];
const COLORS     = ["#7C5CFF","#34d399","#f59e0b","#ec4899","#60a5fa","#a78bfa","#fb7185","#38bdf8"];
const F: React.CSSProperties = { fontFamily: "var(--font-sora,'Sora'),sans-serif" };

function fmt(m: number): string { const h = Math.floor(m / 60), r = m % 60; return h > 0 ? (r ? `${h}h ${r}m` : `${h}h`) : `${m}m`; }

interface WeekDate { label: string; date: string; isToday: boolean; dayNum: number; }

function getWeekDates(): WeekDate[] {
  const now = new Date(), day = now.getDay();
  const mon = new Date(now);
  mon.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
  return Array.from({ length: 7 }, (_: unknown, i: number) => {
    const d = new Date(mon);
    d.setDate(mon.getDate() + i);
    return { label: d.toLocaleDateString("en-US", { weekday: "short" }), date: d.toISOString().split("T")[0], isToday: d.toDateString() === now.toDateString(), dayNum: d.getDate() };
  });
}

function DragChip({ task, colorIdx }: { task: Task; colorIdx: number }): React.ReactElement {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: task.id });
  const color = COLORS[colorIdx % COLORS.length];
  return (
    <div ref={setNodeRef} {...attributes} {...listeners}
      style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", background: `${color}14`, border: `1px solid ${color}30`, borderRadius: 9, cursor: "grab", opacity: isDragging ? 0.35 : 1, transition: "opacity 0.15s ease", userSelect: "none" }}>
      <span style={{ color: `${color}80`, flexShrink: 0 }}><IcoGrip z={12} /></span>
      <p style={{ fontSize: 12, fontWeight: 500, color: "var(--text)", margin: 0, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{task.title}</p>
      <span style={{ ...F, fontSize: 10, fontWeight: 700, color, background: `${color}18`, border: `1px solid ${color}28`, borderRadius: 9999, padding: "1px 7px", flexShrink: 0 }}>{fmt(task.estimatedMinutes)}</span>
    </div>
  );
}

interface CalCellProps { date: string; time: string; task?: Task; colorIdx: number; onToggle?: (id: string) => void; onUnschedule?: (id: string) => void; }

function CalCell({ date, time, task, colorIdx, onToggle, onUnschedule }: CalCellProps): React.ReactElement {
  const { isOver, setNodeRef } = useDroppable({ id: `${date}__${time}` });
  const color = COLORS[colorIdx % COLORS.length];
  return (
    <div ref={setNodeRef} style={{ minHeight: 52, borderRadius: 8, border: `1px ${task ? "solid" : "dashed"} ${isOver ? "rgba(124,92,255,0.55)" : task ? `${color}28` : "rgba(255,255,255,0.04)"}`, background: isOver ? "rgba(124,92,255,0.07)" : task ? `${color}0a` : "transparent", transition: "all 0.15s ease", padding: 4 }}>
      {task && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          style={{ borderRadius: 6, padding: "5px 8px", background: `${color}20`, border: `1px solid ${color}30` }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 4 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, textDecoration: task.completed ? "line-through" : "none", opacity: task.completed ? 0.5 : 1 }}>{task.title}</p>
            <button onClick={() => onUnschedule?.(task.id)} style={{ background: "none", border: "none", color: `${color}70`, cursor: "none", padding: 0, flexShrink: 0, display: "flex", alignItems: "center" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = color; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = `${color}70`; }}><IcoX z={10} /></button>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 2 }}>
            <span style={{ fontSize: 9.5, color: `${color}aa` }}>{fmt(task.estimatedMinutes)}</span>
            <button onClick={() => onToggle?.(task.id)} style={{ background: "none", border: "none", cursor: "none", padding: 0, display: "flex", alignItems: "center", color: task.completed ? "#34d399" : `${color}60` }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#34d399"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = task.completed ? "#34d399" : `${color}60`; }}><IcoCheck z={10} /></button>
          </div>
        </motion.div>
      )}
      {isOver && !task && <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "var(--primary-text)" }}>Drop here</div>}
    </div>
  );
}

function OverlayChip({ task, colorIdx }: { task: Task; colorIdx: number }): React.ReactElement {
  const color = COLORS[colorIdx % COLORS.length];
  return (
    <div style={{ padding: "7px 10px", background: `${color}22`, border: `1px solid ${color}40`, borderRadius: 9, boxShadow: "0 8px 24px rgba(0,0,0,0.4)", cursor: "grabbing", whiteSpace: "nowrap" }}>
      <p style={{ fontSize: 12, fontWeight: 600, color, margin: 0 }}>{task.title}</p>
      <span style={{ fontSize: 10, color: `${color}aa` }}>{fmt(task.estimatedMinutes)}</span>
    </div>
  );
}

export default function CalendarPage(): React.ReactElement {
  const { assignments, tasks, scheduleTask, unscheduleTask, autoSchedule, autoScheduleAll, toggleTask } = useStore();
  const [activeId,     setActiveId]     = useState<string | null>(null);
  const [filterAssign, setFilterAssign] = useState("all");
  const weekDates = useMemo(() => getWeekDates(), []);
  const sensors   = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const colorMap = useMemo(() => {
    const m: Record<string, number> = {};
    assignments.forEach((a: StoreAssignment, i: number) => { m[a.id] = i; });
    return m;
  }, [assignments]);

  const scheduledMap = useMemo(() => {
    const m: Record<string, { task: Task; colorIdx: number }> = {};
    tasks.filter((t: Task) => t.scheduledDate && t.scheduledTime).forEach((t: Task) => {
      const key = `${t.scheduledDate}__${t.scheduledTime}`;
      if (!m[key]) m[key] = { task: t, colorIdx: colorMap[t.assignmentId] ?? 0 };
    });
    return m;
  }, [tasks, colorMap]);

  const unscheduled = useMemo(() =>
    tasks.filter((t: Task) => !t.scheduledDate && (filterAssign === "all" || t.assignmentId === filterAssign)),
    [tasks, filterAssign]
  );

  const activeTask = activeId ? tasks.find((t: Task) => t.id === activeId) : undefined;
  function onDragStart(e: DragStartEvent): void { setActiveId(e.active.id as string); }
  function onDragEnd(e: DragEndEvent): void {
    setActiveId(null);
    if (!e.over) return;
    const [date, time] = (e.over.id as string).split("__");
    if (date && time) scheduleTask(e.active.id as string, date, time);
  }

  const totalSched = tasks.filter((t: Task) => !!t.scheduledDate).length;
  const totalDone  = tasks.filter((t: Task) => t.completed).length;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      <Sidebar />
      <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <div style={{ flex: 1, display: "flex", overflow: "hidden", height: "100vh" }}>

          <div style={{ width: 256, flexShrink: 0, borderRight: "1px solid var(--border)", background: "rgba(5,6,15,0.5)", display: "flex", flexDirection: "column", overflowY: "auto" }}>
            <div style={{ padding: "28px 18px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}><IcoCal z={16} /><h1 style={{ ...F, fontSize: "1.1rem", fontWeight: 700, color: "var(--text)", letterSpacing: "-0.02em", margin: 0 }}>Calendar</h1></div>
              <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16 }}>Drag tasks onto the calendar.</p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 18 }}>
                {([{ label: "Scheduled", value: totalSched, color: "var(--primary-text)" }, { label: "Completed", value: totalDone, color: "#34d399" }] as { label: string; value: number; color: string }[]).map((s) => (
                  <div key={s.label} style={{ background: "rgba(255,255,255,0.025)", border: "1px solid var(--border)", borderRadius: 10, padding: "10px 12px", textAlign: "center" }}>
                    <p style={{ ...F, fontSize: "1.2rem", fontWeight: 700, color: s.color, letterSpacing: "-0.02em", margin: 0 }}>{s.value}</p>
                    <p style={{ fontSize: 10, color: "var(--text-muted)", margin: "2px 0 0" }}>{s.label}</p>
                  </div>
                ))}
              </div>

              {assignments.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: 5, letterSpacing: "0.05em", textTransform: "uppercase" }}>Schedule for</label>
                  <select value={filterAssign} onChange={(e) => setFilterAssign(e.target.value)}
                    style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", borderRadius: 9, padding: "7px 10px", color: "var(--text)", fontSize: 12, outline: "none", marginBottom: 8, cursor: "none", fontFamily: "inherit" }}>
                    <option value="all">All assignments</option>
                    {assignments.map((a: StoreAssignment) => <option key={a.id} value={a.id}>{a.title}</option>)}
                  </select>
                  <motion.button onClick={() => filterAssign === "all" ? autoScheduleAll() : autoSchedule(filterAssign)}
                    whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.97 }}
                    style={{ width: "100%", padding: "9px 12px", background: "linear-gradient(135deg,var(--primary),#5b45e0)", border: "none", borderRadius: 9, color: "white", fontSize: 12, fontWeight: 700, ...F, cursor: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, boxShadow: "0 3px 12px rgba(124,92,255,0.25)" }}>
                    <IcoSpark z={13} /> Auto-Schedule
                  </motion.button>
                </div>
              )}
              <p style={{ fontSize: 10, fontWeight: 700, color: "var(--text-faint)", letterSpacing: "0.09em", textTransform: "uppercase", marginBottom: 8 }}>
                Unscheduled{unscheduled.length > 0 ? ` — ${unscheduled.length}` : ""}
              </p>
            </div>

            <div style={{ padding: "0 18px 18px", flex: 1 }}>
              {unscheduled.length === 0
                ? <p style={{ fontSize: 12, color: "var(--text-faint)", textAlign: "center", padding: "24px 0" }}>{tasks.length === 0 ? "No tasks yet. Analyze an assignment first." : "All tasks scheduled! 🎉"}</p>
                : <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>{unscheduled.map((t: Task) => <DragChip key={t.id} task={t} colorIdx={colorMap[t.assignmentId] ?? 0} />)}</div>
              }
            </div>
          </div>

          <div style={{ flex: 1, overflowX: "auto", overflowY: "auto" }}>
            <div style={{ minWidth: 680, padding: 24 }}>
              <div style={{ display: "grid", gridTemplateColumns: "68px repeat(7,1fr)", gap: 6, marginBottom: 8 }}>
                <div />
                {weekDates.map((d: WeekDate) => (
                  <div key={d.date} style={{ textAlign: "center", padding: "6px 4px" }}>
                    <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>{d.label}</p>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: d.isToday ? "var(--primary)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", margin: "4px auto 0", boxShadow: d.isToday ? "0 0 12px rgba(124,92,255,0.5)" : "none" }}>
                      <p style={{ ...F, fontSize: 12, fontWeight: 700, color: d.isToday ? "white" : "var(--text)", margin: 0 }}>{d.dayNum}</p>
                    </div>
                  </div>
                ))}
              </div>
              {TIME_SLOTS.map((time: string) => (
                <div key={time} style={{ display: "grid", gridTemplateColumns: "68px repeat(7,1fr)", gap: 6, marginBottom: 6, alignItems: "start" }}>
                  <div style={{ display: "flex", alignItems: "center", height: 52, paddingRight: 8 }}>
                    <span style={{ fontSize: 11, color: "var(--text-faint)", fontWeight: 500, textAlign: "right", width: "100%" }}>{time}</span>
                  </div>
                  {weekDates.map((d: WeekDate) => {
                    const key   = `${d.date}__${time}`;
                    const entry = scheduledMap[key];
                    return <CalCell key={key} date={d.date} time={time} task={entry?.task} colorIdx={entry?.colorIdx ?? 0} onToggle={toggleTask} onUnschedule={unscheduleTask} />;
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
        <DragOverlay>{activeTask ? <OverlayChip task={activeTask} colorIdx={colorMap[activeTask.assignmentId] ?? 0} /> : null}</DragOverlay>
      </DndContext>
    </div>
  );
}