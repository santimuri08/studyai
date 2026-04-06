"use client";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { ReactNode } from "react";

const cardItem: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] as const } },
};

const stagger: Variants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.08 } },
};

// PageWrapper is now just a passthrough — transitions handled by root layout
export function PageWrapper({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function FadeIn({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function SlideUp({
  children,
  delay = 0,
}: {
  children: ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerList({ children }: { children: ReactNode }) {
  return (
    <motion.div variants={stagger} initial="initial" animate="animate">
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  style,
}: {
  children: ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <motion.div variants={cardItem} style={style}>
      {children}
    </motion.div>
  );
}

export function AnimatedCard({
  children,
  delay = 0,
  style,
  onClick,
}: {
  children: ReactNode;
  delay?: number;
  style?: React.CSSProperties;
  onClick?: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3, scale: 1.01 }}
      transition={{ duration: 0.35, delay, ease: [0.25, 0.1, 0.25, 1] }}
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : "default", ...style }}
    >
      {children}
    </motion.div>
  );
}

export function SectionHeader({
  children,
  delay = 0,
}: {
  children: ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  );
}