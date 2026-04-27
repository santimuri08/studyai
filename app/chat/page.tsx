// app/chat/page.tsx
// Entry point for /chat — redirects to the user's most recent chat,
// or creates a new one if they have none.

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function ChatIndexPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const latest = await prisma.chat.findFirst({
    where:   { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    select:  { id: true },
  });

  if (latest) {
    redirect(`/chat/${latest.id}`);
  }

  const fresh = await prisma.chat.create({
    data:   { userId: session.user.id, title: "New chat" },
    select: { id: true },
  });
  redirect(`/chat/${fresh.id}`);
}