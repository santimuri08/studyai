// components/landing/TopNav.tsx
"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { motion } from "framer-motion";

export default function TopNav() {
  const { data: session, status } = useSession();
  const isAuthed = status === "authenticated";

  return (
    <motion.nav
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      style={{
        position:   "fixed",
        top:        0,
        left:       0,
        right:      0,
        zIndex:     100,
        display:    "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding:    "18px 28px",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        background: "linear-gradient(to bottom, rgba(6,6,16,0.5) 0%, rgba(6,6,16,0) 100%)",
      }}
    >
      {/* Logo */}
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
        <div style={{
          width: 30, height: 30, borderRadius: 9,
          background: "linear-gradient(135deg, #7c6fff, #5b45e0)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 12, fontWeight: 800, color: "white",
          fontFamily: "var(--font-sora, 'Sora'), sans-serif",
          boxShadow: "0 4px 12px rgba(124,92,255,0.35)",
        }}>S</div>
        <span style={{
          fontWeight: 700, fontSize: 15,
          color: "white",
          fontFamily: "var(--font-sora, 'Sora'), sans-serif",
          letterSpacing: "-0.02em",
        }}>StudyAI</span>
      </Link>

      {/* Right side */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {isAuthed ? (
          <>
            <span style={{ fontSize: 13, color: "rgba(229,231,235,0.7)", marginRight: 4 }}>
              {session?.user?.name ?? session?.user?.email}
            </span>
            <Link
              href="/chat"
              style={navButtonPrimaryStyle}
            >
              Open StudyAI
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              style={navButtonGhostStyle}
            >
              Log out
            </button>
          </>
        ) : (
          <>
            <Link href="/login" style={navButtonGhostStyle}>
              Log in
            </Link>
            <Link href="/signup" style={navButtonPrimaryStyle}>
              Sign up
            </Link>
          </>
        )}
      </div>
    </motion.nav>
  );
}

const navButtonGhostStyle: React.CSSProperties = {
  fontSize:      13,
  fontWeight:    600,
  color:         "rgba(229,231,235,0.9)",
  textDecoration: "none",
  padding:       "8px 14px",
  borderRadius:  10,
  background:    "rgba(255,255,255,0.04)",
  border:        "1px solid rgba(255,255,255,0.08)",
  backdropFilter: "blur(8px)",
  cursor:        "pointer",
  fontFamily:    "var(--font-sora, 'Sora'), sans-serif",
};

const navButtonPrimaryStyle: React.CSSProperties = {
  fontSize:      13,
  fontWeight:    700,
  color:         "white",
  textDecoration: "none",
  padding:       "8px 16px",
  borderRadius:  10,
  background:    "linear-gradient(135deg, #7c6fff 0%, #5b45e0 100%)",
  boxShadow:     "0 4px 14px rgba(124,92,255,0.35)",
  fontFamily:    "var(--font-sora, 'Sora'), sans-serif",
  cursor:        "pointer",
};