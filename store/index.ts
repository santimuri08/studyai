/**
 * store/index.ts
 *
 * WHERE TO PUT THIS FILE:
 *   Your project root on disk is: /Users/santimuri08/Desktop/studyai/studyai/
 *   Create a new folder:          studyai/store/
 *   Save this file as:            studyai/store/index.ts
 *
 *   It must sit at the same level as your app/, components/, lib/ folders.
 *
 * INSTALL FIRST:
 *   npm install zustand
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Assignment, Task, AnalysisResult } from "@/types";

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

export interface StoreAssignment extends Assignment {
  rawText: string;
  keyRequirements: string[];
  savedAt: string;
}

export interface WeeklyDay {
  day: string;
  hours: number;
  tasks: number;
}

export interface AssignmentProgress {
  id: string;
  title: string;
  dueDate: string;
  difficulty: string;
  total: number;
  done: number;
  pct: number;
  color: string;
}

export interface DashboardStats {
  totalAssignments: number;
  totalTasks: number;
  completedTasks: number;
  scheduledTasks: number;
  studyHoursScheduled: number;
  studyHoursCompleted: number;
  weeklyHours: WeeklyDay[];
  assignmentProgress: AssignmentProgress[];
  streak: number;
}

export interface AppState {
  assignments: StoreAssignment[];
  tasks: Task[];
  addAssignment: (title: string, rawText: string, result: AnalysisResult) => StoreAssignment;
  removeAssignment: (id: string) => void;
  toggleTask: (taskId: string) => void;
  scheduleTask: (taskId: string, date: string, time: string) => void;
  unscheduleTask: (taskId: string) => void;
  autoSchedule: (assignmentId: string) => void;
  autoScheduleAll: () => void;
  getTasksForAssignment: (assignmentId: string) => Task[];
  getScheduledTasks: () => Task[];
  getDashboardStats: () => DashboardStats;
}

const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const DIFF_COLORS: Record<string, string> = {
  easy:   "#34d399",
  medium: "#f59e0b",
  hard:   "#ef4444",
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      assignments: [],
      tasks: [],

      addAssignment(title: string, rawText: string, result: AnalysisResult): StoreAssignment {
        const id  = uid();
        const now = new Date().toISOString();
        const assignment: StoreAssignment = {
          id,
          title:          title.trim() || "Untitled Assignment",
          rawText,
          summary:        result.summary,
          estimatedHours: result.estimatedHours,
          deadline:       result.deadline,
          difficulty:     result.difficulty,
          keyRequirements: result.keyRequirements ?? [],
          status:    "pending",
          createdAt: now,
          savedAt:   now,
        };
        const newTasks: Task[] = result.tasks.map((t) => ({
          id:               uid(),
          assignmentId:     id,
          title:            t.title,
          estimatedMinutes: t.estimatedMinutes,
          completed:        false,
        }));
        set((s) => ({
          assignments: [assignment, ...s.assignments],
          tasks:       [...newTasks, ...s.tasks],
        }));
        return assignment;
      },

      removeAssignment(id: string): void {
        set((s) => ({
          assignments: s.assignments.filter((a) => a.id !== id),
          tasks:       s.tasks.filter((t) => t.assignmentId !== id),
        }));
      },

      toggleTask(taskId: string): void {
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === taskId ? { ...t, completed: !t.completed } : t
          ),
        }));
      },

      scheduleTask(taskId: string, date: string, time: string): void {
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === taskId ? { ...t, scheduledDate: date, scheduledTime: time } : t
          ),
        }));
      },

      unscheduleTask(taskId: string): void {
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === taskId
              ? { ...t, scheduledDate: undefined, scheduledTime: undefined }
              : t
          ),
        }));
      },

      autoSchedule(assignmentId: string): void {
        const { tasks } = get();
        const unscheduled = tasks.filter(
          (t) => t.assignmentId === assignmentId && !t.scheduledDate
        );
        if (!unscheduled.length) return;

        const TIME_SLOTS = [
          "8:00 AM", "10:00 AM", "12:00 PM",
          "2:00 PM", "4:00 PM",  "6:00 PM",
        ];
        const MAX_MIN_PER_DAY = 240;
        const base = new Date();
        const dates: string[] = Array.from({ length: 14 }, (_: unknown, i: number) => {
          const d = new Date(base);
          d.setDate(base.getDate() + i);
          return d.toISOString().split("T")[0];
        });

        const used: Record<string, number> = {};
        dates.forEach((d) => { used[d] = 0; });
        tasks
          .filter((t) => t.scheduledDate && dates.includes(t.scheduledDate))
          .forEach((t) => {
            used[t.scheduledDate!] = (used[t.scheduledDate!] ?? 0) + t.estimatedMinutes;
          });

        const updates: { id: string; date: string; time: string }[] = [];
        for (const task of unscheduled) {
          for (const date of dates) {
            if ((used[date] ?? 0) + task.estimatedMinutes <= MAX_MIN_PER_DAY) {
              const slotIdx = Math.floor((used[date] ?? 0) / 40) % TIME_SLOTS.length;
              updates.push({ id: task.id, date, time: TIME_SLOTS[slotIdx] });
              used[date] = (used[date] ?? 0) + task.estimatedMinutes;
              break;
            }
          }
        }

        set((s) => ({
          tasks: s.tasks.map((t) => {
            const u = updates.find((x) => x.id === t.id);
            return u ? { ...t, scheduledDate: u.date, scheduledTime: u.time } : t;
          }),
        }));
      },

      autoScheduleAll(): void {
        get().assignments.forEach((a) => get().autoSchedule(a.id));
      },

      getTasksForAssignment(assignmentId: string): Task[] {
        return get().tasks.filter((t) => t.assignmentId === assignmentId);
      },

      getScheduledTasks(): Task[] {
        return get().tasks.filter((t) => !!t.scheduledDate);
      },

      getDashboardStats(): DashboardStats {
        const { assignments, tasks } = get();

        const completedTasks      = tasks.filter((t) => t.completed).length;
        const scheduledTasks      = tasks.filter((t) => !!t.scheduledDate).length;
        const studyHoursScheduled = Math.round(
          (tasks
            .filter((t) => !!t.scheduledDate)
            .reduce((s, t) => s + t.estimatedMinutes, 0) / 60) * 10
        ) / 10;
        const studyHoursCompleted = Math.round(
          (tasks
            .filter((t) => t.completed)
            .reduce((s, t) => s + t.estimatedMinutes, 0) / 60) * 10
        ) / 10;

        const weeklyMap: Record<string, { hours: number; tasks: number }> = {};
        WEEK_DAYS.forEach((d) => { weeklyMap[d] = { hours: 0, tasks: 0 }; });
        tasks
          .filter((t) => !!t.scheduledDate)
          .forEach((t) => {
            const date = new Date(t.scheduledDate!);
            const day  = WEEK_DAYS[date.getDay() === 0 ? 6 : date.getDay() - 1];
            if (weeklyMap[day]) {
              weeklyMap[day].hours += t.estimatedMinutes / 60;
              weeklyMap[day].tasks += 1;
            }
          });

        const weeklyHours: WeeklyDay[] = WEEK_DAYS.map((d) => ({
          day:   d,
          hours: Math.round(weeklyMap[d].hours * 10) / 10,
          tasks: weeklyMap[d].tasks,
        }));

        const assignmentProgress: AssignmentProgress[] = assignments.map((a) => {
          const aTasks = tasks.filter((t) => t.assignmentId === a.id);
          const done   = aTasks.filter((t) => t.completed).length;
          return {
            id:         a.id,
            title:      a.title,
            dueDate:    a.deadline  ?? "Not specified",
            difficulty: a.difficulty ?? "medium",
            total:      aTasks.length,
            done,
            pct:   aTasks.length ? Math.round((done / aTasks.length) * 100) : 0,
            color: DIFF_COLORS[a.difficulty ?? "medium"] ?? "#7C5CFF",
          };
        });

        return {
          totalAssignments:  assignments.length,
          totalTasks:        tasks.length,
          completedTasks,
          scheduledTasks,
          studyHoursScheduled,
          studyHoursCompleted,
          weeklyHours,
          assignmentProgress,
          streak: Math.min(completedTasks + assignments.length, 7),
        };
      },
    }),
    {
      name:        "studyai-v1",
      partialize: (s) => ({ assignments: s.assignments, tasks: s.tasks }),
    }
  )
);