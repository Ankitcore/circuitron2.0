import React, { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, useMotionTemplate } from "framer-motion";

export default function InteractiveCyberGrid() {
  const [hasPointer, setHasPointer] = useState(false);

  // Mouse coordinate motion values
  const mouseX = useMotionValue(-1000);
  const mouseY = useMotionValue(-1000);

  // Smooth springs for fluid radar flashlight tracking
  const springX = useSpring(mouseX, { stiffness: 150, damping: 25 });
  const springY = useSpring(mouseY, { stiffness: 150, damping: 25 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!hasPointer) setHasPointer(true);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [hasPointer, mouseX, mouseY]);

  // Dynamic radial gradient spotlight attached to mouse
  const spotlightBackground = useMotionTemplate`radial-gradient(650px circle at ${springX}px ${springY}px, rgba(0, 229, 255, 0.12), rgba(139, 92, 246, 0.05) 45%, transparent 75%)`;

  return (
    <div
      className="fixed inset-0 pointer-events-none select-none overflow-hidden"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    >
      {/* 1. Interactive Cursor Radar Spotlight */}
      {hasPointer && (
        <motion.div
          style={{ background: spotlightBackground }}
          className="absolute inset-0 transition-opacity duration-500 opacity-100"
        />
      )}

      {/* 2. Cyberpunk Animated Vector Circuit Traces & PCB Buses */}
      <svg
        className="absolute inset-0 w-full h-full opacity-40 md:opacity-50"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Laser Gradients */}
          <linearGradient id="cyanLaser" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00fffc" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#0091ff" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.1" />
          </linearGradient>

          <linearGradient id="purpleLaser" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.7" />
            <stop offset="50%" stopColor="#00e5ff" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#00fffc" stopOpacity="0.2" />
          </linearGradient>

          {/* Glow filter */}
          <filter id="circuitGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* STATIC COPPER TRACE BASE LINES */}
        <g stroke="rgba(0, 191, 255, 0.12)" strokeWidth="1" fill="none">
          {/* Top-left circuit trace */}
          <path d="M 0 120 L 220 120 L 320 220 L 680 220 L 740 280 L 1100 280" />
          <path d="M 0 140 L 200 140 L 300 240 L 660 240" />

          {/* Top-right circuit trace */}
          <path d="M 1920 180 L 1600 180 L 1480 300 L 1200 300 L 1140 360" />
          <path d="M 1920 200 L 1620 200 L 1500 320 L 1250 320" />

          {/* Mid-bottom diagonal circuit bus */}
          <path d="M 80 800 L 300 800 L 420 680 L 850 680 L 920 750 L 1400 750" />
          <path d="M 1920 850 L 1550 850 L 1450 750 L 1150 750" />
        </g>

        {/* DYNAMIC ANIMATED ELECTRIC PULSES (Active Data Transmission) */}
        <g stroke="url(#cyanLaser)" strokeWidth="1.8" fill="none" filter="url(#circuitGlow)">
          {/* Pulse 1: Top Left to Center */}
          <motion.path
            d="M 0 120 L 220 120 L 320 220 L 680 220 L 740 280 L 1100 280"
            strokeDasharray="60 400"
            animate={{ strokeDashoffset: [460, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
          />

          {/* Pulse 2: Top Right to Center */}
          <motion.path
            d="M 1920 180 L 1600 180 L 1480 300 L 1200 300 L 1140 360"
            strokeDasharray="50 350"
            animate={{ strokeDashoffset: [0, 400] }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear", delay: 1 }}
          />

          {/* Pulse 3: Bottom Bus */}
          <motion.path
            d="M 80 800 L 300 800 L 420 680 L 850 680 L 920 750 L 1400 750"
            strokeDasharray="70 450"
            animate={{ strokeDashoffset: [520, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear", delay: 2.5 }}
          />
        </g>

        {/* CIRCUIT SOLDER PADS & BLINKING IC JUNCTION NODES */}
        <g fill="#040716">
          {/* Node 1 */}
          <circle cx="220" cy="120" r="4" stroke="#00ffff" strokeWidth="1.5" />
          <circle cx="220" cy="120" r="1.5" fill="#00ffff" />

          {/* Node 2 */}
          <circle cx="320" cy="220" r="4" stroke="#0091ff" strokeWidth="1.5" />
          <circle cx="320" cy="220" r="1.5" fill="#00fffc" />

          {/* Node 3 */}
          <circle cx="680" cy="220" r="4" stroke="#8b5cf6" strokeWidth="1.5" />
          <circle cx="680" cy="220" r="1.5" fill="#8b5cf6" />

          {/* Node 4 (Top Right) */}
          <circle cx="1600" cy="180" r="4" stroke="#00ffff" strokeWidth="1.5" />
          <circle cx="1600" cy="180" r="1.5" fill="#00ffff" />

          {/* Node 5 */}
          <circle cx="1480" cy="300" r="4" stroke="#8b5cf6" strokeWidth="1.5" />
          <circle cx="1480" cy="300" r="1.5" fill="#8b5cf6" />

          {/* Node 6 (Bottom Left) */}
          <circle cx="300" cy="800" r="4" stroke="#00ffff" strokeWidth="1.5" />
          <circle cx="300" cy="800" r="1.5" fill="#00fffc" />

          {/* Node 7 */}
          <circle cx="420" cy="680" r="4" stroke="#00e5ff" strokeWidth="1.5" />
          <circle cx="420" cy="680" r="1.5" fill="#00e5ff" />

          {/* Node 8 */}
          <circle cx="850" cy="680" r="4" stroke="#8b5cf6" strokeWidth="1.5" />
          <circle cx="850" cy="680" r="1.5" fill="#8b5cf6" />
        </g>
      </svg>

      {/* 3. Floating Microchip Telemetry Glyphs */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{ y: [0, -15, 0], opacity: [0.12, 0.28, 0.12] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/3 left-10 text-[10px] font-mono text-cyan-400 tracking-widest hidden md:block"
        >
          [FREQ::2.4GHz_IoT_NODE]
        </motion.div>

        <motion.div
          animate={{ y: [0, 18, 0], opacity: [0.1, 0.25, 0.1] }}
          transition={{ duration: 8.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-2/3 right-14 text-[10px] font-mono text-cyberPurple tracking-widest hidden md:block"
        >
          [MCU::STM32_ONLINE]
        </motion.div>

        <motion.div
          animate={{ y: [0, -12, 0], opacity: [0.15, 0.35, 0.15] }}
          transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-16 sm:bottom-24 left-4 sm:left-1/4 text-[8px] sm:text-[9px] font-mono text-accent tracking-wider block"
        >
          {"[CREATED::ANKIT::327 ]"}
        </motion.div>
      </div>
    </div>
  );
}
