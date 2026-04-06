"use client";
import { motion } from "framer-motion";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
  delay?: number;
  onClick?: () => void;
  glow?: boolean;
  glowColor?: string;
}

export default function AnimatedCard({
  children,
  className = "",
  delay = 0,
  onClick,
  glow = false,
  glowColor = "#7c6fff",
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ scale: 1.015, y: -2 }}
      onClick={onClick}
      className={`glass rounded-2xl border border-white/5 hover:border-white/10 transition-all duration-300 ${
        onClick ? "cursor-pointer" : ""
      } ${className}`}
      style={
        glow
          ? {
              boxShadow: `0 0 30px ${glowColor}20, 0 0 60px ${glowColor}10`,
            }
          : {}
      }
    >
      {children}
    </motion.div>
  );
}