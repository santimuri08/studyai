"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useDroppable } from "@dnd-kit/core";
import type { Task } from "@/types";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const TIME_SLOTS = ["8 AM", "10 AM", "12 PM", "2 PM", "4 PM", "6 PM", "8 PM"];

// Colors per task index
const TASK_COLORS = [
  "#7c6fff", "#34d399", "#f59e0b", "#ec4899", "#60a5fa", "#a78bfa", "#fb7185",
];

interface CalendarSlot {
  day: string;
  time: string;
  task?: Task;
}

interface Props {
  tasks: Task[];
  onScheduleTask: (taskId: string, day: string, time: string) => void;
}

function DroppableCell({
  day,
  time,
  task,
  colorIndex,
}: {
  day: string;
  time: string;
  task?: Task;
  colorIndex: number;
}) {
  const id = `${day}-${time}`;
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[56px] rounded-lg border transition-all p-1.5 ${
        isOver
          ? "border-[#7c6fff]/60 bg-[#7c6fff]/10"
          : task
          ? "border-white/10 bg-white/5"
          : "border-white/5 hover:border-white/10"
      }`}
    >
      {task && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-md px-2 py-1.5 text-xs font-medium truncate"
          style={{
            background: `${TASK_COLORS[colorIndex % TASK_COLORS.length]}25`,
            color: TASK_COLORS[colorIndex % TASK_COLORS.length],
            border: `1px solid ${TASK_COLORS[colorIndex % TASK_COLORS.length]}30`,
          }}
        >
          {task.title}
          <span className="block text-[10px] opacity-60 mt-0.5">{task.estimatedMinutes}m</span>
        </motion.div>
      )}
      {isOver && !task && (
        <div className="h-full flex items-center justify-center text-[#7c6fff] text-xs">
          Drop here
        </div>
      )}
    </div>
  );
}

export default function StudyCalendar({ tasks, onScheduleTask }: Props) {
  // Build a map of scheduled tasks
  const scheduledMap: Record<string, { task: Task; colorIndex: number }> = {};
  tasks.forEach((t, i) => {
    if (t.scheduledDate && t.scheduledTime) {
      const key = `${t.scheduledDate}-${t.scheduledTime}`;
      scheduledMap[key] = { task: t, colorIndex: i };
    }
  });

  function autoSchedule() {
    const unscheduled = tasks.filter((t) => !t.scheduledDate);
    let dayIdx = 0;
    let timeIdx = 0;
    unscheduled.forEach((task) => {
      const day = DAYS[dayIdx];
      const time = TIME_SLOTS[timeIdx];
      onScheduleTask(task.id, day, time);
      timeIdx++;
      if (timeIdx >= TIME_SLOTS.length) {
        timeIdx = 0;
        dayIdx = (dayIdx + 1) % DAYS.length;
      }
    });
  }

  return (
    <div className="glass rounded-2xl border border-white/5 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
        <h3 className="font-semibold text-white">Study Calendar</h3>
        <button
          onClick={autoSchedule}
          className="text-xs bg-[#7c6fff]/20 text-[#7c6fff] px-3 py-1.5 rounded-lg hover:bg-[#7c6fff]/30 transition-colors border border-[#7c6fff]/20"
        >
          ✨ Auto-Schedule
        </button>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[700px] p-4">
          {/* Day headers */}
          <div className="grid grid-cols-8 gap-2 mb-2">
            <div className="text-xs text-gray-600 flex items-end pb-1">Time</div>
            {DAYS.map((d) => (
              <div key={d} className="text-xs text-gray-400 font-medium text-center py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Time rows */}
          {TIME_SLOTS.map((time) => (
            <div key={time} className="grid grid-cols-8 gap-2 mb-2">
              <div className="text-xs text-gray-600 flex items-center">{time}</div>
              {DAYS.map((day) => {
                const key = `${day}-${time}`;
                const entry = scheduledMap[key];
                return (
                  <DroppableCell
                    key={key}
                    day={day}
                    time={time}
                    task={entry?.task}
                    colorIndex={entry?.colorIndex ?? 0}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="px-5 py-3 border-t border-white/5 flex items-center gap-2">
        <span className="text-xs text-gray-600">Drag tasks from the planner to schedule them</span>
      </div>
    </div>
  );
}