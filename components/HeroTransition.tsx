"use client";
import { useScroll, useTransform, motion } from "framer-motion";

/**
 * HeroTransition — sticky dark overlay that fades in as you scroll past the hero.
 * Place directly after <Hero /> in the landing page.
 * zIndex 2: sits above the video/hero overlays but below all section content (z≥10).
 */
export default function HeroTransition() {
  const { scrollY } = useScroll();

  // vh values approximated in px — 600 = ~60vh on a 1000px screen, fine for this effect
  const opacity = useTransform(scrollY, [200, 700], [0, 1]);

  return (
    <motion.div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2,
        pointerEvents: "none",
        // Gradient: transparent top → solid dark bottom so the hero video fades out
        // while the lower sections receive a fully opaque dark base
        background: [
          "linear-gradient(to bottom,",
          "  rgba(6,6,12,0.0)   0%,",
          "  rgba(6,6,12,0.6)  35%,",
          "  rgba(8,8,16,0.88) 60%,",
          "  #0a0a0f           100%",
          ")",
        ].join(" "),
        opacity,
      }}
    />
  );
}