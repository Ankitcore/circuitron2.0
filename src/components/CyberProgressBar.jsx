import React from "react";
import { motion } from "framer-motion";
import AnimatedCounter from "./AnimatedCounter";
import { getPerformanceProfile, shouldReduceMotion } from "../utils/performance";

/**
 * CyberProgressBar
 * Ultra-high-performance, GPU compositor-accelerated cybernetic progress bar.
 *
 * Performance Optimizations:
 * - Uses `scaleX` transform on `transform-origin: left` instead of animating `width`.
 *   This avoids layout reflows (forced synchronous layouts) on every frame.
 * - Profile C: Renders target scale directly without continuous shimmer beam.
 * - Profile A & B: Hardware-composited `scaleX` transition.
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
  label = null,
  showPercentage = false,
  percentagePrefix = "",
  percentageSuffix = "%",
  percentageClassName = "text-accent font-bold",
  className = "",
}) {
  const profile = getPerformanceProfile();
  const isLow = profile === "C" || shouldReduceMotion();
  const numericValue = typeof value === "number" ? Math.min(100, Math.max(0, value)) : parseInt(value, 10) || 100;
  const targetScale = numericValue / 100;

  const animDuration = isLow ? 0.2 : profile === "B" ? duration * 0.75 : duration;
  const animDelay = isLow ? 0 : profile === "B" ? delay * 0.5 : delay;

  const motionProps = isLow
    ? {
        style: {
          transform: `scaleX(${targetScale})`,
          transformOrigin: "left",
        },
      }
    : inView
    ? {
        initial: { scaleX: 0 },
        whileInView: { scaleX: targetScale },
        viewport: { once: true, margin: profile === "B" ? "-10px" : "-20px" },
        transition: {
          duration: animDuration,
          delay: animDelay,
          ease: [0.22, 1, 0.36, 1],
        },
        style: { transformOrigin: "left" },
      }
    : {
        initial: { scaleX: 0 },
        animate: { scaleX: targetScale },
        transition: {
          duration: animDuration,
          delay: animDelay,
          ease: [0.22, 1, 0.36, 1],
        },
        style: { transformOrigin: "left" },
      };

  return (
    <div className={`w-full space-y-1 ${className}`}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between text-[10px] font-mono text-gray-400">
          {label && <span>{label}</span>}
          {showPercentage && (
            <AnimatedCounter
              from={0}
              to={numericValue}
              prefix={percentagePrefix}
              suffix={percentageSuffix}
              delay={delay}
              duration={duration}
              className={percentageClassName}
            />
          )}
        </div>
      )}

      <div
        className={`w-full ${height} bg-darkNavy/80 rounded-full overflow-hidden p-[0.5px] border ${borderColor} relative`}
        style={{ transform: "translateZ(0)" }}
      >
        <motion.div
          {...motionProps}
          className={`w-full h-full bg-gradient-to-r ${gradient} rounded-full relative overflow-hidden`}
        >
          {/* Hardware-accelerated CSS Shimmer (Disabled on Profile C to save GPU fill rate) */}
          {showShimmer && !isLow && (
            <div
              className="absolute top-0 bottom-0 w-20 bg-gradient-to-r from-transparent via-white/35 to-transparent pointer-events-none cyber-shimmer-beam"
              style={{ willChange: "transform" }}
            />
          )}

          {/* Leading edge neon micro beacon */}
          {showGlowTip && !isLow && (
            <div className="absolute right-0 top-0 bottom-0 w-1 bg-white shadow-[0_0_8px_#ffffff] rounded-full" />
          )}
        </motion.div>
      </div>
    </div>
  );
}
