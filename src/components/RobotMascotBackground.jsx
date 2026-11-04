import React, { useState, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring, useMotionValue } from "framer-motion";
import { Sparkles, Zap, Bot } from "lucide-react";

export default function RobotMascotBackground() {
  const { scrollYProgress } = useScroll();

  // Dialog popups when user clicks / interacts with the robots
  const [swingDialog, setSwingDialog] = useState(false);
  const [welcomeDialog, setWelcomeDialog] = useState(false);
  const [swingBounce, setSwingBounce] = useState(false);
  const [welcomeBounce, setWelcomeBounce] = useState(false);

  // Mouse coordinate tracking for interactive look-at effect
  const mouseNormX = useMotionValue(0.5);
  const mouseNormY = useMotionValue(0.5);

  useEffect(() => {
    const handleMove = (e) => {
      mouseNormX.set(e.clientX / window.innerWidth);
      mouseNormY.set(e.clientY / window.innerHeight);
    };
    window.addEventListener("mousemove", handleMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMove);
  }, [mouseNormX, mouseNormY]);

  // Dynamic spring angles tracking the cursor
  const swingTilt = useSpring(useTransform(mouseNormX, [0, 1], [-10, 8]), {
    stiffness: 100,
    damping: 18,
  });

  const welcomeRotateY = useSpring(useTransform(mouseNormX, [0, 1], [-15, 15]), {
    stiffness: 120,
    damping: 20,
  });
  const welcomeRotateX = useSpring(useTransform(mouseNormY, [0, 1], [10, -10]), {
    stiffness: 120,
    damping: 20,
  });

  // Smooth scroll parallax
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 20,
    restDelta: 0.001,
  });

  const swingScrollY = useTransform(smoothProgress, [0, 1], [0, 90]);
  const standScrollY = useTransform(smoothProgress, [0, 1], [0, -70]);

  const handleSwingClick = () => {
    setSwingBounce(true);
    setSwingDialog(true);
    setTimeout(() => setSwingBounce(false), 700);
    setTimeout(() => setSwingDialog(false), 3500);
  };

  const handleWelcomeClick = () => {
    setWelcomeBounce(true);
    setWelcomeDialog(true);
    setTimeout(() => setWelcomeBounce(false), 700);
    setTimeout(() => setWelcomeDialog(false), 3500);
  };

  return (
    <div
      className="fixed inset-0 pointer-events-none select-none overflow-hidden"
      style={{ zIndex: 3 }}
      aria-hidden="true"
    >
      {/* ============================================================ */}
      {/* 1. TOP-RIGHT: Web-Slinging Flying Robot (bot-swing.png)     */}
      {/* ============================================================ */}
      <motion.div
        style={{
          y: swingScrollY,
          rotate: swingTilt,
        }}
        className="absolute top-12 sm:top-16 -right-4 sm:right-4 md:right-8 lg:right-12 w-28 xs:w-36 sm:w-48 md:w-56 lg:w-64 max-w-[32vw]"
      >
        {/* Animated Cyber Energy Cable connecting to top edge */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-[2px] h-20 bg-gradient-to-b from-transparent via-cyan-400 to-accent opacity-70 shadow-[0_0_10px_#00ffff] animate-pulse pointer-events-none" />

        {/* Ambient Cyan Aura behind swinging bot */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 sm:w-48 sm:h-48 bg-primary/20 rounded-full blur-3xl pointer-events-none animate-pulse-slow opacity-60" />

        {/* Interactive Speech Bubble HUD */}
        {swingDialog && (
          <motion.div
            initial={{ opacity: 0, scale: 0.7, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.7 }}
            className="absolute -bottom-10 right-0 z-30 px-3 py-1.5 rounded-xl bg-darkNavy/95 border border-cyan-400/80 shadow-[0_0_20px_rgba(0,255,255,0.5)] text-[10px] font-orbitron font-bold text-accent whitespace-nowrap flex items-center space-x-1.5"
          >
            <Zap className="w-3 h-3 text-cyan-300 animate-bounce" />
            <span>SWINGING INTO 30.NOV.2026!</span>
          </motion.div>
        )}

        {/* Pendulum Swinging & Hover Motion */}
        <motion.div
          animate={
            swingBounce
              ? { scale: [1, 1.25, 0.95, 1], rotate: [-15, 20, -5, 0] }
              : {
                  rotate: [-4, 6, -4],
                  x: [-3, 5, -3],
                  y: [0, 10, 0],
                }
          }
          transition={
            swingBounce
              ? { duration: 0.65, ease: "easeOut" }
              : { duration: 6, repeat: Infinity, ease: "easeInOut" }
          }
          onClick={handleSwingClick}
          className="relative w-full cursor-pointer pointer-events-auto group"
        >
          <picture>
            <source srcSet="/assets/bot-swing.webp" type="image/webp" />
            <img
              src="/assets/bot-swing.webp"
              alt="Circuitron Spider Bot Mascot"
              className="w-full h-auto object-contain filter drop-shadow-[0_0_20px_rgba(0,191,255,0.45)] group-hover:drop-shadow-[0_0_30px_rgba(0,255,255,0.8)] opacity-35 sm:opacity-50 group-hover:opacity-100 transition-all duration-300"
              loading="lazy"
              decoding="async"
            />
          </picture>

          {/* Interactive Hint Indicator */}
          <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-primary/20 border border-primary/40 text-[8px] font-mono text-cyan-300 opacity-0 group-hover:opacity-100 transition-opacity">
            CLICK ME
          </div>

          {/* Micro Energy Sparkles around web */}
          <motion.div
            animate={{ opacity: [0.3, 0.95, 0.3], scale: [0.9, 1.3, 0.9] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-4 right-1/4 w-2 h-2 rounded-full bg-cyan-300 shadow-[0_0_12px_#00ffff]"
          />
        </motion.div>
      </motion.div>

      {/* ============================================================ */}
      {/* 2. BOTTOM-LEFT: Standing Namaste Mascot Robot (bot-welcome.png) */}
      {/* ============================================================ */}
      <motion.div
        style={{
          y: standScrollY,
        }}
        className="absolute bottom-4 sm:bottom-8 -left-3 sm:left-4 md:left-8 lg:left-12 w-24 xs:w-32 sm:w-44 md:w-52 lg:w-60 max-w-[28vw] perspective-1000"
      >
        {/* Ambient Hologram Pedestal Glow beneath standing bot */}
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-28 sm:w-44 h-8 bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent rounded-full blur-md animate-pulse pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-28 h-28 sm:w-44 sm:h-44 bg-cyberPurple/25 rounded-full blur-3xl pointer-events-none opacity-50" />

        {/* Interactive Speech Bubble HUD */}
        {welcomeDialog && (
          <motion.div
            initial={{ opacity: 0, scale: 0.7, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.7 }}
            className="absolute -top-12 left-0 z-30 px-3 py-1.5 rounded-xl bg-darkNavy/95 border border-primary/80 shadow-[0_0_20px_rgba(0,191,255,0.5)] text-[10px] font-orbitron font-bold text-white whitespace-nowrap flex items-center space-x-1.5"
          >
            <Bot className="w-3 h-3 text-primary animate-pulse" />
            <span>CIRCUITRON BOT: WELCOME!</span>
          </motion.div>
        )}

        {/* Floating Idle Levitation Motion with 3D Head Tracking */}
        <motion.div
          style={{
            rotateY: welcomeRotateY,
            rotateX: welcomeRotateX,
          }}
          animate={
            welcomeBounce
              ? { scale: [1, 1.25, 0.95, 1], y: [0, -30, 0] }
              : {
                  y: [0, -12, 0],
                  rotateZ: [-1, 1.5, -1],
                }
          }
          transition={
            welcomeBounce
              ? { duration: 0.6, ease: "easeOut" }
              : { duration: 5, repeat: Infinity, ease: "easeInOut" }
          }
          onClick={handleWelcomeClick}
          className="relative w-full cursor-pointer pointer-events-auto group preserve-3d"
        >
          <picture>
            <source srcSet="/assets/bot-welcome.webp" type="image/webp" />
            <img
              src="/assets/bot-welcome.webp"
              alt="Circuitron Welcome Mascot Robot"
              className="w-full h-auto object-contain filter drop-shadow-[0_0_20px_rgba(0,191,255,0.4)] group-hover:drop-shadow-[0_0_30px_rgba(0,191,255,0.8)] opacity-35 sm:opacity-50 group-hover:opacity-100 transition-all duration-300"
              loading="lazy"
              decoding="async"
            />
          </picture>

          {/* Interactive Hint Indicator */}
          <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-cyan-500/20 border border-cyan-400/40 text-[8px] font-mono text-accent opacity-0 group-hover:opacity-100 transition-opacity">
            NAMASTE::HELLO
          </div>

          {/* Hologram Floating Platform Ring */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-20 sm:w-32 h-3 rounded-full border border-primary/40 border-dashed animate-spin-slow opacity-60 shadow-[0_0_8px_#00bfff]" />
        </motion.div>
      </motion.div>
    </div>
  );
}
