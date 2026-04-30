// components/landing/SectionRise.tsx
//
// Wrapper that makes its children "rise up" into view as the user scrolls.
// The visual goal: the user feels content lifting toward them rather than
// the user falling past static content. We translate from below + fade in
// as the section enters the viewport, and add a subtle parallax pull while
// it's visible.

"use client";

import { ReactNode, useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";

interface Props {
  children: ReactNode;
  /** How far below to start (in px). Bigger = more dramatic rise. */
  distance?: number;
  /** Optional delay multiplier on the rise (seconds). */
  delay?:    number;
  /** Class for any extra layout adjustments. */
  className?: string;
}

export default function SectionRise({
  children,
  distance = 80,
  delay    = 0,
  className,
}: Props) {
  const ref           = useRef<HTMLDivElement>(null);
  const reduce        = useReducedMotion();

  // Tracks scroll progress while THIS section is in the viewport.
  // 0 = section just entering from below; 1 = section just leaving up top.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Rise: y starts at +distance (below) and lifts to 0 by the time the
  // section is centered. Continues slightly negative as it leaves so it
  // feels like it's rising past the viewport, not just stopping.
  const y = useTransform(
    scrollYProgress,
    [0, 0.45, 0.9],
    reduce ? [0, 0, 0] : [distance, 0, -distance * 0.35]
  );

  // Fade in while rising; stay solid in the middle; soften as it leaves.
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.25, 0.85, 1],
    reduce ? [1, 1, 1, 1] : [0, 1, 1, 0.7]
  );

  return (
    <motion.div
      ref={ref}
      style={{ y, opacity, willChange: "transform, opacity" }}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}