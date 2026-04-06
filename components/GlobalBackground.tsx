"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * GlobalBackground
 * - Renders the custom cursor + glow trail on ALL pages
 * - Does NOT render parallax orbs — those were replaced by per-section
 *   NeuralBackground components on the landing page, and interior pages
 *   use the solid #0a0a0f body background defined in layout.tsx
 */

function CursorLayer() {
  useEffect(() => {
    const cursor = document.getElementById("custom-cursor") as HTMLElement | null;
    const ring   = document.getElementById("cursor-ring")   as HTMLElement | null;
    if (!cursor || !ring) return;

    const cursorEl: HTMLElement = cursor;
    const ringEl:   HTMLElement = ring;

    let mouseX = -100, mouseY = -100;
    let ringX  = -100, ringY  = -100;
    let rafId: number;
    let lastTrail = 0;

    function onMove(e: MouseEvent) {
      mouseX = e.clientX;
      mouseY = e.clientY;

      const now = Date.now();
      if (now - lastTrail > 40) {
        lastTrail = now;
        const dot = document.createElement("div");
        dot.className    = "cursor-trail";
        dot.style.left   = e.clientX + "px";
        dot.style.top    = e.clientY + "px";
        dot.style.width  = "6px";
        dot.style.height = "6px";
        document.body.appendChild(dot);
        setTimeout(() => dot.remove(), 500);
      }
    }

    function onEnter() {
      cursorEl.classList.add("hovering");
      ringEl.classList.add("hovering");
    }
    function onLeave() {
      cursorEl.classList.remove("hovering");
      ringEl.classList.remove("hovering");
    }

    function tick() {
      ringX += (mouseX - ringX) * 0.12;
      ringY += (mouseY - ringY) * 0.12;
      cursorEl.style.left = mouseX + "px";
      cursorEl.style.top  = mouseY + "px";
      ringEl.style.left   = ringX  + "px";
      ringEl.style.top    = ringY  + "px";
      rafId = requestAnimationFrame(tick);
    }
    tick();

    document.addEventListener("mousemove", onMove);

    const bindInteractables = () => {
      document.querySelectorAll("a, button, [data-hover]").forEach(el => {
        el.addEventListener("mouseenter", onEnter);
        el.addEventListener("mouseleave", onLeave);
      });
    };
    bindInteractables();

    const observer = new MutationObserver(bindInteractables);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener("mousemove", onMove);
      observer.disconnect();
    };
  }, []);

  return (
    <>
      <div id="custom-cursor" />
      <div id="cursor-ring" />
    </>
  );
}

export default function GlobalBackground() {
  return <CursorLayer />;
}