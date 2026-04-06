"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Task } from "@/types";

interface Props {
  tasks: Task[];
  onTasksChange: (tasks: Task[]) => void;
}

function SortableTask({ task, onToggle }: { task: Task; onToggle: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
        task.completed
          ? "bg-white/3 border-white/5 opacity-60"
          : "bg-white/5 border-white/10 hover:border-[#7c6fff]/30"
      } ${isDragging ? "shadow-lg shadow-[#7c6fff]/20" : ""}`}
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-gray-600 hover:text-gray-400 transition-colors px-1"
      >
        ⣿
      </div>

      {/* Checkbox */}
      <button
        onClick={() => onToggle(task.id)}
        className={`w-5 h-5 rounded flex-shrink-0 border-2 flex items-center justify-center transition-all ${
          task.completed
            ? "bg-[#7c6fff] border-[#7c6fff]"
            : "border-white/20 hover:border-[#7c6fff]"
        }`}
      >
        {task.completed && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-white text-xs"
          >
            ✓
          </motion.span>
        )}
      </button>

      {/* Task info */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm ${task.completed ? "line-through text-gray-500" : "text-gray-200"}`}>
          {task.title}
        </p>
        {task.scheduledDate && (
          <p className="text-xs text-gray-500 mt-0.5">
            📅 {task.scheduledDate} {task.scheduledTime && `at ${task.scheduledTime}`}
          </p>
        )}
      </div>

      {/* Time badge */}
      <span className="text-xs text-gray-500 bg-white/5 rounded-lg px-2 py-1 flex-shrink-0">
        {task.estimatedMinutes}m
      </span>
    </div>
  );
}

export default function TaskPlanner({ tasks, onTasksChange }: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = tasks.findIndex((t) => t.id === active.id);
      const newIndex = tasks.findIndex((t) => t.id === over.id);
      onTasksChange(arrayMove(tasks, oldIndex, newIndex));
    }
  }

  function toggleTask(id: string) {
    onTasksChange(tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  }

  const done = tasks.filter((t) => t.completed).length;
  const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;

  return (
    <div className="glass rounded-2xl p-5 border border-white/5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-white">Task Planner</h3>
        <span className="text-xs text-gray-400">{done}/{tasks.length} done</span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-white/5 rounded-full mb-5 overflow-hidden">
        <motion.div
          className="h-full bg-[#7c6fff] rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {tasks.length === 0 ? (
        <p className="text-center text-gray-600 py-8 text-sm">
          No tasks yet. Analyze an assignment to generate tasks.
        </p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {tasks.map((task) => (
                <SortableTask key={task.id} task={task} onToggle={toggleTask} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}