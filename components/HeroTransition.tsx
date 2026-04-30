"use client";
import { useScroll, useTransform, motion } from "framer-motion";

/**
 * HeroTransition — sticky overlay that fades in as you scroll past the hero
 * to bridge the bright mesh gradient into the dark page body.
 *
 * Tuned for the new chat-first hero (no video). The fade now starts later
 * and lands on a fully solid #0a0a0f so the rising sections sit on a clean
 * dark base.
 */
export default function HeroTransition() {
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [300, 850], [0, 1]);

  return (
    <motion.div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2,
        pointerEvents: "none",
        background: [
          "linear-gradient(to bottom,",
          "  rgba(6,6,12,0.0)   0%,",
          "  rgba(6,6,12,0.55) 35%,",
          "  rgba(8,8,16,0.92) 65%,",
          "  #0a0a0f           100%",
          ")",
        ].join(" "),
        opacity,
      }}
    />
  );
}