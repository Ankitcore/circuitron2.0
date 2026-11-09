import React from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

/**
 * RobotMascotBackground
 * Ambient background mascot layer.
 * Strictly non-interactive (pointer-events-none) and placed in the background layer ("at back").
 */
export default function RobotMascotBackground() {
  const { scrollYProgress } = useScroll();

  // Smooth scroll parallax
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 20,
    restDelta: 0.001,
  });

  const swingScrollY = useTransform(smoothProgress, [0, 1], [0, 90]);
  const standScrollY = useTransform(smoothProgress, [0, 1], [0, -70]);

  return (
    <div
      className="fixed inset-0 pointer-events-none select-none overflow-hidden"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    >
      {/* ============================================================ */}
      {/* 1. TOP-RIGHT: Web-Slinging Flying Robot (bot-swing.webp)    */}
      {/* ============================================================ */}
      <motion.div
        style={{
          y: swingScrollY,
        }}
        className="absolute top-12 sm:top-16 -right-4 sm:right-4 md:right-8 lg:right-12 w-28 xs:w-36 sm:w-48 md:w-56 lg:w-64 max-w-[32vw] pointer-events-none"
      >
        {/* Animated Cyber Energy Cable connecting to top edge */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-[2px] h-20 bg-gradient-to-b from-transparent via-cyan-400 to-accent opacity-60 shadow-[0_0_10px_#00ffff] animate-pulse pointer-events-none" />

        {/* Ambient Cyan Aura behind swinging bot */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 sm:w-48 sm:h-48 bg-primary/20 rounded-full blur-3xl pointer-events-none animate-pulse-slow opacity-50" />

        {/* Gentle Ambient Pendulum Swinging & Hover Motion */}
        <motion.div
          animate={{
            rotate: [-4, 6, -4],
            x: [-3, 5, -3],
            y: [0, 10, 0],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="relative w-full pointer-events-none"
        >
          <picture>
            <source srcSet="/assets/bot-swing.webp" type="image/webp" />
            <img
              src="/assets/bot-swing.webp"
              alt="Circuitron Spider Bot Mascot"
              className="w-full h-auto object-contain filter drop-shadow-[0_0_20px_rgba(0,191,255,0.4)] opacity-30 sm:opacity-45 pointer-events-none"
              loading="lazy"
              decoding="async"
            />
          </picture>

          {/* Micro Energy Sparkles around web */}
          <motion.div
            animate={{ opacity: [0.3, 0.85, 0.3], scale: [0.9, 1.2, 0.9] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-4 right-1/4 w-2 h-2 rounded-full bg-cyan-300 shadow-[0_0_12px_#00ffff] pointer-events-none"
          />
        </motion.div>
      </motion.div>

      {/* ============================================================ */}
      {/* 2. BOTTOM-LEFT: Standing Namaste Mascot Robot (bot-welcome.webp) */}
      {/* ============================================================ */}
      <motion.div
        style={{
          y: standScrollY,
        }}
        className="absolute bottom-4 sm:bottom-8 -left-3 sm:left-4 md:left-8 lg:left-12 w-24 xs:w-32 sm:w-44 md:w-52 lg:w-60 max-w-[28vw] pointer-events-none"
      >
        {/* Ambient Hologram Pedestal Glow beneath standing bot */}
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-28 sm:w-44 h-8 bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent rounded-full blur-md animate-pulse pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-28 h-28 sm:w-44 sm:h-44 bg-cyberPurple/25 rounded-full blur-3xl pointer-events-none opacity-40" />

        {/* Floating Idle Levitation Motion */}
        <motion.div
          animate={{
            y: [0, -12, 0],
            rotateZ: [-1, 1.5, -1],
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="relative w-full pointer-events-none"
        >
          <picture>
            <source srcSet="/assets/bot-welcome.webp" type="image/webp" />
            <img
              src="/assets/bot-welcome.webp"
              alt="Circuitron Welcome Mascot Robot"
              className="w-full h-auto object-contain filter drop-shadow-[0_0_20px_rgba(0,191,255,0.35)] opacity-30 sm:opacity-45 pointer-events-none"
              loading="lazy"
              decoding="async"
            />
          </picture>

          {/* Hologram Floating Platform Ring */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-20 sm:w-32 h-3 rounded-full border border-primary/40 border-dashed animate-spin-slow opacity-50 shadow-[0_0_8px_#00bfff] pointer-events-none" />
        </motion.div>
      </motion.div>
    </div>
  );
}
