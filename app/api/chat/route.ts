// app/api/chat/route.ts
//
// Claude-routed chat. The router classifies the user's message into an action,
// passing conversation history so it understands follow-ups.
// Supports list / show_schedule / show_progress / analyze_paste / delete /
// restore / complete / schedule_or_deadline / answer.
// Schedule writes to the TaskOccurrence table (true multi-date support).

import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  loadActiveAssignments,
  loadActiveTasks,
  softDeleteAssignment,
  softDeleteTask,
  restoreAssignment,
  restoreTask,
  completeTask,
  findAssignmentByText,
  findTaskByText,
  computeProgress,
  setTaskOccurrencesForAssignment,
  setTaskOccurrencesForOneTask,
  loadScheduleEntries,
} from "@/lib/userData";
import { parseDates } from "@/lib/dates";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = "claude-sonnet-4-5-20250929";
const DEFAULT_TITLE = "New chat";

function titleFromMessage(text: string): string {
  const t = text.trim().replace(/\s+/g, " ");
  if (t.length <= 48) return t || DEFAULT_TITLE;
  return t.slice(0, 48) + "…";
}

// ──────────────────────────────────────────────────────────────────
// Persistence helpers
// ──────────────────────────────────────────────────────────────────

async function saveAssistant(
  chatId:   string,
  content:  string,
  cardType: string | null = null,
  cardData: unknown       = null,
) {
  return prisma.message.create({
    data: {
      chatId,
      role:     "assistant",
      content,
      cardType: cardType ?? undefined,
      cardData: (cardData as object | null) ?? undefined,
    },
  });
}

async function bump(chatId: string, firstMessage: string | null) {
  await prisma.chat.update({
    where: { id: chatId },
    data: {
      updatedAt: new Date(),
      ...(firstMessage ? { title: titleFromMessage(firstMessage) } : {}),
    },
  });
}

function respond(msg: {
  id: string; content: string; cardType: string | null; cardData: unknown; createdAt: Date;
}) {
  return NextResponse.json({
    ok: true,
    message: {
      id:        msg.id,
      role:      "assistant",
      content:   msg.content,
      cardType:  msg.cardType,
      cardData:  msg.cardData,
      createdAt: msg.createdAt,
    },
  });
}

// ──────────────────────────────────────────────────────────────────
// System prompts
// ──────────────────────────────────────────────────────────────────

const ROUTER_PROMPT = `You are the ROUTER for StudyAI, a chat-first study app. Read the user's latest message in context of the conversation and output the action the app should take.

ALWAYS respond with a single valid JSON object. No markdown, no explanation outside JSON.

Possible actions:

1. { "action": "list_assignments" }
   User wants to see their saved assignments.

2. { "action": "show_schedule" }
   User wants to see their week / scheduled tasks / calendar.

3. { "action": "show_progress" }
   User wants progress, streak, or stats.

4. { "action": "analyze_paste", "rawText": "<the assignment text>" }
   User pasted assignment text (usually 150+ chars, mentions due dates, pages, requirements).
   rawText = the assignment text only — strip any "add this" / "save this" / "delete and add" wrapper wording.

5. { "action": "delete", "kind": "assignment" | "task", "target": "<name>" }
   User wants to remove something.

6. { "action": "restore", "kind": "assignment" | "task", "target": "<name>" }
   User wants to bring back / undo a previous delete (e.g. "restore X", "undo", "give back X", "bring back X").

7. { "action": "complete", "kind": "assignment" | "task", "target": "<name>" }
   User says they finished something.

8. { "action": "schedule_or_deadline",
     "mode": "schedule" | "deadline",
     "target": "<assignment or task name>",
     "datePhrase": "<the part of the message that names dates>"
   }
   User wants to schedule study sessions OR set/change a deadline.
     - mode = "deadline" if the user used words like "deadline", "due date", "due by", "due on", "submit by".
     - mode = "schedule" if the user said "work on", "schedule for", "study on", "put for", "do on", "calendar".
   target = the assignment or task name they referenced.
   datePhrase = the dates/days as the user wrote them (e.g. "May 14", "Tuesday and Friday", "next Monday").

9. { "action": "answer", "needsContext": true | false }
   For everything else — general questions, follow-ups, study advice.
   needsContext = true if answering well requires knowing their assignments/tasks.

IMPORTANT:
- If a message is a FOLLOW-UP to a question the assistant just asked (confirming a date, providing a title), route to "answer". Do NOT fire a command.
- "delete" or "finished" inside a longer message is not automatically a command. Read the meaning. "Delete the placeholder and save this assignment: [paste]" is analyze_paste, not delete.
- "Undo", "give back X", "bring back X", "restore X" → restore.
- "Schedule X for Tuesday", "put X on May 14", "work on X Tuesday and Friday" → schedule_or_deadline (mode: schedule).
- "X is due May 14", "set deadline to May 14", "put X deadline May 14" → schedule_or_deadline (mode: deadline).
- A pasted assignment with surrounding wording → analyze_paste (priority over delete).
- Priority order when ambiguous: analyze_paste > delete > restore > schedule_or_deadline > complete > list_* / show_* > answer.

Respond with the JSON only.`;

function buildAnswerPrompt(context: string): string {
  return `You are StudyAI, an academic assistant for college students. Be friendly, direct, concise. No emojis.

Respond with valid JSON only (no markdown, no preamble):
  { "reply": "your text answer" }

${context}`;
}

function buildAnalyzePrompt(): string {
  return `You analyze assignment text pasted by a student. Return ONLY valid JSON:

{
  "reply":   "Here's what this assignment needs:",
  "title":   "short title — 3-6 words",
  "summary": "2-3 sentence plain-English summary",
  "tasks":   [
    { "name": "step name", "time": "time estimate like '45 min' or '2h'" }
  ],
  "total":   "~X hours",
  "due":     "detected deadline in natural language, or null",
  "keyRequirements": ["requirement 1", "requirement 2"]
}

No markdown fences. JSON only.`;
}

function buildContext(
  assignments: Awaited<ReturnType<typeof loadActiveAssignments>>,
  tasks: Awaited<ReturnType<typeof loadActiveTasks>>,
): string {
  if (assignments.length === 0 && tasks.length === 0) {
    return `USER CONTEXT: The user has no assignments and no tasks saved. If they ask about their week, progress, or assignments, note they haven't added anything yet — do not invent.`;
  }
  const asns = assignments.map((a) => {
    const due = a.deadline ?? "no deadline";
    const hrs = a.estimatedHours ? `, ~${a.estimatedHours}h` : "";
    return `  - ${a.title} (${due}${hrs})`;
  }).join("\n");
  const tks = tasks.map((t) => {
    const when = t.scheduledDate ? `${t.scheduledDate}${t.scheduledTime ? " " + t.scheduledTime : ""}` : "unscheduled";
    const done = t.completed ? " [done]" : "";
    return `  - ${t.name} — ${when}${done}`;
  }).join("\n");
  return `USER CONTEXT (real saved data — answer based on this, do not invent):
ASSIGNMENTS:
${asns || "  none"}

TASKS:
${tks || "  none"}`;
}

// ──────────────────────────────────────────────────────────────────
// Claude helpers
// ──────────────────────────────────────────────────────────────────

type ClaudeMessage = { role: "user" | "assistant"; content: string };

async function callClaude(system: string, messages: ClaudeMessage[]): Promise<string> {
  const response = await anthropic.messages.create({
    model:       MODEL,
    max_tokens:  1024,
    temperature: 0.3,
    system,
    messages,
  });
  const first = response.content[0];
  return first && first.type === "text" ? first.text.trim() : "";
}

function parseJSON<T = unknown>(raw: string): T | null {
  const cleaned = raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/, "")
    .replace(/```\s*$/, "")
    .trim();
  try { return JSON.parse(cleaned) as T; } catch { return null; }
}

// ──────────────────────────────────────────────────────────────────
// Soft-deleted lookup (used by restore)
// ──────────────────────────────────────────────────────────────────

async function findDeletedAssignment(userId: string, target: string) {
  if (!target) return null;
  const t = target.toLowerCase().trim()
    .replace(/^(my|the|that|a|an)\s+/g, "")
    .replace(/\s+(assignment|paper|essay|homework|hw)$/g, "")
    .trim();
  if (!t) return null;

  const deleted = await prisma.assignment.findMany({
    where:   { userId, NOT: { deletedAt: null } },
    orderBy: { deletedAt: "desc" },
    take:    20,
  });

  return (
    deleted.find((a) => a.title.toLowerCase() === t) ??
    deleted.find((a) => a.title.toLowerCase().includes(t)) ??
    deleted.find((a) => t.includes(a.title.toLowerCase())) ??
    null
  );
}

async function findDeletedTask(userId: string, target: string) {
  if (!target) return null;
  const t = target.toLowerCase().trim()
    .replace(/^(my|the|that|a|an)\s+/g, "")
    .trim();
  if (!t) return null;

  const deleted = await prisma.task.findMany({
    where:   { userId, NOT: { deletedAt: null } },
    orderBy: { deletedAt: "desc" },
    take:    30,
  });

  return (
    deleted.find((x) => x.name.toLowerCase() === t) ??
    deleted.find((x) => x.name.toLowerCase().includes(t)) ??
    deleted.find((x) => t.includes(x.name.toLowerCase())) ??
    null
  );
}

// ──────────────────────────────────────────────────────────────────
// Main handler
// ──────────────────────────────────────────────────────────────────

type RouterDecision =
  | { action: "list_assignments" }
  | { action: "show_schedule" }
  | { action: "show_progress" }
  | { action: "analyze_paste"; rawText?: string }
  | { action: "delete";   kind?: "assignment" | "task"; target?: string }
  | { action: "restore";  kind?: "assignment" | "task"; target?: string }
  | { action: "complete"; kind?: "assignment" | "task"; target?: string }
  | { action: "schedule_or_deadline"; mode?: "schedule" | "deadline"; target?: string; datePhrase?: string }
  | { action: "answer";   needsContext?: boolean };

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const body    = await req.json().catch(() => ({}));
    const chatId  = body?.chatId  as string | undefined;
    const message = body?.message as string | undefined;
    if (!chatId || !message) {
      return NextResponse.json({ error: "chatId and message required" }, { status: 400 });
    }

    const chat = await prisma.chat.findFirst({
      where:  { id: chatId, userId },
      select: { id: true, title: true },
    });
    if (!chat) return NextResponse.json({ error: "Chat not found" }, { status: 404 });

    const history = await prisma.message.findMany({
      where: { chatId }, orderBy: { createdAt: "asc" }, take: 20,
    });
    const isFirstMessage = history.length === 0;

    await prisma.message.create({
      data: { chatId, role: "user", content: message },
    });

    const [assignments, tasks] = await Promise.all([
      loadActiveAssignments(userId),
      loadActiveTasks(userId),
    ]);

    // ─── STEP 1: Router ────────────────────────────────────────
    const routerMessages: ClaudeMessage[] = [
      ...history.map((m) => ({
        role:    m.role as "user" | "assistant",
        content: m.content,
      })),
      { role: "user" as const, content: message },
    ];

    const routerRaw = await callClaude(ROUTER_PROMPT, routerMessages);
    const decision  = parseJSON<RouterDecision>(routerRaw) ?? { action: "answer", needsContext: false };

    // ─── LIST ASSIGNMENTS ──────────────────────────────────────
    if (decision.action === "list_assignments") {
      if (assignments.length === 0) {
        const msg = await saveAssistant(chatId, "You don't have any assignments yet. Paste one in and I'll analyze it.");
        await bump(chatId, isFirstMessage ? message : null);
        return respond(msg);
      }
      const msg = await saveAssistant(
        chatId,
        `Here ${assignments.length === 1 ? "is your assignment" : `are your ${assignments.length} assignments`}:`,
        "assignments_list",
        {
          assignments: assignments.map((a) => ({
            id:      a.id,
            title:   a.title,
            summary: a.summary,
            due:     a.deadline ?? "No deadline",
            total:   a.estimatedHours ? `~${a.estimatedHours} hours` : undefined,
            tasks:   a.tasks.map((t) => ({ id: t.id, name: t.name, time: t.timeEstimate, completed: t.completed })),
            keyRequirements: a.keyRequirements ?? [],
          })),
        }
      );
      await bump(chatId, isFirstMessage ? message : null);
      return respond(msg);
    }

    // ─── SHOW SCHEDULE (reads from TaskOccurrence) ─────────────
    if (decision.action === "show_schedule") {
      const entries = await loadScheduleEntries(userId);

      if (entries.length === 0) {
        const msg = await saveAssistant(
          chatId,
          tasks.length === 0
            ? "Nothing on your schedule yet. Paste an assignment and I'll lay out study blocks for you."
            : "You have tasks but none are scheduled yet. Tell me when to work on them — like \"schedule the portfolio for Tuesday and Friday.\""
        );
        await bump(chatId, isFirstMessage ? message : null);
        return respond(msg);
      }

      const msg = await saveAssistant(
        chatId,
        "Here's your week:",
        "schedule",
        {
          tasks: entries.map((e) => ({
            id:    `${e.taskId}-${e.date}`,
            title: e.taskName,
            when:  `${e.date}${e.time ? " " + e.time : ""}`,
            hours: e.timeEstimate,
            date:  e.date,
            time:  e.time,
          })),
        }
      );
      await bump(chatId, isFirstMessage ? message : null);
      return respond(msg);
    }

    // ─── SHOW PROGRESS ─────────────────────────────────────────
    if (decision.action === "show_progress") {
      if (tasks.length === 0) {
        const msg = await saveAssistant(chatId, "You haven't added any tasks yet. Once you do, I can track your progress here.");
        await bump(chatId, isFirstMessage ? message : null);
        return respond(msg);
      }
      const msg = await saveAssistant(chatId, "Here's how you're doing:", "progress", computeProgress(tasks));
      await bump(chatId, isFirstMessage ? message : null);
      return respond(msg);
    }

    // ─── DELETE ────────────────────────────────────────────────
    if (decision.action === "delete") {
      const target = decision.target?.trim();
      if (!target) {
        const msg = await saveAssistant(chatId, "Which one should I remove? Tell me the name.");
        await bump(chatId, isFirstMessage ? message : null);
        return respond(msg);
      }
      const asn = findAssignmentByText(assignments, target);
      if (asn && decision.kind !== "task") {
        await softDeleteAssignment(userId, asn.id);
        const msg = await saveAssistant(
          chatId,
          `Removed "${asn.title}".`,
          "undo",
          { kind: "assignment", id: asn.id, title: asn.title }
        );
        await bump(chatId, isFirstMessage ? message : null);
        return respond(msg);
      }
      const task = findTaskByText(tasks, target);
      if (task) {
        await softDeleteTask(userId, task.id);
        const msg = await saveAssistant(
          chatId,
          `Removed "${task.name}".`,
          "undo",
          { kind: "task", id: task.id, title: task.name }
        );
        await bump(chatId, isFirstMessage ? message : null);
        return respond(msg);
      }
      const msg = await saveAssistant(chatId, `I couldn't find "${target}". What's the exact name?`);
      await bump(chatId, isFirstMessage ? message : null);
      return respond(msg);
    }

    // ─── RESTORE ───────────────────────────────────────────────
    if (decision.action === "restore") {
      const target = decision.target?.trim();
      if (!target) {
        const msg = await saveAssistant(chatId, "Which one should I restore? Tell me the name.");
        await bump(chatId, isFirstMessage ? message : null);
        return respond(msg);
      }

      if (decision.kind !== "task") {
        const deletedAsn = await findDeletedAssignment(userId, target);
        if (deletedAsn) {
          await restoreAssignment(userId, deletedAsn.id);
          const msg = await saveAssistant(chatId, `Restored "${deletedAsn.title}".`);
          await bump(chatId, isFirstMessage ? message : null);
          return respond(msg);
        }
      }

      const deletedTask = await findDeletedTask(userId, target);
      if (deletedTask) {
        await restoreTask(userId, deletedTask.id);
        const msg = await saveAssistant(chatId, `Restored "${deletedTask.name}".`);
        await bump(chatId, isFirstMessage ? message : null);
        return respond(msg);
      }

      const msg = await saveAssistant(chatId, `I couldn't find a deleted "${target}" to restore. What's the exact name?`);
      await bump(chatId, isFirstMessage ? message : null);
      return respond(msg);
    }

    // ─── COMPLETE ──────────────────────────────────────────────
    if (decision.action === "complete") {
      const target = decision.target?.trim();
      if (!target) {
        const msg = await saveAssistant(chatId, "Which task did you finish?");
        await bump(chatId, isFirstMessage ? message : null);
        return respond(msg);
      }
      const task = findTaskByText(tasks, target);
      if (task) {
        await completeTask(userId, task.id);
        const msg = await saveAssistant(chatId, `Nice — marked "${task.name}" as done.`);
        await bump(chatId, isFirstMessage ? message : null);
        return respond(msg);
      }
      const asn = findAssignmentByText(assignments, target);
      if (asn) {
        await prisma.task.updateMany({
          where: { assignmentId: asn.id, userId, deletedAt: null },
          data:  { completed: true },
        });
        const msg = await saveAssistant(chatId, `Marked everything in "${asn.title}" as done. Nice work.`);
        await bump(chatId, isFirstMessage ? message : null);
        return respond(msg);
      }
      const msg = await saveAssistant(chatId, `I couldn't find "${target}". What's the exact name?`);
      await bump(chatId, isFirstMessage ? message : null);
      return respond(msg);
    }

    // ─── SCHEDULE OR DEADLINE ──────────────────────────────────
    if (decision.action === "schedule_or_deadline") {
      const target = decision.target?.trim() ?? "";
      const dates  = parseDates(decision.datePhrase ?? "");
      const mode   = decision.mode ?? "schedule";

      if (!target) {
        const msg = await saveAssistant(chatId, "Which assignment did you mean? Tell me the name.");
        await bump(chatId, isFirstMessage ? message : null);
        return respond(msg);
      }

      if (dates.length === 0) {
        const msg = await saveAssistant(
          chatId,
          `I couldn't pick out a date from that. Try something like "Tuesday", "May 14", or "next Monday".`
        );
        await bump(chatId, isFirstMessage ? message : null);
        return respond(msg);
      }

      const asn = findAssignmentByText(assignments, target);
      const tk  = !asn ? findTaskByText(tasks, target) : null;

      if (!asn && !tk) {
        const msg = await saveAssistant(chatId, `I couldn't find "${target}". What's the exact name?`);
        await bump(chatId, isFirstMessage ? message : null);
        return respond(msg);
      }

      // ── DEADLINE mode ─────────────────────────────────────
      if (mode === "deadline") {
        if (!asn) {
          const msg = await saveAssistant(chatId, `Deadlines are for assignments, but "${target}" matched a task. Try the assignment name.`);
          await bump(chatId, isFirstMessage ? message : null);
          return respond(msg);
        }
        const isoDeadline = dates[dates.length - 1];
        await prisma.assignment.update({
          where: { id: asn.id },
          data:  { deadline: isoDeadline },
        });
        const msg = await saveAssistant(chatId, `Set "${asn.title}" deadline to ${isoDeadline}.`);
        await bump(chatId, isFirstMessage ? message : null);
        return respond(msg);
      }

      // ── SCHEDULE mode (multi-date via TaskOccurrence) ─────
      if (asn) {
        const incompleteCount = asn.tasks.filter((t) => !t.completed).length;
        if (incompleteCount === 0) {
          const msg = await saveAssistant(chatId, `"${asn.title}" has no incomplete tasks to schedule.`);
          await bump(chatId, isFirstMessage ? message : null);
          return respond(msg);
        }

        await setTaskOccurrencesForAssignment(userId, asn.id, dates);

        const dateList = dates.length > 1
          ? `${dates.slice(0, -1).join(", ")} and ${dates[dates.length - 1]}`
          : dates[0];

        const note = dates.length > 1
          ? `Scheduled "${asn.title}" tasks on ${dateList} — they'll show on every date.`
          : `Scheduled "${asn.title}" tasks for ${dates[0]}.`;

        const entries = await loadScheduleEntries(userId);

        const msg = await saveAssistant(
          chatId,
          note,
          "schedule",
          {
            tasks: entries.map((e) => ({
              id:    `${e.taskId}-${e.date}`,
              title: e.taskName,
              when:  `${e.date}${e.time ? " " + e.time : ""}`,
              hours: e.timeEstimate,
              date:  e.date,
              time:  e.time,
            })),
          }
        );
        await bump(chatId, isFirstMessage ? message : null);
        return respond(msg);
      }

      if (tk) {
        await setTaskOccurrencesForOneTask(userId, tk.id, dates);

        const dateList = dates.length > 1
          ? `${dates.slice(0, -1).join(", ")} and ${dates[dates.length - 1]}`
          : dates[0];
        const note = dates.length > 1
          ? `Scheduled "${tk.name}" on ${dateList}.`
          : `Scheduled "${tk.name}" for ${dates[0]}.`;

        const entries = await loadScheduleEntries(userId);

        const msg = await saveAssistant(
          chatId,
          note,
          "schedule",
          {
            tasks: entries.map((e) => ({
              id:    `${e.taskId}-${e.date}`,
              title: e.taskName,
              when:  `${e.date}${e.time ? " " + e.time : ""}`,
              hours: e.timeEstimate,
              date:  e.date,
              time:  e.time,
            })),
          }
        );
        await bump(chatId, isFirstMessage ? message : null);
        return respond(msg);
      }
    }

    // ─── ANALYZE PASTE ─────────────────────────────────────────
    if (decision.action === "analyze_paste") {
      const raw = decision.rawText?.trim() || message;

      const analyzeRaw = await callClaude(buildAnalyzePrompt(), [
        { role: "user", content: `Analyze this assignment:\n\n${raw}` },
      ]);
      const parsed = parseJSON<{
        reply?:   string;
        title?:   string;
        summary?: string;
        tasks?:   Array<{ name?: string; time?: string }>;
        total?:   string;
        due?:     string | null;
        keyRequirements?: string[];
      }>(analyzeRaw);

      if (!parsed || !parsed.title) {
        const msg = await saveAssistant(chatId, "I couldn't extract the assignment structure. Could you paste it again?");
        await bump(chatId, isFirstMessage ? message : null);
        return respond(msg);
      }

      const totalStr = parsed.total ?? "";
      const hrsMatch = totalStr.match(/(\d+(\.\d+)?)/);
      const estimatedHours = hrsMatch ? parseFloat(hrsMatch[1]) : null;

      const assignmentRow = await prisma.assignment.create({
        data: {
          userId,
          title:           parsed.title,
          summary:         parsed.summary ?? "",
          rawText:         raw,
          deadline:        parsed.due ?? null,
          estimatedHours:  estimatedHours ?? undefined,
          keyRequirements: Array.isArray(parsed.keyRequirements) ? parsed.keyRequirements : [],
        },
      });

      const tasksIn = Array.isArray(parsed.tasks) ? parsed.tasks : [];
      if (tasksIn.length > 0) {
        await prisma.task.createMany({
          data: tasksIn.map((t) => ({
            assignmentId: assignmentRow.id,
            userId,
            name:         t.name ?? "Untitled step",
            timeEstimate: t.time ?? null,
          })),
        });
      }

      const saved = await prisma.assignment.findUnique({
        where:   { id: assignmentRow.id },
        include: { tasks: { where: { deletedAt: null } } },
      });

      const msg = await saveAssistant(
        chatId,
        parsed.reply ?? "Here's what this assignment needs:",
        "assignment",
        {
          id:      saved?.id,
          title:   saved?.title,
          summary: saved?.summary,
          tasks:   saved?.tasks.map((t) => ({
            id:        t.id,
            name:      t.name,
            time:      t.timeEstimate,
            completed: t.completed,
          })),
          total:   parsed.total,
          due:     parsed.due ?? undefined,
          keyRequirements: parsed.keyRequirements ?? [],
        }
      );
      await bump(chatId, isFirstMessage ? message : null);
      return respond(msg);
    }

    // ─── ANSWER (catch-all) ────────────────────────────────────
    const wantsContext = decision.action === "answer" && decision.needsContext;
    const context      = wantsContext ? buildContext(assignments, tasks) : "";
    const system       = buildAnswerPrompt(context);

    const replyRaw = await callClaude(system, [
      ...history.map((m) => ({
        role:    m.role as "user" | "assistant",
        content: m.content,
      })),
      { role: "user" as const, content: message },
    ]);
    const parsedReply = parseJSON<{ reply?: string }>(replyRaw);
    const replyText   = parsedReply?.reply ?? replyRaw ?? "Sorry, I had trouble with that.";

    const msg = await saveAssistant(chatId, replyText);
    await bump(chatId, isFirstMessage ? message : null);
    return respond(msg);

  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("Chat error:", msg);
    return NextResponse.json({ error: "Processing failed: " + msg }, { status: 500 });
  }
}