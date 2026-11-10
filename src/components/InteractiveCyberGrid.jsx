import React, { useEffect, useState, useRef } from "react";
import { isLowEndDevice, isMobileDevice, shouldReduceMotion } from "../utils/performance";

export default function InteractiveCyberGrid() {
  const [isLowSpec] = useState(() => isLowEndDevice());
  const [isMobile] = useState(() => isMobileDevice());
  const [reduceMotion] = useState(() => shouldReduceMotion());
  const [hasPointer, setHasPointer] = useState(false);
  const spotlightRef = useRef(null);

  useEffect(() => {
    // Only activate mouse spotlight on non-touch, higher-tier desktop devices to protect 60 FPS on low-end laptops & mobile
    if (isLowSpec || isMobile || reduceMotion) return;

    let ticking = false;
    const handleMouseMove = (e) => {
      if (!ticking) {
        requestAnimationFrame(() => {
          if (spotlightRef.current) {
            spotlightRef.current.style.setProperty("--mouse-x", `${e.clientX}px`);
            spotlightRef.current.style.setProperty("--mouse-y", `${e.clientY}px`);
          }
          if (!hasPointer) setHasPointer(true);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [hasPointer, isLowSpec, isMobile, reduceMotion]);

  return (
    <div
      className="fixed inset-0 pointer-events-none select-none overflow-hidden"
      style={{ zIndex: 0, willChange: "transform", transform: "translateZ(0)" }}
      aria-hidden="true"
    >
      {/* 1. Interactive Cursor Radar Spotlight (Hardware-Accelerated via CSS variable, 0 JS spring overhead) */}
      {!isLowSpec && !isMobile && hasPointer && (
        <div
          ref={spotlightRef}
          style={{
            background:
              "radial-gradient(550px circle at var(--mouse-x, -1000px) var(--mouse-y, -1000px), rgba(0, 229, 255, 0.08), rgba(139, 92, 246, 0.03) 45%, transparent 70%)",
            willChange: "background",
          }}
          className="absolute inset-0 transition-opacity duration-500 opacity-100"
        />
      )}

      {/* 2. Cyberpunk Vector Circuit Traces & PCB Buses (Hardware-Accelerated via pure CSS) */}
      <svg
        className="absolute inset-0 w-full h-full opacity-35 md:opacity-45"
        xmlns="http://www.w3.org/2000/svg"
        style={{ willChange: "transform" }}
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
        </defs>

        {/* STATIC COPPER TRACE BASE LINES */}
        <g stroke="rgba(0, 191, 255, 0.12)" strokeWidth="1" fill="none">
          <path d="M 0 120 L 220 120 L 320 220 L 680 220 L 740 280 L 1100 280" />
          <path d="M 0 140 L 200 140 L 300 240 L 660 240" />
          <path d="M 1920 180 L 1600 180 L 1480 300 L 1200 300 L 1140 360" />
          <path d="M 1920 200 L 1620 200 L 1500 320 L 1250 320" />
          <path d="M 80 800 L 300 800 L 420 680 L 850 680 L 920 750 L 1400 750" />
          <path d="M 1920 850 L 1550 850 L 1450 750 L 1150 750" />
        </g>

        {/* DYNAMIC ELECTRIC PULSES: Pure CSS Keyframes on Compositor, 0 CPU Gaussian blur filter */}
        {!reduceMotion && (
          <g stroke="url(#cyanLaser)" strokeWidth="1.8" fill="none">
            {/* Pulse 1: Top Left to Center */}
            <path
              d="M 0 120 L 220 120 L 320 220 L 680 220 L 740 280 L 1100 280"
              strokeDasharray="60 400"
              className="circuit-pulse-1"
            />

            {/* Pulse 2: Top Right to Center */}
            <path
              d="M 1920 180 L 1600 180 L 1480 300 L 1200 300 L 1140 360"
              strokeDasharray="50 350"
              className="circuit-pulse-2"
            />

            {/* Pulse 3: Bottom Bus */}
            <path
              d="M 80 800 L 300 800 L 420 680 L 850 680 L 920 750 L 1400 750"
              strokeDasharray="70 450"
              className="circuit-pulse-3"
            />
          </g>
        )}

        {/* CIRCUIT SOLDER PADS & IC JUNCTION NODES */}
        <g fill="#040716">
          <circle cx="220" cy="120" r="3.5" stroke="#00ffff" strokeWidth="1.5" />
          <circle cx="220" cy="120" r="1.5" fill="#00ffff" />
          <circle cx="320" cy="220" r="3.5" stroke="#0091ff" strokeWidth="1.5" />
          <circle cx="320" cy="220" r="1.5" fill="#00fffc" />
          <circle cx="680" cy="220" r="3.5" stroke="#8b5cf6" strokeWidth="1.5" />
          <circle cx="680" cy="220" r="1.5" fill="#8b5cf6" />
          <circle cx="1600" cy="180" r="3.5" stroke="#00ffff" strokeWidth="1.5" />
          <circle cx="1600" cy="180" r="1.5" fill="#00ffff" />
          <circle cx="1480" cy="300" r="3.5" stroke="#8b5cf6" strokeWidth="1.5" />
          <circle cx="1480" cy="300" r="1.5" fill="#8b5cf6" />
          <circle cx="300" cy="800" r="3.5" stroke="#00ffff" strokeWidth="1.5" />
          <circle cx="300" cy="800" r="1.5" fill="#00fffc" />
          <circle cx="420" cy="680" r="3.5" stroke="#00e5ff" strokeWidth="1.5" />
          <circle cx="420" cy="680" r="1.5" fill="#00e5ff" />
          <circle cx="850" cy="680" r="3.5" stroke="#8b5cf6" strokeWidth="1.5" />
          <circle cx="850" cy="680" r="1.5" fill="#8b5cf6" />
        </g>
      </svg>

      {/* 3. Floating Microchip Telemetry Glyphs (Pure CSS translate3d, 0 JS thread burden) */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className={`absolute top-1/3 left-10 text-[10px] font-mono text-cyan-400 tracking-widest hidden md:block opacity-25 ${
            reduceMotion ? "" : "telemetry-float-1"
          }`}
        >
          [FREQ::2.4GHz_IoT_NODE]
        </div>

        <div
          className={`absolute top-2/3 right-14 text-[10px] font-mono text-cyberPurple tracking-widest hidden md:block opacity-20 ${
            reduceMotion ? "" : "telemetry-float-2"
          }`}
        >
          [MCU::STM32_ONLINE]
        </div>

        <div
          className={`absolute bottom-16 sm:bottom-24 left-4 sm:left-1/4 text-[8px] sm:text-[9px] font-mono text-accent tracking-wider block opacity-10 sm:opacity-15 ${
            reduceMotion ? "" : "telemetry-float-3"
          }`}
        >
          {"[CREATED::ANKIT::327]"}
        </div>
      </div>
    </div>
  );
}
