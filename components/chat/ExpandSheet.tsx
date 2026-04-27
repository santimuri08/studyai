// components/chat/ExpandSheet.tsx
// Full-page overlay on desktop. Bottom sheet on mobile.
// Close button is top-right.
"use client";

import { useEffect, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

function useIsMobile(breakpoint = 700) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq     = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [breakpoint]);
  return isMobile;
}

interface Props {
  open:    boolean;
  onClose: () => void;
  title:   string;
  children: ReactNode;
}

export default function ExpandSheet({ open, onClose, title, children }: Props) {
  const isMobile = useIsMobile();

  // Lock body scroll while open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop (mobile only — desktop is full-page) */}
          {isMobile && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              style={{
                position: "fixed", inset: 0, zIndex: 200,
                background: "rgba(2, 3, 8, 0.65)",
                backdropFilter: "blur(8px)",
              }}
            />
          )}

          {/* Panel */}
          <motion.div
            initial={
              isMobile
                ? { y: "100%" }
                : { opacity: 0, scale: 0.985 }
            }
            animate={
              isMobile
                ? { y: 0 }
                : { opacity: 1, scale: 1 }
            }
            exit={
              isMobile
                ? { y: "100%" }
                : { opacity: 0, scale: 0.985 }
            }
            transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
            role="dialog"
            aria-modal="true"
            style={{
              position:   "fixed",
              zIndex:     201,
              background: "rgba(8, 10, 22, 0.985)",
              backdropFilter: "blur(20px)",
              display:    "flex",
              flexDirection: "column",
              overflow:   "hidden",
              ...(isMobile
                ? {
                    left: 0, right: 0, bottom: 0,
                    maxHeight: "90vh",
                    borderRadius: "20px 20px 0 0",
                    border:    "1px solid var(--border)",
                    borderBottom: "none",
                    boxShadow: "0 -24px 80px rgba(0,0,0,0.6)",
                  }
                : {
                    inset: 0,                // top:0 right:0 bottom:0 left:0 — full viewport
                    borderRadius: 0,
                  }),
            }}
          >
            {/* Mobile drag handle */}
            {isMobile && (
              <div style={{ display: "flex", justifyContent: "center", padding: "8px 0 4px" }}>
                <div style={{
                  width: 38, height: 4, borderRadius: 4,
                  background: "rgba(255,255,255,0.18)",
                }} />
              </div>
            )}

            {/* Header */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: isMobile ? "16px 20px 14px" : "22px 32px 20px",
              borderBottom: "1px solid var(--border)",
              flexShrink: 0,
            }}>
              <h2 style={{
                fontSize:    isMobile ? 16 : 22,
                fontWeight:  700,
                fontFamily: "var(--font-sora, 'Sora'), sans-serif",
                letterSpacing: "-0.025em",
                color:      "var(--text)",
                margin:     0,
                whiteSpace: "nowrap",
                overflow:   "hidden",
                textOverflow: "ellipsis",
                paddingRight: 16,
              }}>
                {title}
              </h2>
              <button
                onClick={onClose}
                aria-label="Close"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  padding: isMobile ? "8px 12px" : "10px 14px",
                  color: "var(--text-muted)",
                  fontSize: isMobile ? 16 : 18,
                  lineHeight: 1,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontFamily: "var(--font-sora, 'Sora'), sans-serif",
                  fontWeight: 500,
                  transition: "background 0.15s ease, color 0.15s ease, border-color 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                  e.currentTarget.style.color = "var(--text)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                  e.currentTarget.style.color = "var(--text-muted)";
                  e.currentTarget.style.borderColor = "var(--border)";
                }}
              >
                {!isMobile && <span style={{ fontSize: 13 }}>Close</span>}
                <span>×</span>
              </button>
            </div>

            {/* Body (scrollable) */}
            <div style={{
              flex: 1,
              overflowY: "auto",
              padding: isMobile ? "18px 20px 24px" : "32px max(40px, calc((100vw - 800px) / 2)) 48px",
              fontFamily: "var(--font-dm-sans, 'DM Sans'), sans-serif",
            }}>
              <div style={{ maxWidth: 800, margin: "0 auto" }}>
                {children}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}