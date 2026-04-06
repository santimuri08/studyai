"use client";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";

// ── Icon set ──────────────────────────────────────────────────
function IconBrain({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 2A2.5 2.5 0 017 4.5v0A2.5 2.5 0 014.5 7v0A2.5 2.5 0 012 9.5v0A2.5 2.5 0 014.5 12v0A2.5 2.5 0 017 14.5v0A2.5 2.5 0 019.5 17v0"/>
      <path d="M14.5 2A2.5 2.5 0 0117 4.5v0A2.5 2.5 0 0119.5 7v0A2.5 2.5 0 0122 9.5v0A2.5 2.5 0 0119.5 12v0A2.5 2.5 0 0117 14.5v0A2.5 2.5 0 0114.5 17v0"/>
      <path d="M9.5 17v.5a2.5 2.5 0 005 0V17"/>
      <path d="M12 2v15"/>
    </svg>
  );
}

function IconCalendar({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2.5" />
      <path d="M16 2v4M8 2v4M3 10h18" />
      <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
    </svg>
  );
}

function IconChat({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      <path d="M8 10h8M8 14h5" />
    </svg>
  );
}

function IconChart({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 20V10M12 20V4M6 20v-6" />
      <path d="M3 20h18" />
    </svg>
  );
}

const features = [
  {
    Icon: IconBrain,
    title: "AI Assignment Interpreter",
    description: "Paste any assignment and get a clear summary, task list, and time estimate in seconds.",
    color: "#7C5CFF",
    rgb: "124,92,255",
    glow: "rgba(124,92,255,0.22)",
    tag: "Most Used",
  },
  {
    Icon: IconCalendar,
    title: "Drag-to-Schedule",
    description: "Drag AI-generated tasks directly onto your calendar. Or hit Auto-Schedule and let AI do it.",
    color: "#34d399",
    rgb: "52,211,153",
    glow: "rgba(52,211,153,0.18)",
    tag: "Smart",
  },
  {
    Icon: IconChat,
    title: "AI Chat Assistant",
    description: "Ask anything: explain a concept, adjust your schedule, or get study advice anytime.",
    color: "#f59e0b",
    rgb: "245,158,11",
    glow: "rgba(245,158,11,0.18)",
    tag: "24/7",
  },
  {
    Icon: IconChart,
    title: "Progress Tracking",
    description: "See your weekly study hours, streaks, and completion rates in a beautiful dashboard.",
    color: "#ec4899",
    rgb: "236,72,153",
    glow: "rgba(236,72,153,0.18)",
    tag: "Insights",
  },
];

function FeatureCard({ feature, index, inView }: { feature: typeof features[0]; index: number; inView: boolean }) {
  const [hovered, setHovered] = useState(false);
  const delay = index * 0.1;
  const { Icon } = feature;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover={{ scale: 1.025, y: -5, transition: { duration: 0.2, ease: "easeOut" } }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      data-hover
      style={{
        position: "relative",
        borderRadius: "20px",
        padding: "26px",
        cursor: "default",
        overflow: "hidden",
        background: "rgba(255,255,255,0.03)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        boxShadow: hovered
          ? `0 22px 55px rgba(0,0,0,0.45), 0 0 28px rgba(${feature.rgb},0.13)`
          : "0 4px 18px rgba(0,0,0,0.18)",
        transition: "box-shadow 0.24s ease",
      }}
    >
      {/* Gradient border */}
      <motion.div
        animate={{ opacity: hovered ? 1 : 0.32 }}
        transition={{ duration: 0.22 }}
        style={{
          position: "absolute", inset: 0, borderRadius: "20px",
          padding: "1px",
          background: `linear-gradient(135deg, ${feature.color}66, transparent 50%, ${feature.color}22)`,
          WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          pointerEvents: "none",
        }}
      />

      {/* Hover glow */}
      <motion.div
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.28 }}
        style={{
          position: "absolute", inset: 0, borderRadius: "20px",
          background: `radial-gradient(ellipse at 15% 15%, ${feature.glow} 0%, transparent 60%)`,
          pointerEvents: "none",
        }}
      />

      {/* Tag */}
      <div
        style={{
          position: "absolute", top: "14px", right: "14px",
          fontSize: "10px", fontWeight: 700,
          fontFamily: "var(--font-sora, 'Sora'), sans-serif",
          color: feature.color,
          background: feature.color + "16",
          border: `1px solid ${feature.color}30`,
          borderRadius: "9999px", padding: "2px 9px",
          letterSpacing: "0.06em",
        }}
      >
        {feature.tag}
      </div>

      {/* Icon */}
      <motion.div
        style={{ marginBottom: "18px", position: "relative", width: "fit-content" }}
        animate={{ y: hovered ? -3 : 0 }}
        transition={{ duration: 0.2 }}
      >
        <motion.div
          animate={{ scale: [1, 1.25, 1], opacity: hovered ? [0.5, 0.8, 0.5] : [0.28, 0.5, 0.28] }}
          transition={{ repeat: Infinity, duration: 2.6 + index * 0.3 }}
          style={{
            position: "absolute", inset: "-6px", borderRadius: "18px",
            background: feature.glow, filter: "blur(10px)", zIndex: 0,
          }}
        />
        <div
          style={{
            width: "50px", height: "50px", borderRadius: "14px",
            background: feature.color + "1a",
            border: `1px solid ${feature.color}3a`,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: feature.color,
            position: "relative", zIndex: 1,
            boxShadow: hovered ? `0 0 14px ${feature.color}35` : "none",
            transition: "box-shadow 0.22s ease",
          }}
        >
          <Icon size={20} />
        </div>
      </motion.div>

      {/* Text */}
      <h3
        style={{
          fontSize: "1rem", fontWeight: 700,
          fontFamily: "var(--font-sora, 'Sora'), sans-serif",
          color: "var(--text)",
          marginBottom: "9px",
          letterSpacing: "-0.02em",
          position: "relative", zIndex: 1,
        }}
      >
        {feature.title}
      </h3>
      <p
        style={{
          color: "var(--text-muted)",
          lineHeight: 1.65,
          fontSize: "0.895rem",
          position: "relative", zIndex: 1,
        }}
      >
        {feature.description}
      </p>

      {/* Bottom accent */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: hovered ? 1 : 0.55 } : {}}
        transition={{ duration: hovered ? 0.22 : 0.55, delay: hovered ? 0 : delay + 0.3 }}
        style={{
          position: "absolute", bottom: 0, left: "18px", right: "18px",
          height: "1.5px",
          background: `linear-gradient(90deg, transparent, ${feature.color}70, transparent)`,
          borderRadius: "9999px", transformOrigin: "left",
        }}
      />
    </motion.div>
  );
}

function StatsBar({ inView }: { inView: boolean }) {
  const stats = [
    { value: "10k+", label: "Students",        color: "#7C5CFF" },
    { value: "95%",  label: "Better grades",   color: "#34d399" },
    { value: "3x",   label: "Faster planning", color: "#f59e0b" },
    { value: "4.9★", label: "Rating",          color: "#ec4899" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay: 0.68 }}
      style={{
        display: "flex", justifyContent: "center", gap: "48px",
        flexWrap: "wrap", marginTop: "56px", padding: "26px 40px",
        background: "rgba(255,255,255,0.02)",
        border: "1px solid var(--border)",
        borderRadius: "20px",
        backdropFilter: "blur(14px)",
      }}
    >
      {stats.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.38, delay: 0.76 + i * 0.08 }}
          whileHover={{ scale: 1.07 }}
          data-hover
          style={{ textAlign: "center" }}
        >
          <p
            style={{
              fontSize: "1.65rem", fontWeight: 800,
              fontFamily: "var(--font-sora, 'Sora'), sans-serif",
              color: s.color, marginBottom: "3px",
              letterSpacing: "-0.03em",
              textShadow: `0 0 18px ${s.color}55`,
            }}
          >
            {s.value}
          </p>
          <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: 0 }}>{s.label}</p>
        </motion.div>
      ))}
    </motion.div>
  );
}

export default function FeaturesSection() {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const sectionY = useTransform(scrollYProgress, [0, 0.25], [55, 0]);
  const sectionO = useTransform(scrollYProgress, [0, 0.18], [0, 1]);

  return (
    <motion.section
      id="features"
      ref={ref}
      style={{
        padding: "130px 24px",
        background: "transparent",
        position: "relative",
        zIndex: 2,
        y: sectionY,
        opacity: sectionO,
      }}
    >
      {/* Background glow */}
      <div style={{
        position: "absolute", top: "8%", left: "50%",
        transform: "translateX(-50%)",
        width: "800px", height: "400px",
        background: "radial-gradient(ellipse, rgba(124,92,255,0.055) 0%, transparent 70%)",
        pointerEvents: "none", zIndex: 0,
      }} />

      <div style={{ maxWidth: "1100px", margin: "0 auto", position: "relative", zIndex: 1 }}>

        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.38 }}
          style={{ display: "flex", justifyContent: "center", marginBottom: "18px" }}
        >
          <span className="eyebrow">Features</span>
        </motion.div>

        {/* Title */}
        <div style={{ textAlign: "center", marginBottom: "18px" }}>
          <div style={{
            display: "flex", justifyContent: "center", flexWrap: "wrap",
            gap: "0.28em",
            fontSize: "clamp(1.8rem, 4.5vw, 3rem)",
            fontWeight: 700, lineHeight: 1.1, marginBottom: "0.1em",
            fontFamily: "var(--font-sora, 'Sora'), sans-serif",
            letterSpacing: "-0.025em",
          }}>
            {["Everything", "you", "need", "to", "succeed"].map((word, i) => (
              <motion.span
                key={word + i}
                initial={{ opacity: 0, y: 24, filter: "blur(5px)" }}
                animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
                transition={{ duration: 0.48, delay: i * 0.07, ease: [0.25, 0.1, 0.25, 1] }}
                style={
                  i === 4
                    ? {
                        background: "linear-gradient(135deg, #ffffff 0%, #c4b5fd 40%, #7C5CFF 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                        display: "inline-block",
                      }
                    : { color: "var(--text)", display: "inline-block" }
                }
              >
                {word}
              </motion.span>
            ))}
          </div>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.45, delay: 0.48 }}
            style={{ color: "var(--text-muted)", fontSize: "1.05rem", margin: 0 }}
          >
            Built for students who want to study smarter, not harder.
          </motion.p>
        </div>

        {/* Cards */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(248px, 1fr))",
          gap: "18px", marginTop: "52px",
        }}>
          {features.map((f, i) => (
            <FeatureCard key={f.title} feature={f} index={i} inView={inView} />
          ))}
        </div>

        <StatsBar inView={inView} />

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.9, duration: 0.45 }}
          style={{ textAlign: "center", marginTop: "44px" }}
        >
          <motion.a
            href="/dashboard"
            data-hover
            whileHover={{ scale: 1.04, boxShadow: "0 8px 30px rgba(124,92,255,0.5)" }}
            whileTap={{ scale: 0.97 }}
            style={{
              background: "linear-gradient(135deg, var(--primary), #5b45e0)",
              color: "white",
              fontWeight: 700,
              fontFamily: "var(--font-sora, 'Sora'), sans-serif",
              fontSize: "14px",
              letterSpacing: "-0.01em",
              padding: "14px 42px",
              borderRadius: "14px",
              textDecoration: "none",
              display: "inline-block",
              boxShadow: "0 4px 20px rgba(124,92,255,0.3)",
            }}
          >
            Get started free →
          </motion.a>
        </motion.div>

      </div>
    </motion.section>
  );
}