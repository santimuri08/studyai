// app/chat/[id]/page.tsx
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ChatView from "@/components/chat/ChatView";

type Params = { params: Promise<{ id: string }> };

export default async function ChatPage({ params }: Params) {
  const { id } = await params;

  const session = await auth();
  if (!session?.user?.id) notFound();

  const chat = await prisma.chat.findFirst({
    where:   { id, userId: session.user.id },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });

  if (!chat) notFound();

  const messages = chat.messages.map((m) => ({
    id:        m.id,
    role:      m.role as "user" | "assistant",
    content:   m.content,
    cardType:  m.cardType,
    cardData:  m.cardData,
    createdAt: m.createdAt.toISOString(),
  }));

  return (
    <ChatView
      chatId={chat.id}
      initialMessages={messages}
      userName={session.user.name ?? null}
    />
  );
}