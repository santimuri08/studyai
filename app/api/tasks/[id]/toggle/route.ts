// app/api/tasks/[id]/toggle/route.ts
// POST /api/tasks/:id/toggle   -> flips completed boolean

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_req: Request, { params }: Ctx) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const task = await prisma.task.findFirst({
    where:  { id, userId: session.user.id, deletedAt: null },
    select: { id: true, completed: true },
  });
  if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.task.update({
    where:  { id: task.id },
    data:   { completed: !task.completed },
    select: { id: true, completed: true },
  });

  return NextResponse.json({ task: updated });
}