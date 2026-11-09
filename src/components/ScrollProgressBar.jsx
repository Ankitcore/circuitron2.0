import React from "react";
import { motion, useScroll, useSpring } from "framer-motion";

/**
 * ScrollProgressBar
 * High-performance, GPU-accelerated page scroll progress indicator.
 * Features:
 * - Fluid spring physics tracking scroll position
 * - Ambient cyan-purple neon underglow
 * - Elegant on-load laser sweep pulse signifying system readiness
 */
export default function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 160,
    damping: 28,
    restDelta: 0.001,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 left-0 right-0 h-[2.5px] z-[100] pointer-events-none bg-white/[0.04]"
    >
      {/* Soft Ambient Underglow Trail */}
      <motion.div
        style={{ scaleX }}
        className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-accent to-cyberPurple origin-left blur-[2px] opacity-75"
      />

      {/* Crisp Main Gradient Bar */}
      <motion.div
        style={{ scaleX }}
        className="relative h-full bg-gradient-to-r from-cyan-400 via-accent to-cyberPurple origin-left shadow-[0_0_12px_rgba(0,229,255,0.9)]"
      />

      {/* Subtle On-Load System Laser Sweep (Fires once upon page mount) */}
      <motion.div
        initial={{ x: "-100%", opacity: 0.85 }}
        animate={{ x: "250%", opacity: 0 }}
        transition={{ duration: 1.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="absolute top-0 left-0 w-36 h-full bg-gradient-to-r from-transparent via-white to-transparent"
      />
    </motion.div>
  );
}
