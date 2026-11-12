import React, { useEffect, useRef, useState } from "react";
import { useInView, useMotionValue, animate } from "framer-motion";
import { shouldReduceMotion } from "../utils/performance";

/**
 * AnimatedCounter
 * Smooth, 60fps numerical count-up component with viewport detection.
 * Formats numbers elegantly (e.g., ₹1,00,000+, 500+, 20+, 100%).
 */
export default function AnimatedCounter({
  from = 0,
  to = 100,
  duration = 1.4,
  delay = 0.1,
  prefix = "",
  suffix = "",
  decimals = 0,
  className = "",
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-30px" });
  const motionVal = useMotionValue(from);

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

  const [display, setDisplay] = useState(() => `${prefix}${formatNumber(from)}${suffix}`);

  useEffect(() => {
    // Accessibility check: immediately render final value if reduced motion is preferred
    if (shouldReduceMotion()) {
      setDisplay(`${prefix}${formatNumber(to)}${suffix}`);
      return;
    }

    if (isInView) {
      const controls = animate(motionVal, to, {
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1],
        onUpdate: (latest) => {
          setDisplay(`${prefix}${formatNumber(latest)}${suffix}`);
        },
      });

      return () => controls.stop();
    }
  }, [isInView, to, from, duration, delay, prefix, suffix, decimals]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}
