"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRef, useEffect, useState } from "react";

// ── Seamless crossfade video loop ─────────────────────────────────────────────
// Two video elements swap opacity as one nears its end, hiding the cut entirely.
function VideoBackground() {
  const vidA = useRef<HTMLVideoElement>(null);
  const vidB = useRef<HTMLVideoElement>(null);
  const [active, setActive] = useState<"a" | "b">("a");

  useEffect(() => {
    const a = vidA.current;
    const b = vidB.current;
    if (!a || !b) return;

    // Slow it down so 6s feels longer and motion is more ambient
    a.playbackRate = 0.6;
    b.playbackRate = 0.6;

    // Duration of crossfade in seconds
    const FADE_BEFORE = 1.2;

    let rafId: number;

    function tick() {
      const current = active === "a" ? a : b;
      if (current && current.duration && !current.paused) {
        const remaining = current.duration - current.currentTime;
        if (remaining <= FADE_BEFORE) {
          // Start the other video slightly before this one ends
          const next = current === a ? b : a;
          if (next && next.paused) {
            next.currentTime = 0;
            next.play().catch(() => {});
            setActive(prev => (prev === "a" ? "b" : "a"));
          }
        }
      }
      rafId = requestAnimationFrame(tick);
    }

    a.play().catch(() => {});
    rafId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sharedStyle: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transition: "opacity 1.2s ease",
  };

  return (
    <>
      <video
        ref={vidA}
        muted
        playsInline
        preload="auto"
        style={{ ...sharedStyle, zIndex: 0, opacity: active === "a" ? 1 : 0 }}
      >
        <source src="/background_video.mp4" type="video/mp4" />
        <source src="/background_video.webm" type="video/webm" />
      </video>
      <video
        ref={vidB}
        muted
        playsInline
        preload="auto"
        style={{ ...sharedStyle, zIndex: 0, opacity: active === "b" ? 1 : 0 }}
      >
        <source src="/background_video.mp4" type="video/mp4" />
        <source src="/background_video.webm" type="video/webm" />
      </video>
    </>
  );
}

// ── Word-by-word headline ─────────────────────────────────────────────────────
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
  return (
    <section style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "0 1rem",
      position: "relative",
      overflow: "hidden",
    }}>

      <VideoBackground />

      {/* Dark overlay */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 1,
        background: "linear-gradient(to bottom, rgba(6,6,16,0.55) 0%, rgba(6,6,16,0.4) 60%, rgba(6,6,16,0.78) 100%)",
      }} />

      {/* Vignette edges */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
        background: "radial-gradient(ellipse at 50% 50%, transparent 42%, rgba(0,0,8,0.68) 100%)",
      }} />

      {/* ── Center content ── */}
      <div style={{
        position: "relative",
        textAlign: "center",
        maxWidth: "820px",
        zIndex: 10,
        padding: "0 16px",
      }}>

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, ease: [0.25, 0.1, 0.25, 1] }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "rgba(124,111,255,0.12)",
            border: "1px solid rgba(124,111,255,0.3)",
            borderRadius: "9999px",
            padding: "7px 18px",
            fontSize: "13px",
            color: "#a78bfa",
            marginBottom: "36px",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
          }}
        >
          <motion.span
            animate={{ rotate: [0, 20, -20, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            style={{ fontSize: "15px" }}
          >
            ✦
          </motion.span>
          AI-powered academic productivity
        </motion.div>

        {/* Headline */}
        <div style={{ position: "relative", marginBottom: "28px" }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.4, delay: 0.2 }}
            style={{
              position: "absolute", inset: "-30px",
              background: "radial-gradient(ellipse at 50% 60%, rgba(124,111,255,0.2) 0%, transparent 65%)",
              filter: "blur(28px)",
              pointerEvents: "none", zIndex: 0,
            }}
          />

          <h1 style={{
            position: "relative", zIndex: 1,
            fontSize: "clamp(2.8rem, 7vw, 5.5rem)",
            fontWeight: 800, lineHeight: 1.08, margin: 0,
          }}>
            <div style={{ display: "flex", justifyContent: "center", gap: "0.3em", flexWrap: "wrap", marginBottom: "0.08em" }}>
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
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
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
        </div>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.65, ease: [0.25, 0.1, 0.25, 1] }}
          style={{
            fontSize: "1.15rem",
            color: "rgba(209,213,219,0.9)",
            maxWidth: "560px",
            margin: "0 auto 48px",
            lineHeight: 1.7,
          }}
        >
          An AI platform that reads your assignments, breaks them into tasks,
          and builds your perfect study schedule automatically.
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.82, ease: [0.25, 0.1, 0.25, 1] }}
          style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{ position: "relative" }}
          >
            <motion.div
              animate={{ opacity: [0.4, 0.8, 0.4], scale: [1, 1.08, 1] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
              style={{
                position: "absolute", inset: "-3px",
                borderRadius: "17px",
                background: "linear-gradient(135deg, #7c6fff, #6366f1, #a78bfa)",
                filter: "blur(8px)",
                zIndex: -1,
              }}
            />
            <Link
              href="/dashboard"
              style={{
                background: "linear-gradient(135deg, #7c6fff 0%, #6366f1 60%, #4f46e5 100%)",
                color: "white",
                fontWeight: 700,
                padding: "15px 38px",
                borderRadius: "14px",
                textDecoration: "none",
                fontSize: "15px",
                display: "inline-block",
                position: "relative",
                boxShadow: "0 0 24px rgba(124,111,255,0.4), inset 0 1px 0 rgba(255,255,255,0.2)",
                letterSpacing: "0.01em",
              }}
            >
              Start Studying Smarter
            </Link>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <a
              href="#features"
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.2)",
                color: "white",
                fontWeight: 600,
                padding: "15px 38px",
                borderRadius: "14px",
                textDecoration: "none",
                fontSize: "15px",
                display: "inline-block",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
              }}
            >
              See Features
            </a>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.7 }}
          style={{ marginTop: "64px", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}
        >
          <div style={{
            width: "24px", height: "38px", borderRadius: "12px",
            border: "1.5px solid rgba(255,255,255,0.22)",
            display: "flex", alignItems: "flex-start", justifyContent: "center",
            padding: "5px", overflow: "hidden",
          }}>
            <motion.div
              animate={{ y: [0, 16, 0], opacity: [1, 0.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
              style={{
                width: "4px", height: "8px", borderRadius: "2px",
                background: "linear-gradient(180deg, #a78bfa, rgba(124,111,255,0.2))",
              }}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            {[0, 1].map((i) => (
              <motion.div
                key={i}
                animate={{ y: [0, 4, 0], opacity: [0.3, 0.7, 0.3] }}
                transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut", delay: i * 0.2 }}
                style={{
                  width: "10px", height: "6px",
                  borderLeft: "1.5px solid rgba(255,255,255,0.3)",
                  borderBottom: "1.5px solid rgba(255,255,255,0.3)",
                  transform: "rotate(-45deg)",
                }}
              />
            ))}
          </div>
          <span style={{ fontSize: "10px", color: "rgba(107,114,128,0.8)", letterSpacing: "0.12em", marginTop: "2px" }}>
            SCROLL
          </span>
        </motion.div>

      </div>
    </section>
  );
}