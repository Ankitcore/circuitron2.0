import React, { useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Cpu, Zap, Radio, Shield, Activity } from "lucide-react";

export default function TechModel3D() {
  const [hovered, setHovered] = useState(false);

  // Mouse tilt tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [25, -25]), {
    damping: 20,
    stiffness: 150,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-25, 25]), {
    damping: 20,
    stiffness: 150,
  });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setHovered(false);
  };

  return (
    <div
      className="relative w-full max-w-[360px] sm:max-w-[420px] aspect-square mx-auto flex items-center justify-center perspective-1000 select-none touch-pan-y"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      {/* Ambient background glow behind the 3D model */}
      <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-cyberPurple/20 to-accent/20 rounded-full blur-3xl opacity-60 animate-pulse-slow pointer-events-none" />

      {/* Responsive Scaling Rig Wrapper */}
      <div className="relative w-full h-full flex items-center justify-center transform scale-[0.8] xs:scale-[0.9] sm:scale-100 transition-transform">
        {/* Floating 3D Rig */}
        <motion.div
          style={{ rotateX, rotateY }}
          className="relative w-full h-full flex items-center justify-center preserve-3d"
        >
          {/* Outer Ring 1: Cyan Orbit */}
          <div
            className="absolute w-[300px] sm:w-[340px] h-[300px] sm:h-[340px] rounded-full border border-primary/40 border-dashed animate-spin-slow pointer-events-none"
            style={{ transform: "rotateX(65deg) rotateY(15deg)" }}
          >
            {/* Orbital Satellite Node */}
            <div className="absolute -top-1.5 left-1/2 w-3 h-3 bg-primary rounded-full shadow-[0_0_12px_#00bfff]" />
          </div>

          {/* Outer Ring 2: Purple Reverse Orbit */}
          <div
            className="absolute w-[260px] sm:w-[300px] h-[260px] sm:h-[300px] rounded-full border border-cyberPurple/40 border-t-2 border-t-cyberPurple animate-spin-reverse pointer-events-none"
            style={{ transform: "rotateX(-55deg) rotateY(40deg)" }}
          >
            <div className="absolute top-1/2 -right-1.5 w-3 h-3 bg-cyberPurple rounded-full shadow-[0_0_12px_#8b5cf6]" />
          </div>

          {/* Middle Ring: Accent Cyan Ring */}
          <div
            className="absolute w-[210px] sm:w-[240px] h-[210px] sm:h-[240px] rounded-full border border-accent/40 animate-spin-slow pointer-events-none"
            style={{ transform: "rotateX(40deg) rotateZ(30deg)" }}
          />

          {/* Central Hexagonal Core Chassis */}
          <motion.div
            animate={{ scale: hovered ? 1.05 : 1 }}
            transition={{ duration: 0.3 }}
            className="relative z-10 w-44 h-44 sm:w-48 sm:h-48 rounded-2xl glass-panel p-4 flex flex-col items-center justify-center border-2 border-primary/50 shadow-neon"
            style={{ transform: "translateZ(30px)" }}
          >
            {/* Circuit wire corner decorations */}
            <div className="absolute top-2 left-2 w-2 h-2 border-t-2 border-l-2 border-accent" />
            <div className="absolute top-2 right-2 w-2 h-2 border-t-2 border-r-2 border-accent" />
            <div className="absolute bottom-2 left-2 w-2 h-2 border-b-2 border-l-2 border-accent" />
            <div className="absolute bottom-2 right-2 w-2 h-2 border-b-2 border-r-2 border-accent" />

            {/* Core Logo Image */}
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 mb-2 flex items-center justify-center">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-md animate-ping opacity-40" />
              <img
                src="/logo.png"
                alt="Circuitron Core"
                className="w-18 h-18 sm:w-20 sm:h-20 object-contain drop-shadow-[0_0_15px_rgba(0,191,255,0.8)]"
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
          </motion.div>

          {/* Floating Telemetry Badge 1: Top Right */}
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-1 -right-2 sm:-top-2 sm:-right-4 glass-card px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg border border-accent/30 text-xs flex items-center space-x-1.5 sm:space-x-2 shadow-lg"
            style={{ transform: "translateZ(50px)" }}
          >
            <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-accent animate-bounce" />
            <span className="font-orbitron font-bold text-white text-[10px] sm:text-[11px]">
              30.NOV.2026
            </span>
          </motion.div>

          {/* Floating Telemetry Badge 2: Bottom Left */}
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute -bottom-1 -left-2 sm:-bottom-2 sm:-left-4 glass-card px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg border border-primary/30 text-xs flex items-center space-x-1.5 sm:space-x-2 shadow-lg"
            style={{ transform: "translateZ(45px)" }}
          >
            <Cpu className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary" />
            <span className="font-orbitron font-medium text-gray-200 text-[10px] sm:text-[11px]">
              RVSCET JAMSHEDPUR
            </span>
          </motion.div>

          {/* Floating Telemetry Badge 3: Center Bottom Status */}
          <div
            className="absolute -bottom-7 sm:-bottom-8 left-1/2 transform -translate-x-1/2 px-2.5 py-1 rounded-full bg-secondary/80 border border-primary/20 text-[9px] sm:text-[10px] text-gray-400 font-mono flex items-center space-x-1 whitespace-nowrap"
            style={{ transform: "translateZ(20px)" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>INTERACTIVE 3D RIG</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
