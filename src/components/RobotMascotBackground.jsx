import React, { useState } from "react";
import { isLowEndDevice, isMobileDevice, shouldReduceMotion } from "../utils/performance";

/**
 * RobotMascotBackground
 * Ambient background mascot layer.
 * Optimized with pure CSS GPU-accelerated transforms for 60 FPS on low-end laptops and mobile.
 */
export default function RobotMascotBackground() {
  const [isLowSpec] = useState(() => isLowEndDevice());
  const [isMobile] = useState(() => isMobileDevice());
  const [reduceMotion] = useState(() => shouldReduceMotion());

  return (
    <div
      className="fixed inset-0 pointer-events-none select-none overflow-hidden"
      style={{ zIndex: 0, willChange: "transform", transform: "translateZ(0)" }}
      aria-hidden="true"
    >
      {/* ============================================================ */}
      {/* 1. TOP-RIGHT: Web-Slinging Flying Robot (bot-swing.webp)    */}
      {/* ============================================================ */}
      <div className="absolute top-12 sm:top-16 -right-4 sm:right-4 md:right-8 lg:right-12 w-28 xs:w-36 sm:w-48 md:w-56 lg:w-64 max-w-[32vw] pointer-events-none">
        {/* Cyber Energy Cable */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-[2px] h-20 bg-gradient-to-b from-transparent via-cyan-400 to-accent opacity-50 pointer-events-none" />

        {/* Ambient Aura: Lightweight gradient instead of expensive blur-3xl */}
        {!isLowSpec && !isMobile && (
          <div
            className="absolute top-1/4 left-1/4 w-32 h-32 sm:w-48 sm:h-48 rounded-full pointer-events-none opacity-40"
            style={{
              background: "radial-gradient(circle, rgba(0, 191, 255, 0.25) 0%, transparent 70%)",
            }}
          />
        )}

        {/* Gentle Pendulum Swing: Pure GPU CSS Animation (0 JS overhead) */}
        <div className={`relative w-full pointer-events-none ${reduceMotion ? "" : "robot-swing-anim"}`}>
          <picture>
            <source srcSet="/assets/bot-swing.webp" type="image/webp" />
            <img
              src="/assets/bot-swing.webp"
              alt="Circuitron Spider Bot Mascot"
              className="w-full h-auto object-contain opacity-30 sm:opacity-45 pointer-events-none"
              style={{ willChange: "transform", transform: "translateZ(0)" }}
              loading="lazy"
              decoding="async"
            />
          </picture>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. BOTTOM-LEFT: Standing Namaste Mascot Robot (bot-welcome.webp) */}
      {/* ============================================================ */}
      <div className="absolute bottom-4 sm:bottom-8 -left-3 sm:left-4 md:left-8 lg:right-auto w-24 xs:w-32 sm:w-44 md:w-52 lg:w-60 max-w-[28vw] pointer-events-none">
        {/* Ambient Floor Aura: Lightweight gradient */}
        {!isLowSpec && !isMobile && (
          <div
            className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-32 sm:w-48 h-10 rounded-full pointer-events-none opacity-30"
            style={{
              background: "radial-gradient(ellipse at center, rgba(0, 229, 255, 0.2) 0%, transparent 75%)",
            }}
          />
        )}

        {/* Floating Idle Levitation: Pure GPU CSS Animation (0 JS overhead) */}
        <div className={`relative w-full pointer-events-none ${reduceMotion ? "" : "robot-float-anim"}`}>
          <picture>
            <source srcSet="/assets/bot-welcome.webp" type="image/webp" />
            <img
              src="/assets/bot-welcome.webp"
              alt="Circuitron Welcome Mascot Robot"
              className="w-full h-auto object-contain opacity-30 sm:opacity-45 pointer-events-none"
              style={{ willChange: "transform", transform: "translateZ(0)" }}
              loading="lazy"
              decoding="async"
            />
          </picture>
        </div>
      </div>
    </div>
  );
}
