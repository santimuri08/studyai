"use client";
import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

type Variant = "dim" | "normal" | "bright";

interface Props {
  variant?: Variant;       // controls opacity intensity
  gradientFrom?: string;   // section accent colour (css colour)
  gradientTo?: string;
}

// ── Per-variant config ────────────────────────────────────────────────────────
const VARIANTS: Record<Variant, { dotAlpha: number; lineAlpha: number; dotCount: number }> = {
  dim:    { dotAlpha: 0.18, lineAlpha: 0.08, dotCount: 38 },
  normal: { dotAlpha: 0.28, lineAlpha: 0.13, dotCount: 52 },
  bright: { dotAlpha: 0.38, lineAlpha: 0.18, dotCount: 62 },
};

// ── Neural canvas ─────────────────────────────────────────────────────────────
function NeuralCanvas({ variant = "normal" }: { variant: Variant }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cfg       = VARIANTS[variant];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let rafId: number;

    type Node = {
      x: number; y: number;
      vx: number; vy: number;
      r: number;
      pulse: number;
      pulseSpeed: number;
    };

    const nodes: Node[] = [];
    const CONNECTION_DIST = 160;

    function resize() {
      if (!canvas) return;
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    for (let i = 0; i < cfg.dotCount; i++) {
      nodes.push({
        x:          Math.random() * canvas.width,
        y:          Math.random() * canvas.height,
        vx:         (Math.random() - 0.5) * 0.22,
        vy:         (Math.random() - 0.5) * 0.22,
        r:          Math.random() * 1.6 + 0.7,
        pulse:      Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.012 + 0.006,
      });
    }

    function draw() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Move nodes
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        n.pulse += n.pulseSpeed;
        if (n.x < 0)             { n.x = 0;             n.vx *= -1; }
        if (n.x > canvas.width)  { n.x = canvas.width;  n.vx *= -1; }
        if (n.y < 0)             { n.y = 0;             n.vy *= -1; }
        if (n.y > canvas.height) { n.y = canvas.height; n.vy *= -1; }
      }

      // Draw connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx   = nodes[i].x - nodes[j].x;
          const dy   = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_DIST) {
            // Fade line as nodes move apart
            const alpha = cfg.lineAlpha * (1 - dist / CONNECTION_DIST);
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(124,111,255,${alpha.toFixed(3)})`;
            ctx.lineWidth   = 0.7;
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      for (const n of nodes) {
        const liveAlpha = cfg.dotAlpha * (0.75 + 0.25 * Math.sin(n.pulse));
        const liveR     = n.r * (0.9 + 0.15 * Math.sin(n.pulse));

        // Soft glow
        const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, liveR * 4.5);
        g.addColorStop(0,   `rgba(167,139,250,${liveAlpha})`);
        g.addColorStop(1,   `rgba(167,139,250,0)`);
        ctx.beginPath();
        ctx.arc(n.x, n.y, liveR * 4.5, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();

        // Core dot
        ctx.beginPath();
        ctx.arc(n.x, n.y, liveR, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(196,181,253,${Math.min(liveAlpha * 1.8, 1)})`;
        ctx.fill();
      }

      rafId = requestAnimationFrame(draw);
    }
    draw();

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
    };
  }, [cfg]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute", inset: 0,
        width: "100%", height: "100%",
        pointerEvents: "none",
        display: "block",
      }}
    />
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
/**
 * NeuralBackground
 * Usage: wrap your section content, or place it absolute inside a relative section.
 *
 * <NeuralBackground variant="normal" gradientFrom="rgba(124,111,255,0.07)">
 *   ... section content ...
 * </NeuralBackground>
 */
export default function NeuralBackground({
  variant = "normal",
  gradientFrom = "rgba(124,111,255,0.06)",
  gradientTo   = "transparent",
  children,
}: Props & { children?: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });

  // Parallax: canvas moves at 40% of scroll speed → depth illusion
  const canvasY = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  // Fade in the whole neural layer as section scrolls into view
  const layerOpacity = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0, 1, 1, 0]);

  return (
    <div ref={ref} style={{ position: "relative", overflow: "hidden" }}>

      {/* Dark base */}
      <div style={{
        position: "absolute", inset: 0,
        background: "#0a0a0f",
        zIndex: 0,
      }} />

      {/* Section-specific gradient accent */}
      <div style={{
        position: "absolute", inset: 0,
        background: `radial-gradient(ellipse at 50% 0%, ${gradientFrom} 0%, ${gradientTo} 65%)`,
        zIndex: 0,
        pointerEvents: "none",
      }} />

      {/* Neural canvas — parallax layer */}
      <motion.div
        style={{
          position: "absolute", inset: "-10%",
          y: canvasY,
          opacity: layerOpacity,
          zIndex: 0,
          pointerEvents: "none",
        }}
      >
        <NeuralCanvas variant={variant} />
      </motion.div>

      {/* Content sits above canvas */}
      <div style={{ position: "relative", zIndex: 2 }}>
        {children}
      </div>
    </div>
  );
}