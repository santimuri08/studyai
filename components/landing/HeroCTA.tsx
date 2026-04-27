// components/landing/HeroCTA.tsx
// Session-aware primary CTA for the landing hero.
// Logged in -> /chat, Logged out -> /signup.
"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

export default function HeroCTA() {
  const { data: session, status } = useSession();
  const isAuthed = status === "authenticated" && !!session?.user;

  const href  = isAuthed ? "/chat"           : "/signup";
  const label = isAuthed ? "Open StudyAI"    : "Start Studying Smarter";

  return (
    <Link
      href={href}
      style={{
        background:    "linear-gradient(135deg, #7c6fff 0%, #6366f1 60%, #4f46e5 100%)",
        color:         "white",
        padding:       "15px 34px",
        borderRadius:  14,
        fontSize:      15,
        fontWeight:    700,
        textDecoration: "none",
        boxShadow:     "0 8px 30px rgba(124,111,255,0.4), 0 0 0 1px rgba(255,255,255,0.08) inset",
        transition:    "transform 0.2s ease, box-shadow 0.2s ease",
        display:       "inline-block",
        fontFamily:    "var(--font-sora, 'Sora'), sans-serif",
        letterSpacing: "-0.01em",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 12px 40px rgba(124,111,255,0.55), 0 0 0 1px rgba(255,255,255,0.12) inset";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "";
        e.currentTarget.style.boxShadow = "0 8px 30px rgba(124,111,255,0.4), 0 0 0 1px rgba(255,255,255,0.08) inset";
      }}
    >
      {label}
    </Link>
  );
}