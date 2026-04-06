export type Difficulty = "easy" | "medium" | "hard";
export type AssignmentStatus = "pending" | "analyzed" | "in-progress" | "done";

export interface Task {
  id: string;
  assignmentId: string;
  title: string;
  estimatedMinutes: number;
  scheduledDate?: string;
  scheduledTime?: string;
  completed: boolean;
}

export interface Assignment {
  id: string;
  title: string;
  rawText: string;
  summary?: string;
  tasks?: Task[];
  estimatedHours?: number;
  deadline?: string;
  difficulty?: Difficulty;
  status: AssignmentStatus;
  createdAt: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface AnalysisResult {
  summary: string;
  tasks: { title: string; estimatedMinutes: number }[];
  estimatedHours: number;
  deadline: string;
  difficulty: Difficulty;
  keyRequirements: string[];
}
