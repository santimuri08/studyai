// app/chat/layout.tsx
import type { ReactNode } from "react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ChatShell from "@/components/chat/ChatShell";

export default async function ChatLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const chats = await prisma.chat.findMany({
    where:   { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    select:  { id: true, title: true, createdAt: true, updatedAt: true },
  });

  return (
    <ChatShell
      initialChats={chats.map((c) => ({
        id:        c.id,
        title:     c.title,
        updatedAt: c.updatedAt.toISOString(),
      }))}
      user={{
        name:  session.user.name ?? null,
        email: session.user.email ?? "",
      }}
    >
      {children}
    </ChatShell>
  );
}