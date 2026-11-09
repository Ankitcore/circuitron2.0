import React from "react";
import { motion } from "framer-motion";

/**
 * CyberProgressBar
 * Lightweight, GPU-accelerated, high-performance cybernetic progress bar.
 * Features:
 * - Fluid on-load / viewport-enter fill with custom cubic bezier
 * - Subtle, periodic after-load laser sweep reflection
 * - Optional neon leading-edge micro beacon
 */
export default function CyberProgressBar({
  value = 100,
  gradient = "from-primary via-accent to-cyberPurple",
  height = "h-1.5",
  borderColor = "border-primary/20",
  delay = 0.2,
  duration = 1.1,
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
    >
      <motion.div
        {...motionProps}
        transition={{
          duration,
          delay,
          ease: [0.22, 1, 0.36, 1],
        }}
        className={`h-full bg-gradient-to-r ${gradient} rounded-full relative overflow-hidden`}
      >
        {/* Subtle, non-distracting after-load cyber shimmer beam */}
        {showShimmer && (
          <motion.div
            animate={{ x: ["-100%", "260%"] }}
            transition={{
              duration: 2.2,
              repeat: Infinity,
              repeatDelay: 3,
              ease: "easeInOut",
              delay: delay + duration + 0.3,
            }}
            className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-25deg] pointer-events-none"
          />
        )}

        {/* Leading edge subtle glowing beacon dot */}
        {showGlowTip && (
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white/90 shadow-[0_0_8px_#ffffff] pointer-events-none" />
        )}
      </motion.div>
    </div>
  );
}
