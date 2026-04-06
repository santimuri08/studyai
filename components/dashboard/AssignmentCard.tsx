"use client";
import { motion } from "framer-motion";
import Link from "next/link";

interface Props {
  assignment: {
    id: string;
    title: string;
    dueDate: string;
    hours: number;
    difficulty: "easy" | "medium" | "hard";
    status: "pending" | "in-progress" | "done";
  };
}

const difficultyColor = { easy: "#34d399", medium: "#f59e0b", hard: "#ef4444" };
const statusLabel = { pending: "Not started", "in-progress": "In progress", done: "Done" };

export default function AssignmentCard({ assignment }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      className="glass rounded-2xl p-5 border border-white/5 hover:border-white/10 transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-white text-lg mb-1">{assignment.title}</h3>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span>📅 Due {assignment.dueDate}</span>
            <span>⏱ {assignment.hours}h estimated</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span
            className="text-xs px-2 py-1 rounded-full"
            style={{
              color: difficultyColor[assignment.difficulty],
              background: `${difficultyColor[assignment.difficulty]}20`,
            }}
          >
            {assignment.difficulty}
          </span>
          <span className="text-xs text-gray-500">{statusLabel[assignment.status]}</span>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <Link
          href="/assignments"
          className="text-sm bg-[#7c6fff]/20 text-[#7c6fff] px-3 py-1.5 rounded-lg hover:bg-[#7c6fff]/30 transition-colors"
        >
          View breakdown
        </Link>
        <Link
          href="/chat"
          className="text-sm glass border border-white/10 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors text-gray-300"
        >
          Ask AI
        </Link>
      </div>
    </motion.div>
  );
}