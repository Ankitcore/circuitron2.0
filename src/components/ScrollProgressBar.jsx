import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";

/**
 * ScrollProgressBar
 * Ultra-smooth, GPU-accelerated page scroll progress indicator.
 * Synchronized directly with native scroll for zero lag on 60Hz and mobile devices.
 * Features gentle on-load fade-in and hardware-accelerated scaleX tracking.
 */
export default function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const tipOpacity = useTransform(scrollYProgress, [0, 0.05, 1], [0, 1, 1]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7, delay: 0.2 }}
      className="fixed top-0 left-0 right-0 h-[2.5px] z-[100] pointer-events-none bg-white/[0.04]"
      style={{ willChange: "transform, opacity", transform: "translateZ(0)" }}
    >
      {/* Crisp Main Gradient Bar directly bound to scroll progress */}
      <motion.div
        style={{ scaleX: scrollYProgress, transformOrigin: "left", willChange: "transform" }}
        className="h-full w-full bg-gradient-to-r from-cyan-400 via-accent to-cyberPurple origin-left shadow-[0_0_10px_rgba(0,229,255,0.85)] relative"
      >
        {/* Subtle glowing beacon at the front edge of the progress bar */}
        <motion.div
          style={{ opacity: tipOpacity }}
          className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white shadow-[0_0_8px_#00ffff]"
        />
      </motion.div>
    </motion.div>
  );
}
