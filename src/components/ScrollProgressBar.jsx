import React from "react";
import { motion, useScroll, useSpring } from "framer-motion";

export default function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <div className="fixed top-0 left-0 right-0 h-[2.5px] z-[100] pointer-events-none bg-transparent">
      <motion.div
        style={{ scaleX }}
        className="h-full bg-gradient-to-r from-primary via-accent to-cyberPurple origin-left shadow-[0_0_12px_rgba(0,191,255,0.8)]"
      />
    </div>
  );
}
