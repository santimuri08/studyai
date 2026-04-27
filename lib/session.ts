// lib/session.ts
// Helper to get the current session's user on the server.
import { auth } from "@/lib/auth";

export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  return { id: session.user.id, email: session.user.email, name: session.user.name };
}