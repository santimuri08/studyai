"use client";
import { motion, useInView, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";

// ── Node graph data ────────────────────────────────────────────────────────────
const nodes = [
  {
    id: "input",
    label: "Assignment",
    icon: "📄",
    color: "#f87171",
    rgb: "248,113,113",
    x: 16, y: 50,
    tooltip: "Paste any assignment text, syllabus, or professor instructions",
  },
  {
    id: "ai",
    label: "AI Processing",
    icon: "⚡",
    color: "#7c6fff",
    rgb: "124,111,255",
    x: 50, y: 50,
    tooltip: "Claude AI reads every requirement, deadline, and expectation",
    isPrimary: true,
  },
  {
    id: "tasks",
    label: "Tasks",
    icon: "✅",
    color: "#34d399",
    rgb: "52,211,153",
    x: 78, y: 22,
    tooltip: "Auto-generated task list with time estimates",
  },
  {
    id: "calendar",
    label: "Calendar",
    icon: "📅",
    color: "#f59e0b",
    rgb: "245,158,11",
    x: 78, y: 78,
    tooltip: "Study sessions auto-scheduled to your calendar",
  },
];

const edges = [
  { from: "input", to: "ai" },
  { from: "ai",    to: "tasks" },
  { from: "ai",    to: "calendar" },
];

// ── Animated SVG line ─────────────────────────────────────────────────────────
function NodeEdge({
  from, to, highlight, inView,
}: {
  from: typeof nodes[0]; to: typeof nodes[0]; highlight: boolean; inView: boolean;
}) {
  // No viewBox — use percentage units directly so lines match node positions exactly
  return (
    <svg
      style={{
        position: "absolute", inset: 0,
        width: "100%", height: "100%",
        pointerEvents: "none", overflow: "visible",
      }}
    >
      <line
        x1={`${from.x}%`} y1={`${from.y}%`}
        x2={`${to.x}%`}   y2={`${to.y}%`}
        stroke="rgba(255,255,255,0.07)" strokeWidth="1"
      />
      <motion.line
        x1={`${from.x}%`} y1={`${from.y}%`}
        x2={`${to.x}%`}   y2={`${to.y}%`}
        stroke={highlight ? from.color : "rgba(124,111,255,0.45)"}
        strokeWidth={highlight ? "1.5" : "1"}
        strokeDasharray="400"
        initial={{ strokeDashoffset: 400 }}
        animate={inView ? {
          strokeDashoffset: 0,
          filter: highlight ? `drop-shadow(0 0 3px ${from.color})` : "none",
        } : {}}
        transition={{ duration: 0.9, delay: 0.5, ease: "easeOut" }}
        style={{ transition: "stroke 0.3s ease, stroke-width 0.3s ease" }}
      />
    </svg>
  );
}

// ── Node ──────────────────────────────────────────────────────────────────────
function Node({
  node, inView, hovered, onHover, index,
}: {
  node: typeof nodes[0]; inView: boolean; hovered: boolean;
  onHover: (id: string | null) => void; index: number;
}) {
  const size = node.isPrimary ? 72 : 58;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.5, delay: 0.3 + index * 0.15, type: "spring", stiffness: 200, damping: 18 }}
      onHoverStart={() => onHover(node.id)}
      onHoverEnd={() => onHover(null)}
      data-hover
      style={{
        position: "absolute",
        left: node.x + "%", top: node.y + "%",
        transform: "translate(-50%, -50%)",
        zIndex: hovered ? 10 : 5,
      }}
    >
      {/* Floating animation */}
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ repeat: Infinity, duration: 3.5 + index * 0.4, ease: "easeInOut", delay: index * 0.5 }}
      >
        {/* Outer glow ring */}
        <motion.div
          animate={{
            scale:   [1, 1.25, 1],
            opacity: hovered ? [0.5, 0.9, 0.5] : [0.2, 0.45, 0.2],
          }}
          transition={{ repeat: Infinity, duration: 2 + index * 0.3, ease: "easeInOut" }}
          style={{
            position: "absolute", inset: `-${size * 0.25}px`,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${node.color}30 0%, transparent 70%)`,
            filter: "blur(4px)",
          }}
        />

        {/* Hover scale wrapper */}
        <motion.div
          animate={{ scale: hovered ? 1.18 : 1 }}
          transition={{ duration: 0.22 }}
          style={{
            width: size + "px", height: size + "px",
            borderRadius: "50%",
            background: `radial-gradient(circle at 35% 35%, ${node.color}30, ${node.color}12)`,
            border: `1.5px solid ${node.color}${hovered ? "80" : "40"}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: node.isPrimary ? "24px" : "20px",
            position: "relative",
            boxShadow: hovered
              ? `0 0 24px ${node.color}60, 0 0 48px ${node.color}25`
              : `0 0 12px ${node.color}25`,
            transition: "box-shadow 0.25s ease, border-color 0.25s ease",
            backdropFilter: "blur(8px)",
          }}
        >
          <motion.span
            animate={{ rotate: node.isPrimary && hovered ? 360 : 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          >
            {node.icon}
          </motion.span>

          {/* Primary node extra ring */}
          {node.isPrimary && (
            <motion.div
              animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "easeOut" }}
              style={{
                position: "absolute", inset: "-4px", borderRadius: "50%",
                border: `1px solid ${node.color}60`,
              }}
            />
          )}
        </motion.div>

        {/* Label */}
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 4 }}
          transition={{ delay: 0.5 + index * 0.1 }}
          style={{
            position: "absolute", top: "calc(100% + 10px)",
            left: "50%", transform: "translateX(-50%)",
            whiteSpace: "nowrap",
            fontSize: "11px", fontWeight: 700, color: hovered ? node.color : "#9ca3af",
            transition: "color 0.2s ease",
            textShadow: hovered ? `0 0 10px ${node.color}60` : "none",
          }}
        >
          {node.label}
        </motion.div>

        {/* Tooltip */}
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{  opacity: 0, y: 4, scale: 0.9 }}
              transition={{ duration: 0.18 }}
              style={{
                position: "absolute",
                bottom: "calc(100% + 16px)",
                // Right-edge nodes shift tooltip left to avoid clipping
                left: node.x > 60 ? "auto" : "50%",
                right: node.x > 60 ? "0" : "auto",
                transform: node.x > 60 ? "none" : "translateX(-50%)",
                background: "rgba(10,10,20,0.95)",
                border: `1px solid ${node.color}60`,
                borderRadius: "10px",
                padding: "10px 14px",
                fontSize: "12px", color: "#e5e7eb",
                width: "180px",
                textAlign: "center",
                boxShadow: `0 8px 24px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)`,
                backdropFilter: "blur(16px)",
                whiteSpace: "normal",
                zIndex: 50,
                lineHeight: 1.55,
              }}
            >
              {node.tooltip}
              {/* Arrow */}
              <div style={{
                position: "absolute", bottom: "-5px", left: "50%",
                transform: "translateX(-50%) rotate(45deg)",
                width: "8px", height: "8px",
                background: "rgba(10,10,20,0.92)",
                border: `1px solid ${node.color}40`,
                borderTop: "none", borderLeft: "none",
              }} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

// ── Demo chat messages ─────────────────────────────────────────────────────────
const demoMessages = [
  { role: "user", text: "Explain what this assignment wants me to do" },
  {
    role: "ai",
    text: "This assignment asks you to write a 6-page research paper analyzing how climate policy affects developing economies. You need 5 peer-reviewed sources from the last 10 years, APA 7th edition formatting, due Friday at 11:59 PM via Canvas.",
  },
  { role: "user", text: "How should I break it into tasks?" },
  {
    role: "ai",
    text: "Here is a 5-step plan:\n1. Find 5 sources (90 min)\n2. Write outline (45 min)\n3. Draft intro and body (2h)\n4. Draft remaining sections (2h)\n5. Revise and citations (1h)",
  },
];

// ── Main ──────────────────────────────────────────────────────────────────────
export default function AISection() {
  const ref     = useRef(null);
  const inView  = useInView(ref, { once: true, margin: "-80px" });
  const [visible, setVisible] = useState(2);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const sectionY = useTransform(scrollYProgress, [0, 0.25], [60, 0]);
  const sectionO = useTransform(scrollYProgress, [0, 0.2], [0, 1]);

  return (
    <motion.section
      ref={ref}
      style={{
        padding: "140px 24px",
        background: "transparent",
        position: "relative", zIndex: 2,
        y: sectionY, opacity: sectionO,
      }}
    >
      {/* Glow */}
      <div style={{
        position: "absolute", top: "20%", left: "50%",
        transform: "translateX(-50%)",
        width: "800px", height: "400px",
        background: "radial-gradient(ellipse, rgba(124,111,255,0.07) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div style={{ maxWidth: "1100px", margin: "0 auto", position: "relative", zIndex: 1 }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          style={{ textAlign: "center", marginBottom: "80px" }}
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            style={{
              display: "inline-block", marginBottom: "16px",
              fontSize: "12px", fontWeight: 700, color: "#7c6fff",
              background: "rgba(124,111,255,0.1)",
              border: "1px solid rgba(124,111,255,0.25)",
              borderRadius: "9999px", padding: "5px 14px",
              letterSpacing: "0.09em", textTransform: "uppercase",
            }}
          >
            How it works
          </motion.span>
          <h2 style={{
            fontSize: "clamp(2rem, 5vw, 3.2rem)", fontWeight: 800,
            color: "white", marginBottom: "14px",
          }}>
            Powered by{" "}
            <span style={{
              background: "linear-gradient(135deg, #fff 0%, #7c6fff 50%, #a78bfa 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>
              Claude AI
            </span>
          </h2>
          <p style={{ color: "#9ca3af", fontSize: "1.05rem" }}>
            The same AI used by researchers and engineers, now working for your GPA.
          </p>
        </motion.div>

        {/* ── Node graph + chat ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "64px", alignItems: "center" }}>

          {/* NODE GRAPH */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            style={{
              background: "rgba(255,255,255,0.025)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "24px",
              padding: "0",
              backdropFilter: "blur(14px)",
              overflow: "visible",
            }}
          >
            {/* Header bar */}
            <div style={{
              padding: "16px 20px",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              display: "flex", alignItems: "center", gap: "8px",
            }}>
              {["#f87171", "#f59e0b", "#34d399"].map(c => (
                <div key={c} style={{ width: "10px", height: "10px", borderRadius: "50%", background: c + "60" }} />
              ))}
              <span style={{ fontSize: "12px", color: "#6b7280", marginLeft: "8px" }}>AI Workflow</span>
              <span style={{ fontSize: "11px", color: "#4b5563", marginLeft: "auto" }}>Hover nodes to explore</span>
            </div>

            {/* Graph canvas */}
            <div style={{ position: "relative", height: "280px", padding: "20px", overflow: "visible" }}>
              {/* Edges */}
              {edges.map(e => {
                const fromNode = nodes.find(n => n.id === e.from)!;
                const toNode   = nodes.find(n => n.id === e.to)!;
                const isHi     = hoveredNode === e.from || hoveredNode === e.to;
                return (
                  <NodeEdge key={e.from + e.to} from={fromNode} to={toNode} highlight={isHi} inView={inView} />
                );
              })}
              {/* Nodes */}
              {nodes.map((n, i) => (
                <Node key={n.id} node={n} inView={inView} index={i}
                  hovered={hoveredNode === n.id}
                  onHover={setHoveredNode}
                />
              ))}
            </div>

            {/* Step legend */}
            <div style={{
              padding: "16px 20px",
              borderTop: "1px solid rgba(255,255,255,0.05)",
              display: "flex", gap: "8px", flexWrap: "wrap",
            }}>
              {nodes.map((n, i) => (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  style={{
                    display: "flex", alignItems: "center", gap: "6px",
                    fontSize: "11px", color: "#6b7280",
                  }}
                >
                  <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: n.color }} />
                  {n.label}
                  {i < nodes.length - 1 && <span style={{ color: "#2d2d3a", marginLeft: "4px" }}>→</span>}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CHAT PANEL */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.35 }}
            style={{
              background: "rgba(255,255,255,0.025)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "24px",
              overflow: "hidden",
              backdropFilter: "blur(14px)",
            }}
          >
            {/* Chat header */}
            <div style={{
              display: "flex", alignItems: "center", gap: "12px",
              padding: "16px 20px",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}>
              <div style={{
                width: "34px", height: "34px", borderRadius: "50%",
                background: "rgba(124,111,255,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "12px", fontWeight: 700, color: "#a78bfa",
                boxShadow: "0 0 12px rgba(124,111,255,0.3)",
              }}>AI</div>
              <div>
                <p style={{ fontSize: "13px", fontWeight: 600, color: "white" }}>StudyAI Assistant</p>
                <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <motion.div
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ repeat: Infinity, duration: 1.8 }}
                    style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#34d399" }}
                  />
                  <p style={{ fontSize: "11px", color: "#34d399" }}>Online · Powered by Claude</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "12px", minHeight: "260px" }}>
              {demoMessages.slice(0, visible).map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.35, type: "spring", stiffness: 260, damping: 22 }}
                  style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}
                >
                  <div style={{
                    maxWidth: "85%", padding: "10px 14px",
                    borderRadius: "14px",
                    fontSize: "13px", lineHeight: 1.6, whiteSpace: "pre-line",
                    background: msg.role === "user"
                      ? "linear-gradient(135deg, #7c6fff, #6366f1)"
                      : "rgba(255,255,255,0.06)",
                    border: msg.role === "user" ? "none" : "1px solid rgba(255,255,255,0.09)",
                    color: "white",
                    boxShadow: msg.role === "user" ? "0 4px 14px rgba(124,111,255,0.3)" : "none",
                  }}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}

              {/* Typing indicator */}
              {visible < demoMessages.length && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{ display: "flex", gap: "4px", padding: "4px 0", paddingLeft: "4px" }}
                >
                  {[0, 1, 2].map(i => (
                    <motion.div
                      key={i}
                      animate={{ y: [0, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 0.9, delay: i * 0.15 }}
                      style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#4b5563" }}
                    />
                  ))}
                </motion.div>
              )}
            </div>

            {visible < demoMessages.length && (
              <div style={{ padding: "0 20px 12px" }}>
                <motion.button
                  data-hover
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={() => setVisible(v => Math.min(v + 2, demoMessages.length))}
                  style={{
                    width: "100%", fontSize: "13px", color: "#7c6fff",
                    background: "rgba(124,111,255,0.08)",
                    border: "1px solid rgba(124,111,255,0.2)",
                    borderRadius: "10px", padding: "8px",
                    cursor: "none",
                  }}
                >
                  Continue conversation →
                </motion.button>
              </div>
            )}

            {/* Input bar */}
            <div style={{ padding: "12px 20px 16px" }}>
              <div style={{
                display: "flex", gap: "8px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "12px", padding: "10px 14px",
              }}>
                <span style={{ color: "#4b5563", fontSize: "13px", flex: 1 }}>Ask about your assignment...</span>
                <span style={{ fontSize: "16px", opacity: 0.4 }}>↑</span>
              </div>
            </div>
          </motion.div>
        </div>

      </div>
    </motion.section>
  );
}