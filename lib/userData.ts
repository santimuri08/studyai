// lib/userData.ts
// Server-side helpers for loading and mutating a user's assignments/tasks.
// Soft-deletes treat deletedAt != null as "gone" and are excluded from reads.
// Schedule entries come from the TaskOccurrence table (true multi-date).

import { prisma } from "@/lib/prisma";
import type { Assignment, Task } from "@prisma/client";

export type ActiveAssignment = Assignment & { tasks: Task[] };

// ──────────────────────────────────────────────────────────────────
// Reads
// ──────────────────────────────────────────────────────────────────

export async function loadActiveAssignments(userId: string): Promise<ActiveAssignment[]> {
  const rows = await prisma.assignment.findMany({
    where:   { userId, deletedAt: null },
    orderBy: { createdAt: "desc" },
    include: {
      tasks: {
        where:   { deletedAt: null },
        orderBy: { createdAt: "asc" },
      },
    },
  });
  return rows as ActiveAssignment[];
}

export async function loadActiveTasks(userId: string): Promise<Task[]> {
  return prisma.task.findMany({
    where:   { userId, deletedAt: null },
    orderBy: [
      { scheduledDate: "asc" },
      { createdAt:     "asc" },
    ],
  });
}

// ──────────────────────────────────────────────────────────────────
// Soft-delete + complete mutations
// ──────────────────────────────────────────────────────────────────

export async function softDeleteAssignment(userId: string, assignmentId: string) {
  const now = new Date();
  await prisma.assignment.updateMany({
    where: { id: assignmentId, userId, deletedAt: null },
    data:  { deletedAt: now },
  });
  await prisma.task.updateMany({
    where: { assignmentId, userId, deletedAt: null },
    data:  { deletedAt: now },
  });
}

export async function restoreAssignment(userId: string, assignmentId: string) {
  await prisma.assignment.updateMany({
    where: { id: assignmentId, userId },
    data:  { deletedAt: null },
  });
  await prisma.task.updateMany({
    where: { assignmentId, userId },
    data:  { deletedAt: null },
  });
}

export async function softDeleteTask(userId: string, taskId: string) {
  await prisma.task.updateMany({
    where: { id: taskId, userId, deletedAt: null },
    data:  { deletedAt: new Date() },
  });
}

export async function restoreTask(userId: string, taskId: string) {
  await prisma.task.updateMany({
    where: { id: taskId, userId },
    data:  { deletedAt: null },
  });
}

export async function completeTask(userId: string, taskId: string) {
  await prisma.task.updateMany({
    where: { id: taskId, userId, deletedAt: null },
    data:  { completed: true },
  });
}

export async function uncompleteTask(userId: string, taskId: string) {
  await prisma.task.updateMany({
    where: { id: taskId, userId, deletedAt: null },
    data:  { completed: false },
  });
}

// ──────────────────────────────────────────────────────────────────
// Fuzzy text matchers
// ──────────────────────────────────────────────────────────────────

export function findAssignmentByText(
  assignments: ActiveAssignment[],
  target: string
): ActiveAssignment | null {
  if (!target) return null;
  const t = target.toLowerCase().trim()
    .replace(/^(my|the|that|a|an)\s+/g, "")
    .replace(/\s+(assignment|paper|essay|homework|hw)$/g, "")
    .trim();
  if (!t) return null;

  const exact = assignments.find((a) => a.title.toLowerCase() === t);
  if (exact) return exact;

  return assignments.find((a) => a.title.toLowerCase().includes(t))
      ?? assignments.find((a) => t.includes(a.title.toLowerCase()))
      ?? null;
}

export function findTaskByText(
  tasks: Task[],
  target: string
): Task | null {
  if (!target) return null;
  const t = target.toLowerCase().trim()
    .replace(/^(my|the|that|a|an)\s+/g, "")
    .trim();
  if (!t) return null;

  const exact = tasks.find((task) => task.name.toLowerCase() === t);
  if (exact) return exact;

  return tasks.find((task) => task.name.toLowerCase().includes(t))
      ?? tasks.find((task) => t.includes(task.name.toLowerCase()))
      ?? null;
}

// ──────────────────────────────────────────────────────────────────
// Progress computation
// ──────────────────────────────────────────────────────────────────

export function computeProgress(tasks: Task[]) {
  const completed = tasks.filter((t) => t.completed).length;
  const total     = tasks.length;

  // Rough hours from completed tasks; fall back to 0.5h per task if timeEstimate missing.
  const parseHours = (s: string | null): number => {
    if (!s) return 0.5;
    const m = s.match(/(\d+(\.\d+)?)\s*(h|hour|hr)/i);
    if (m) return parseFloat(m[1]);
    const mm = s.match(/(\d+)\s*min/i);
    if (mm) return parseInt(mm[1], 10) / 60;
    return 0.5;
  };

  const hours = tasks
    .filter((t) => t.completed)
    .reduce((sum, t) => sum + parseHours(t.timeEstimate), 0);

  const streak = Math.min(completed, 7); // simple streak stand-in

  return {
    streak,
    hours:      Math.round(hours * 10) / 10,
    goal:       15,
    tasksDone:  completed,
    tasksTotal: total,
  };
}

// ──────────────────────────────────────────────────────────────────
// Multi-date scheduling (TaskOccurrence table)
// ──────────────────────────────────────────────────────────────────

/**
 * Wipe and replace all occurrences for every active task of an assignment.
 * Semantics: "all tasks on each date" — for each task, we create one
 * occurrence per supplied date.
 *
 * Also mirrors the FIRST date back to Task.scheduledDate so any older code
 * that still reads that legacy column keeps working.
 *
 * Returns the number of occurrence rows written.
 */
export async function setTaskOccurrencesForAssignment(
  userId:       string,
  assignmentId: string,
  dates:        string[],
  time:         string | null = null,
) {
  const tasks = await prisma.task.findMany({
    where:  { assignmentId, userId, deletedAt: null, completed: false },
    select: { id: true },
  });

  const taskIds = tasks.map((t) => t.id);
  if (taskIds.length === 0) return 0;

  await prisma.taskOccurrence.deleteMany({
    where: { taskId: { in: taskIds } },
  });

  const rows = taskIds.flatMap((taskId) =>
    dates.map((date) => ({ taskId, userId, date, time: time ?? null }))
  );

  if (rows.length > 0) {
    await prisma.taskOccurrence.createMany({ data: rows });
  }

  await prisma.task.updateMany({
    where: { id: { in: taskIds } },
    data:  { scheduledDate: dates[0], scheduledTime: time ?? null },
  });

  return rows.length;
}

/**
 * Wipe and replace occurrences for a single task.
 * Returns the number of occurrence rows written.
 */
export async function setTaskOccurrencesForOneTask(
  userId: string,
  taskId: string,
  dates:  string[],
  time:   string | null = null,
) {
  const task = await prisma.task.findFirst({
    where:  { id: taskId, userId, deletedAt: null },
    select: { id: true },
  });
  if (!task) return 0;

  await prisma.taskOccurrence.deleteMany({ where: { taskId: task.id } });

  if (dates.length > 0) {
    await prisma.taskOccurrence.createMany({
      data: dates.map((date) => ({ taskId: task.id, userId, date, time: time ?? null })),
    });
  }

  await prisma.task.update({
    where: { id: task.id },
    data:  { scheduledDate: dates[0] ?? null, scheduledTime: time ?? null },
  });

  return dates.length;
}

export interface ScheduleEntry {
  taskId:       string;
  taskName:     string;
  assignmentId: string;
  timeEstimate: string | null;
  date:         string;
  time:         string | null;
  completed:    boolean;
}

/**
 * Loads every (task, date) pair for the user's active, incomplete tasks.
 * Sorted by date ascending, then time. Used to render the schedule card.
 */
export async function loadScheduleEntries(userId: string): Promise<ScheduleEntry[]> {
  const occs = await prisma.taskOccurrence.findMany({
    where: {
      userId,
      task: { deletedAt: null },
    },
    orderBy: [{ date: "asc" }, { time: "asc" }],
    include: {
      task: {
        select: {
          id:           true,
          name:         true,
          assignmentId: true,
          timeEstimate: true,
          completed:    true,
          deletedAt:    true,
        },
      },
    },
  });

  return occs
    .filter((o) => o.task && !o.task.deletedAt && !o.task.completed)
    .map((o) => ({
      taskId:       o.task.id,
      taskName:     o.task.name,
      assignmentId: o.task.assignmentId,
      timeEstimate: o.task.timeEstimate,
      date:         o.date,
      time:         o.time,
      completed:    o.task.completed,
    }));
}