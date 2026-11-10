import React from "react";
import { motion, useScroll } from "framer-motion";

/**
 * ScrollProgressBar
 * Ultra-smooth, GPU-accelerated page scroll progress indicator.
 * Synchronized directly with native scroll for zero lag on 60Hz and mobile devices.
 */
export default function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();

  return (
    <div
      className="fixed top-0 left-0 right-0 h-[2px] z-[100] pointer-events-none bg-white/[0.04]"
      style={{ willChange: "transform", transform: "translateZ(0)" }}
    >
      {/* Crisp Main Gradient Bar directly bound to scroll progress */}
      <motion.div
        style={{ scaleX: scrollYProgress }}
        className="h-full bg-gradient-to-r from-cyan-400 via-accent to-cyberPurple origin-left shadow-[0_0_8px_rgba(0,229,255,0.8)]"
      />
    </div>
  );
}
