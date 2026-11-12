import React, { useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Zap, Activity } from "lucide-react";
import { getPerformanceProfile, isMobileDevice, shouldReduceMotion } from "../utils/performance";

/**
 * TechModel3D
 * Interactive Cyber Core Rig with orbital telemetry rings.
 *
 * Performance Optimizations:
 * - Profile C: Static/lightweight orbital rings, zero mouse tracking, zero spring physics.
 * - Profile B: Orbital rings with pure CSS compositor rotation, zero mouse tracking.
 * - Profile A: Full 3D mouse tilt tracking with spring physics.
 */
export default function TechModel3D() {
  const profile = getPerformanceProfile();
  const isMobile = isMobileDevice();
  const reduceMotion = shouldReduceMotion();
  const isHigh = profile === "A" && !isMobile && !reduceMotion;
  const isLow = profile === "C" || reduceMotion;

  const [hovered, setHovered] = useState(false);

  // Mouse tilt tracking (Only instantiated & bound on Profile A desktop)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [14, -14]), {
    damping: 25,
    stiffness: 120,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-14, 14]), {
    damping: 25,
    stiffness: 120,
  });

  const handleMouseMove = (e) => {
    if (!isHigh) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    if (!isHigh) return;
    mouseX.set(0);
    mouseY.set(0);
    setHovered(false);
  };

  return (
    <div
      className="relative w-full max-w-[360px] sm:max-w-[420px] aspect-square mx-auto flex items-center justify-center perspective-1000 select-none touch-pan-y"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => !isMobile && setHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{ transform: "translateZ(0)" }}
    >
      {/* Ambient background glow: Efficient CSS radial-gradient (0 blur passes) */}
      <div
        className="absolute inset-0 rounded-full opacity-60 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(0, 191, 255, 0.18) 0%, rgba(139, 92, 246, 0.12) 45%, transparent 70%)",
        }}
      />

      {/* Responsive Scaling Rig Wrapper */}
      <div className="relative w-full h-full flex items-center justify-center transform scale-[0.8] xs:scale-[0.9] sm:scale-100 transition-transform">
        {/* Floating 3D Rig */}
        <motion.div
          style={isHigh ? { rotateX, rotateY } : undefined}
          className="relative w-full h-full flex items-center justify-center preserve-3d"
        >
          {/* Outer Ring 1: Cyan Orbit */}
          <div
            className={`absolute w-[290px] sm:w-[330px] h-[290px] sm:h-[330px] rounded-full border border-primary/40 border-dashed pointer-events-none ${
              isLow ? "" : "animate-spin-slow"
            }`}
            style={{
              transform: "rotateX(65deg) rotateY(15deg) translateZ(0)",
            }}
          >
            {/* Orbital Satellite Node */}
            <div className="absolute -top-1.5 left-1/2 w-3 h-3 bg-primary rounded-full shadow-[0_0_10px_#00bfff]" />
          </div>

          {/* Outer Ring 2: Purple Reverse Orbit (Only on Profile A & B) */}
          {!isLow && (
            <div
              className="absolute w-[250px] sm:w-[290px] h-[250px] sm:h-[290px] rounded-full border border-cyberPurple/40 border-t-2 border-t-cyberPurple animate-spin-reverse pointer-events-none"
              style={{
                transform: "rotateX(-55deg) rotateY(40deg) translateZ(0)",
              }}
            >
              <div className="absolute top-1/2 -right-1.5 w-2.5 h-2.5 bg-cyberPurple rounded-full shadow-[0_0_10px_#8b5cf6]" />
            </div>
          )}

          {/* Middle Ring: Accent Cyan Ring */}
          <div
            className={`absolute w-[200px] sm:w-[230px] h-[200px] sm:h-[230px] rounded-full border border-accent/35 pointer-events-none ${
              isLow ? "" : "animate-spin-slow"
            }`}
            style={{
              transform: "rotateX(40deg) rotateZ(30deg) translateZ(0)",
            }}
          />

          {/* Central Hexagonal Core Chassis */}
          <div
            className={`relative z-10 w-44 h-44 sm:w-48 sm:h-48 rounded-2xl glass-panel p-4 flex flex-col items-center justify-center border-2 border-primary/50 shadow-neon transition-transform duration-300 ${
              hovered ? "scale-105" : "scale-100"
            }`}
            style={{ transform: "translateZ(30px)" }}
          >
            {/* Circuit wire corner decorations */}
            <div className="absolute top-2 left-2 w-2 h-2 border-t-2 border-l-2 border-accent" />
            <div className="absolute top-2 right-2 w-2 h-2 border-t-2 border-r-2 border-accent" />
            <div className="absolute bottom-2 left-2 w-2 h-2 border-b-2 border-l-2 border-accent" />
            <div className="absolute bottom-2 right-2 w-2 h-2 border-b-2 border-r-2 border-accent" />

            {/* Core Logo Image */}
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 mb-2 flex items-center justify-center">
              <img
                src="/logo.png"
                alt="Circuitron Core"
                className="w-18 h-18 sm:w-20 sm:h-20 object-contain drop-shadow-[0_0_12px_rgba(0,191,255,0.7)]"
                loading="eager"
              />
            </div>

            {/* Micro Telemetry */}
            <div className="flex items-center space-x-1.5 text-[9px] sm:text-[10px] font-orbitron font-semibold text-primary uppercase tracking-wider">
              <Activity className="w-3 h-3 text-accent animate-pulse" />
              <span>SYS::ONLINE</span>
            </div>
            <div className="text-[8px] sm:text-[9px] text-gray-400 font-mono tracking-tight mt-0.5">
              IoT &amp; EMBEDDED
            </div>
          </div>

          {/* Floating Telemetry Badge 1: Top Right */}
          <div
            className={`absolute -top-1 -right-2 sm:-top-2 sm:-right-4 glass-card px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg border border-accent/30 text-xs flex items-center space-x-1.5 sm:space-x-2 shadow-lg ${
              isLow ? "" : "telemetry-badge-float-1"
            }`}
            style={{ transform: "translateZ(45px)" }}
          >
            <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-accent" />
            <span className="font-orbitron font-bold text-white text-[10px] sm:text-[11px]">
              30.NOV.2026
            </span>
          </div>

          {/* Floating Telemetry Badge 2: Bottom Left */}
          <div
            className={`absolute -bottom-1 -left-2 sm:-bottom-2 sm:-left-4 glass-card px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg border border-primary/30 text-xs flex items-center space-x-1.5 sm:space-x-2 shadow-lg ${
              isLow ? "" : "telemetry-badge-float-2"
            }`}
            style={{ transform: "translateZ(40px)" }}
          >
            <img
              src="/assets/rvscet-logo.webp"
              alt="RVSCET"
              className="w-3.5 h-3.5 sm:w-4 sm:h-4 object-contain flex-shrink-0"
            />
            <span className="font-orbitron font-medium text-gray-200 text-[10px] sm:text-[11px]">
              RVSCET JAMSHEDPUR
            </span>
          </div>

          {/* Floating Telemetry Badge 3: Center Bottom Status */}
          <div
            className="absolute -bottom-7 sm:-bottom-8 left-1/2 transform -translate-x-1/2 px-2.5 py-1 rounded-full bg-secondary/80 border border-primary/20 text-[9px] sm:text-[10px] text-gray-400 font-mono flex items-center space-x-1 whitespace-nowrap"
            style={{ transform: "translateX(-50%) translateZ(35px)" }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>CORE NODE 2.O</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
