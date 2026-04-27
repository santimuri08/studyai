// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // 1. Create a test user (email: test@studyai.com, password: password123)
  const passwordHash = await bcrypt.hash("password123", 10);

  const user = await prisma.user.upsert({
    where: { email: "test@studyai.com" },
    update: {},
    create: {
      email: "test@studyai.com",
      name:  "Test Student",
      passwordHash,
    },
  });

  console.log(`  ✓ User ready: ${user.email} (id: ${user.id})`);

  // 2. Load existing localStorage dump (if any) and migrate into DB
  const seedPath = path.join(__dirname, "seed-data.json");
  if (!fs.existsSync(seedPath)) {
    console.log("  (no seed-data.json found, skipping assignments/tasks)");
    return;
  }

  const raw  = fs.readFileSync(seedPath, "utf8");
  const dump = JSON.parse(raw);
  const assignments: any[] = dump?.state?.assignments ?? [];
  const tasks:       any[] = dump?.state?.tasks       ?? [];

  if (assignments.length === 0 && tasks.length === 0) {
    console.log("  (seed-data.json is empty, no assignments/tasks to import)");
    return;
  }

  // Wipe any previous migrated data for this user so re-runs are idempotent
  await prisma.task.deleteMany({ where: { userId: user.id } });
  await prisma.assignment.deleteMany({ where: { userId: user.id } });

  // Map old string ids → new cuid ids so task.assignmentId lines up
  const idMap = new Map<string, string>();

  for (const a of assignments) {
    const created = await prisma.assignment.create({
      data: {
        userId:          user.id,
        title:           a.title           ?? "Untitled Assignment",
        summary:         a.summary         ?? "",
        rawText:         a.rawText         ?? "",
        deadline:        a.deadline        ?? null,
        estimatedHours:  a.estimatedHours  ?? null,
        difficulty:      a.difficulty      ?? null,
        keyRequirements: a.keyRequirements ?? [],
      },
    });
    if (a.id) idMap.set(a.id, created.id);
  }
  console.log(`  ✓ Imported ${assignments.length} assignments`);

  let taskCount = 0;
  for (const t of tasks) {
    const newAssignmentId = idMap.get(t.assignmentId);
    if (!newAssignmentId) continue; // orphan task, skip

    await prisma.task.create({
      data: {
        userId:         user.id,
        assignmentId:   newAssignmentId,
        name:           t.name         ?? t.title ?? "Untitled task",
        timeEstimate:   t.time         ?? t.timeEstimate ?? null,
        scheduledDate:  t.scheduledDate ?? null,
        scheduledTime:  t.scheduledTime ?? null,
        completed:      !!t.completed,
      },
    });
    taskCount++;
  }
  console.log(`  ✓ Imported ${taskCount} tasks`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });