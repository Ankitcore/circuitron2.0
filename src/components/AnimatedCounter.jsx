import React, { useEffect, useRef } from "react";
import { useInView, useMotionValue, animate } from "framer-motion";
import { getPerformanceProfile, shouldReduceMotion } from "../utils/performance";

/**
 * AnimatedCounter
 * High-performance numerical count-up component.
 *
 * Performance Optimizations:
 * - Profile C: Immediately displays target value. Zero RAF, zero overhead.
 * - Profile A & B: Directly updates DOM `ref.current.textContent` during animation.
 *   This eliminates hundreds of React state reconciliations per second,
 *   guaranteeing smooth 60 FPS frame pacing on all devices.
 */
export default function AnimatedCounter({
  from = 0,
  to = 100,
  duration = 1.3,
  delay = 0.1,
  prefix = "",
  suffix = "",
  decimals = 0,
  className = "",
}) {
  const spanRef = useRef(null);
  const profile = getPerformanceProfile();
  const isLow = profile === "C" || shouldReduceMotion();

  const formatNumber = (val) => {
    if (decimals > 0) {
      return Number(val).toFixed(decimals);
    }
    const rounded = Math.round(val);
    try {
      return rounded.toLocaleString("en-IN");
    } catch {
      return rounded.toLocaleString();
    }
  };

  const finalString = `${prefix}${formatNumber(to)}${suffix}`;
  const initialString = isLow ? finalString : `${prefix}${formatNumber(from)}${suffix}`;

  const isInView = useInView(spanRef, {
    once: true,
    margin: isLow ? "100px" : "-20px",
  });
  const motionVal = useMotionValue(from);

  useEffect(() => {
    if (isLow) {
      if (spanRef.current) spanRef.current.textContent = finalString;
      return;
    }

    if (isInView && spanRef.current) {
      const animDuration = profile === "B" ? duration * 0.75 : duration;
      const animDelay = profile === "B" ? delay * 0.5 : delay;

      const controls = animate(motionVal, to, {
        duration: animDuration,
        delay: animDelay,
        ease: [0.22, 1, 0.36, 1],
        onUpdate: (latest) => {
          if (spanRef.current) {
            spanRef.current.textContent = `${prefix}${formatNumber(latest)}${suffix}`;
          }
        },
        onComplete: () => {
          if (spanRef.current) {
            spanRef.current.textContent = finalString;
          }
        },
      });

      return () => controls.stop();
    }
  }, [isInView, to, from, duration, delay, prefix, suffix, decimals, isLow, profile]);

  return (
    <span ref={spanRef} className={className}>
      {initialString}
    </span>
  );
}
