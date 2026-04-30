// components/landing/Hero.tsx
//
// Chat-first homepage hero. No video background — uses an animated mesh
// gradient. The title/subtitle slide up & fade out the moment the visitor
// sends their first message, letting the chat take over the viewport.
//
// Since the homepage is now JUST this hero (all marketing content moved
// to /info), the "scroll" cue at the bottom is replaced with a small
// "See how it works →" link to /info.

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import Link from "next/link";
import GuestChat from "@/components/landing/GuestChat";

const line1 = ["Understand.", "Plan."];
const line2 = ["Study", "Smarter."];

const wordVariants = {
  hidden:  { opacity: 0, y: 24, filter: "blur(6px)" },
  visible: (i: number) => ({
    opacity: 1, y: 0, filter: "blur(0px)",
    transition: {
      duration: 0.55,
      delay: i * 0.08,
      ease: [0.25, 0.1, 0.25, 1] as const,
    },
  }),
};

export default function Hero() {
  const [chatActive, setChatActive] = useState(false);

  return (
    <section style={{
      minHeight:  "100vh",
      display:    "flex",
      alignItems: "center",
      justifyContent: "center",
      padding:    "96px 16px 56px",
      position:   "relative",
      overflow:   "hidden",
    }}>

      <MeshGradient />

      {/* Soft top-to-bottom dim */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
        background:
          "linear-gradient(to bottom, rgba(6,6,16,0.55) 0%, rgba(6,6,16,0.35) 45%, rgba(6,6,16,0.85) 100%)",
      }} />

      {/* Edge vignette */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
        background:
          "radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0,0,8,0.7) 100%)",
      }} />

      {/* Center column */}
      <div style={{
        position:   "relative",
        zIndex:     10,
        width:      "100%",
        maxWidth:   chatActive ? 820 : 880,
        textAlign:  "center",
        display:    "flex",
        flexDirection: "column",
        alignItems: "center",
        gap:        chatActive ? 0 : 28,
        transition: "max-width 0.5s ease",
      }}>

        {/* Title block — fades out when chat activates */}
        <AnimatePresence mode="wait">
          {!chatActive && (
            <motion.div
              key="title-block"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, y: -36, filter: "blur(8px)" }}
              transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
              style={{ width: "100%" }}
            >
              {/* Pill */}
              <motion.div
                initial={{ opacity: 0, y: 16, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.55 }}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  background: "rgba(124,111,255,0.12)",
                  border: "1px solid rgba(124,111,255,0.3)",
                  borderRadius: 9999,
                  padding: "7px 18px",
                  fontSize: 13, color: "#a78bfa",
                  marginBottom: 28,
                  backdropFilter: "blur(12px)",
                }}
              >
                <motion.span
                  animate={{ rotate: [0, 20, -20, 0] }}
                  transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                  style={{ fontSize: 15 }}
                >
                  ✦
                </motion.span>
                AI-powered academic productivity
              </motion.div>

              {/* Headline */}
              <h1 style={{
                fontSize:   "clamp(2.6rem, 6.5vw, 5.2rem)",
                fontWeight: 800,
                lineHeight: 1.08,
                margin:     0,
                marginBottom: 22,
                position:   "relative",
              }}>
                <div style={{ display: "flex", justifyContent: "center", gap: "0.3em", flexWrap: "wrap", marginBottom: "0.06em" }}>
                  {line1.map((word, i) => (
                    <motion.span
                      key={word}
                      custom={i}
                      variants={wordVariants}
                      initial="hidden"
                      animate="visible"
                      style={{
                        background: "linear-gradient(135deg, #ffffff 0%, #c4b5fd 40%, #7c6fff 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor:  "transparent",
                        backgroundClip:       "text",
                        display: "inline-block",
                      }}
                    >
                      {word}
                    </motion.span>
                  ))}
                </div>
                <div style={{ display: "flex", justifyContent: "center", gap: "0.3em", flexWrap: "wrap" }}>
                  {line2.map((word, i) => (
                    <motion.span
                      key={word}
                      custom={i + line1.length}
                      variants={wordVariants}
                      initial="hidden"
                      animate="visible"
                      style={{ color: "white", display: "inline-block" }}
                    >
                      {word}
                    </motion.span>
                  ))}
                </div>
              </h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.7 }}
                style={{
                  fontSize:   "1.1rem",
                  color:      "rgba(209,213,219,0.92)",
                  maxWidth:   620,
                  margin:     "0 auto 6px",
                  lineHeight: 1.6,
                }}
              >
                An AI platform that reads your assignments, breaks them into tasks,
                and builds your perfect study schedule — automatically.
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Guest chat */}
        <div style={{
          width: "100%",
          marginTop: chatActive ? 0 : 36,
          transition: "margin 0.4s ease",
        }}>
          <GuestChat
            active={chatActive}
            onActivate={() => setChatActive(true)}
          />
        </div>

        {/* "See how it works" link — only when title is showing */}
        <AnimatePresence>
          {!chatActive && (
            <motion.div
              key="info-link"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 1.3, duration: 0.5 }}
              style={{ marginTop: 32 }}
            >
              <Link
                href="/info"
                data-hover
                style={{
                  fontSize:       13,
                  fontWeight:     500,
                  color:          "rgba(167,139,250,0.85)",
                  textDecoration: "none",
                  padding:        "8px 16px",
                  borderRadius:   9999,
                  border:         "1px solid rgba(124,111,255,0.20)",
                  background:     "rgba(124,111,255,0.06)",
                  backdropFilter: "blur(8px)",
                  fontFamily:     "var(--font-sora, 'Sora'), sans-serif",
                  letterSpacing:  "0.02em",
                  cursor:         "none",
                  display:        "inline-flex",
                  alignItems:     "center",
                  gap:            6,
                  transition:     "color 0.2s ease, background 0.2s ease, border-color 0.2s ease",
                }}
              >
                See how it works
                <motion.span
                  animate={{ x: [0, 3, 0] }}
                  transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
                  style={{ display: "inline-block" }}
                >
                  →
                </motion.span>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────
// Animated mesh gradient — replaces the video background
// ─────────────────────────────────────────────────────────────────

function MeshGradient() {
  const blobs = [
    { color: "rgba(124,111,255,0.30)", initial: { x: "10%",  y: "20%" }, animate: { x: ["10%","60%","10%"], y: ["20%","50%","20%"] }, dur: 18 },
    { color: "rgba(91,69,224,0.28)",   initial: { x: "70%",  y: "30%" }, animate: { x: ["70%","20%","70%"], y: ["30%","70%","30%"] }, dur: 22 },
    { color: "rgba(167,139,250,0.22)", initial: { x: "40%",  y: "75%" }, animate: { x: ["40%","80%","40%"], y: ["75%","30%","75%"] }, dur: 26 },
  ];

  return (
    <div
      aria-hidden
      style={{
        position: "absolute", inset: 0, zIndex: 0,
        overflow: "hidden",
        background:
          "radial-gradient(ellipse at 50% 0%, rgba(20,14,52,0.85) 0%, #06060f 70%)",
      }}
    >
      {blobs.map((b, i) => (
        <motion.div
          key={i}
          initial={b.initial}
          animate={b.animate}
          transition={{
            duration: b.dur,
            repeat:   Infinity,
            ease:     "easeInOut",
          }}
          style={{
            position: "absolute",
            width:    "55vmax",
            height:   "55vmax",
            borderRadius: "50%",
            background: `radial-gradient(circle at 50% 50%, ${b.color} 0%, transparent 65%)`,
            filter:   "blur(60px)",
            transform: "translate(-50%, -50%)",
            mixBlendMode: "screen",
          }}
        />
      ))}

      <div style={{
        position: "absolute", inset: 0,
        backgroundImage:
          "radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)",
        backgroundSize: "3px 3px",
        opacity: 0.35,
        mixBlendMode: "screen",
        maskImage: "radial-gradient(ellipse at 50% 50%, black 30%, transparent 80%)",
        WebkitMaskImage: "radial-gradient(ellipse at 50% 50%, black 30%, transparent 80%)",
      }} />
    </div>
  );
}