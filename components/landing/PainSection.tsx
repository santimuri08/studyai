"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const pains = [
  {
    icon: "😩",
    title: "You stare at the assignment for 20 minutes",
    sub: "Not sure what it's actually asking. Is it a report? An essay? Both?",
    color: "#f87171",
    rgb: "248,113,113",
  },
  {
    icon: "📋",
    title: "You make a to-do list. It's wrong.",
    sub: "You miss a requirement on page 3. Now it's 11pm the night before.",
    color: "#f59e0b",
    rgb: "245,158,11",
  },
  {
    icon: "📅",
    title: "You have no study plan",
    sub: "You know it's due Friday. You open it Thursday. Sound familiar?",
    color: "#ec4899",
    rgb: "236,72,153",
  },
  {
    icon: "🤯",
    title: "Five tabs open, still confused",
    sub: "APA format? Canvas submission? Word count? It's all buried in the rubric.",
    color: "#a78bfa",
    rgb: "167,139,250",
  },
];

export default function PainSection() {
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <section
      ref={ref}
      style={{
        padding: "140px 24px",
        position: "relative",
        zIndex: 2,
        overflow: "hidden",
      }}
    >
      {/* Subtle top border line */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: 1 } : {}}
        transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
        style={{
          position: "absolute",
          top: 0, left: "10%", right: "10%",
          height: "1px",
          background: "linear-gradient(90deg, transparent, rgba(248,113,113,0.3), transparent)",
          transformOrigin: "left",
        }}
      />

      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "72px" }}>
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.4 }}
            style={{
              display: "inline-block", marginBottom: "20px",
              fontSize: "12px", fontWeight: 700, color: "#f87171",
              background: "rgba(248,113,113,0.08)",
              border: "1px solid rgba(248,113,113,0.22)",
              borderRadius: "9999px", padding: "5px 14px",
              letterSpacing: "0.1em", textTransform: "uppercase",
            }}
          >
            Sound familiar?
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 28 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            style={{
              fontSize: "clamp(2rem,5vw,3.2rem)",
              fontWeight: 800, color: "white",
              lineHeight: 1.1, marginBottom: "16px",
            }}
          >
            Every student knows this{" "}
            <span style={{ color: "#f87171" }}>feeling.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{
              color: "#9ca3af", fontSize: "1.05rem",
              maxWidth: "520px", margin: "0 auto", lineHeight: 1.7,
            }}
          >
            Assignments are written for professors, not students.
            Confusing language, buried requirements, zero structure.
            We fix that.
          </motion.p>
        </div>

        {/* Pain cards — 2×2 grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "20px",
          marginBottom: "72px",
        }}>
          {pains.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 36, scale: 0.96 }}
              animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.15 + i * 0.1, ease: [0.25,0.1,0.25,1] }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              data-hover
              style={{
                background: `rgba(${p.rgb},0.05)`,
                border: `1px solid rgba(${p.rgb},0.18)`,
                borderRadius: "20px",
                padding: "28px",
                backdropFilter: "blur(14px)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Corner glow */}
              <div style={{
                position: "absolute", top: "-20px", right: "-20px",
                width: "80px", height: "80px", borderRadius: "50%",
                background: `radial-gradient(circle, rgba(${p.rgb},0.2) 0%, transparent 70%)`,
                pointerEvents: "none",
              }} />

              <div style={{ fontSize: "28px", marginBottom: "14px" }}>{p.icon}</div>

              <h3 style={{
                fontSize: "1rem", fontWeight: 700,
                color: "white", marginBottom: "8px", lineHeight: 1.3,
              }}>
                {p.title}
              </h3>
              <p style={{ fontSize: "0.875rem", color: "#9ca3af", lineHeight: 1.65 }}>
                {p.sub}
              </p>

              {/* Bottom accent */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={inView ? { scaleX: 1 } : {}}
                transition={{ duration: 0.6, delay: 0.3 + i * 0.1 }}
                style={{
                  position: "absolute", bottom: 0, left: "20px", right: "20px",
                  height: "2px",
                  background: `linear-gradient(90deg, transparent, rgba(${p.rgb},0.5), transparent)`,
                  transformOrigin: "left",
                }}
              />
            </motion.div>
          ))}
        </div>

        {/* Bridge line → AI demo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.55 }}
          style={{ textAlign: "center" }}
        >
          <div style={{
            display: "inline-flex", flexDirection: "column",
            alignItems: "center", gap: "16px",
          }}>
            <p style={{
              fontSize: "1.15rem", fontWeight: 700, color: "white",
              marginBottom: "0",
            }}>
              There's a better way.
            </p>
            <p style={{ fontSize: "0.95rem", color: "#6b7280", maxWidth: "380px", lineHeight: 1.6 }}>
              Paste your assignment. Watch AI turn chaos into a clear, actionable plan — in seconds.
            </p>

            {/* Animated down arrow */}
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
              style={{
                width: "36px", height: "36px", borderRadius: "50%",
                background: "rgba(124,111,255,0.1)",
                border: "1px solid rgba(124,111,255,0.25)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "16px", color: "#a78bfa",
              }}
            >
              ↓
            </motion.div>
          </div>
        </motion.div>

      </div>

      {/* Bottom border line */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: 1 } : {}}
        transition={{ duration: 1.2, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        style={{
          position: "absolute",
          bottom: 0, left: "10%", right: "10%",
          height: "1px",
          background: "linear-gradient(90deg, transparent, rgba(124,111,255,0.2), transparent)",
          transformOrigin: "left",
        }}
      />
    </section>
  );
}