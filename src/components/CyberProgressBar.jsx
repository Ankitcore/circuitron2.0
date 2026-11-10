import React from "react";
import { motion } from "framer-motion";

/**
 * CyberProgressBar
 * Lightweight, GPU-accelerated, high-performance cybernetic progress bar.
 * Uses pure CSS for repeating shimmer reflection to eliminate JS main thread overhead.
 */
export default function CyberProgressBar({
  value = 100,
  gradient = "from-primary via-accent to-cyberPurple",
  height = "h-1.5",
  borderColor = "border-primary/20",
  delay = 0.2,
  duration = 1.0,
  inView = true,
  showShimmer = true,
  showGlowTip = true,
  className = "",
}) {
  const targetWidth = typeof value === "number" ? `${Math.min(100, Math.max(0, value))}%` : value;

  const motionProps = inView
    ? {
        initial: { width: 0 },
        whileInView: { width: targetWidth },
        viewport: { once: true, margin: "-15px" },
      }
    : {
        initial: { width: 0 },
        animate: { width: targetWidth },
      };

  return (
    <div
      className={`w-full ${height} bg-darkNavy/80 rounded-full overflow-hidden p-[0.5px] border ${borderColor} relative ${className}`}
      style={{ willChange: "transform", transform: "translateZ(0)" }}
    >
      <motion.div
        {...motionProps}
        transition={{
          duration,
          delay,
          ease: [0.22, 1, 0.36, 1],
        }}
        className={`h-full bg-gradient-to-r ${gradient} rounded-full relative overflow-hidden`}
        style={{ willChange: "width" }}
      >
        {/* Hardware-accelerated CSS Shimmer (0 JS RAF cycles) */}
        {showShimmer && (
          <div
            className="absolute top-0 bottom-0 w-20 bg-gradient-to-r from-transparent via-white/35 to-transparent pointer-events-none cyber-shimmer-beam"
            style={{ willChange: "transform" }}
          />
        )}

        {/* Leading edge neon micro beacon */}
        {showGlowTip && (
          <div className="absolute right-0 top-0 bottom-0 w-1 bg-white shadow-[0_0_8px_#ffffff] rounded-full" />
        )}
      </motion.div>
    </div>
  );
}
