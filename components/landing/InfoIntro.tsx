// components/landing/InfoIntro.tsx
//
// Short intro at the top of /info. Replaces the role the hero used to
// play on the landing page — gives the user something to anchor on
// before the rising sections begin.

"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function InfoIntro() {
  return (
    <section style={{
      position:   "relative",
      minHeight:  "60vh",
      display:    "flex",
      alignItems: "center",
      justifyContent: "center",
      padding:    "140px 20px 80px",
      overflow:   "hidden",
    }}>

      {/* Background glow — single soft purple ellipse, no video */}
      <div aria-hidden style={{
        position: "absolute", inset: 0, zIndex: 0,
        background:
          "radial-gradient(ellipse at 50% 30%, rgba(124,111,255,0.18) 0%, transparent 60%)",
      }} />

      <div style={{
        position: "relative", zIndex: 1,
        textAlign: "center", maxWidth: 820,
      }}>
        {/* Pill */}
        <motion.div
          initial={{ opacity: 0, y: 14, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5 }}
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(124,111,255,0.12)",
            border: "1px solid rgba(124,111,255,0.3)",
            borderRadius: 9999,
            padding: "6px 16px",
            fontSize: 12, color: "#a78bfa",
            marginBottom: 22,
            backdropFilter: "blur(12px)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            fontWeight: 700,
          }}
        >
          How it works
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.1 }}
          style={{
            fontSize:   "clamp(2.4rem, 5.5vw, 4.4rem)",
            fontWeight: 800,
            lineHeight: 1.08,
            margin:     "0 0 18px",
            letterSpacing: "-0.025em",
          }}
        >
          <span style={{ color: "white" }}>From messy assignment{" "}</span>
          <span style={{
            background: "linear-gradient(135deg, #ffffff 0%, #c4b5fd 40%, #7c6fff 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor:  "transparent",
            backgroundClip:       "text",
          }}>
            to a clear plan.
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.2 }}
          style={{
            fontSize: "1.1rem",
            color:    "rgba(209,213,219,0.85)",
            maxWidth: 580,
            margin:   "0 auto 28px",
            lineHeight: 1.65,
          }}
        >
          StudyAI reads what your professor wrote, breaks it into real tasks,
          schedules them on your calendar, and keeps track of how you&apos;re doing —
          all powered by Claude.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.32 }}
          style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}
        >
          <Link
            href="/"
            data-hover
            style={{
              fontSize:      14,
              fontWeight:    700,
              color:         "white",
              textDecoration: "none",
              padding:       "12px 24px",
              borderRadius:  12,
              background:    "linear-gradient(135deg, #7c6fff 0%, #5b45e0 100%)",
              boxShadow:     "0 6px 20px rgba(124,92,255,0.4)",
              fontFamily:    "var(--font-sora, 'Sora'), sans-serif",
              cursor:        "none",
              display:       "inline-flex",
              alignItems:    "center",
              gap:           8,
            }}
          >
            Try it now <span style={{ fontSize: 16 }}>→</span>
          </Link>
          <Link
            href="/signup"
            data-hover
            style={{
              fontSize:      14,
              fontWeight:    600,
              color:         "rgba(229,231,235,0.95)",
              textDecoration: "none",
              padding:       "12px 22px",
              borderRadius:  12,
              background:    "rgba(255,255,255,0.04)",
              border:        "1px solid rgba(255,255,255,0.10)",
              backdropFilter: "blur(10px)",
              fontFamily:    "var(--font-sora, 'Sora'), sans-serif",
              cursor:        "none",
            }}
          >
            Create an account
          </Link>
        </motion.div>

        {/* Scroll cue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.5 }}
          style={{
            marginTop: 56,
            display: "flex", flexDirection: "column",
            alignItems: "center", gap: 6,
          }}
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
            style={{
              width: 22, height: 34, borderRadius: 12,
              border: "1.5px solid rgba(255,255,255,0.18)",
              display: "flex", alignItems: "flex-start", justifyContent: "center",
              padding: 4,
            }}
          >
            <motion.div
              animate={{ y: [0, 12, 0], opacity: [1, 0.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
              style={{
                width: 3, height: 7, borderRadius: 2,
                background: "linear-gradient(180deg, #a78bfa, rgba(124,111,255,0.2))",
              }}
            />
          </motion.div>
          <span style={{
            fontSize: 10, letterSpacing: "0.14em",
            color: "rgba(167,139,250,0.55)", marginTop: 2,
          }}>
            SCROLL
          </span>
        </motion.div>
      </div>
    </section>
  );
}