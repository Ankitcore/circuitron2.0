import React, { useState } from "react";
import { motion } from "framer-motion";
import AnimatedCounter from "./AnimatedCounter";
import { shouldReduceMotion, isLowEndDevice } from "../utils/performance";
import { gentleEase } from "../utils/motion";

/**
 * CyberProgressBar
 * Lightweight, GPU-accelerated, high-performance cybernetic progress bar.
 * Uses hardware-accelerated scaleX transform for locked 60 FPS without layout reflows.
 * Features elegant on-load fill and subtle after-load breathing beacon.
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
  label = null,
  showPercentage = false,
  percentagePrefix = "",
  percentageSuffix = "%",
  percentageClassName = "text-accent font-bold",
  className = "",
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const numericValue = typeof value === "number" ? Math.min(100, Math.max(0, value)) : parseInt(value, 10) || 100;
  const targetScale = numericValue / 100;

  const reducedMotion = shouldReduceMotion();
  const effectiveDuration = reducedMotion ? 0.05 : isLowEndDevice() ? Math.min(0.6, duration * 0.7) : duration;

  const motionProps = inView
    ? {
        initial: { scaleX: reducedMotion ? targetScale : 0, opacity: 0.85 },
        whileInView: { scaleX: targetScale, opacity: 1 },
        viewport: { once: true, margin: "-20px" },
      }
    : {
        initial: { scaleX: reducedMotion ? targetScale : 0, opacity: 0.85 },
        animate: { scaleX: targetScale, opacity: 1 },
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
              duration={effectiveDuration}
              className={percentageClassName}
            />
          )}
        </div>
      )}

      <div
        className={`w-full ${height} bg-darkNavy/80 rounded-full overflow-hidden p-[0.5px] border ${borderColor} relative`}
        style={{ willChange: "transform", transform: "translateZ(0)" }}
      >
        <motion.div
          {...motionProps}
          onAnimationComplete={() => setIsLoaded(true)}
          transition={{
            duration: effectiveDuration,
            delay: reducedMotion ? 0 : delay,
            ease: gentleEase,
          }}
          className={`h-full w-full bg-gradient-to-r ${gradient} rounded-full relative overflow-hidden`}
          style={{
            transformOrigin: "left",
            willChange: "transform",
          }}
        >
          {/* Hardware-accelerated CSS Shimmer (0 JS RAF cycles) */}
          {showShimmer && numericValue > 0 && !reducedMotion && (
            <div
              className="absolute top-0 bottom-0 w-24 bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none cyber-shimmer-beam"
              style={{ willChange: "transform" }}
            />
          )}

          {/* Leading edge neon micro beacon with subtle after-load breathing glow */}
          {showGlowTip && numericValue > 0 && (
            <motion.div
              animate={isLoaded && !reducedMotion ? { opacity: [0.65, 1, 0.65] } : { opacity: 1 }}
              transition={
                isLoaded && !reducedMotion
                  ? { repeat: Infinity, duration: 2.4, ease: "easeInOut" }
                  : { duration: 0.3 }
              }
              className="absolute right-0 top-0 bottom-0 w-1.5 bg-white shadow-[0_0_8px_#ffffff] rounded-full pointer-events-none"
              style={{ willChange: "opacity" }}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
}
