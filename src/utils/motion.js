/**
 * Professional UI Motion & Animation Design System for Circuitron / TechXpo 2.O
 *
 * Adaptive motion engine that scales duration, transform offsets, and physics
 * according to Profile A (High), Profile B (Standard), or Profile C (Low / 60Hz Smoothness).
 */

import { getPerformanceProfile, shouldReduceMotion } from "./performance";

// Custom cubic-bezier easing curve: fast out, ultra smooth slow down
export const smoothEase = [0.22, 1, 0.36, 1];
export const springPhysics = { type: "spring", stiffness: 380, damping: 28 };
export const gentleHoverSpring = { type: "spring", stiffness: 400, damping: 25 };

/**
 * Standardized adaptive viewport configuration:
 * Profile C uses a larger margin (100px) so items animate into place before scrolling
 * into visible viewport, eliminating scrolling stutter and perceived pop-in.
 */
export const viewportConfig = {
  once: true,
  get margin() {
    const profile = getPerformanceProfile();
    if (profile === "C") return "100px";
    if (profile === "B") return "-20px";
    return "-40px";
  },
};

/**
 * Fade In Up: Primary entrance for section headings, text, and containers
 */
export const fadeInUp = {
  hidden: () => {
    const profile = getPerformanceProfile();
    return {
      opacity: 0,
      y: profile === "C" ? 4 : profile === "B" ? 12 : 20,
    };
  },
  visible: (custom = 0) => {
    const profile = getPerformanceProfile();
    const isLow = profile === "C";
    const isStd = profile === "B";

    return {
      opacity: 1,
      y: 0,
      transition: {
        duration: isLow ? 0.22 : isStd ? 0.42 : 0.65,
        delay: isLow ? 0 : typeof custom === "number" ? (isStd ? custom * 0.6 : custom) : 0,
        ease: isLow ? "easeOut" : smoothEase,
      },
    };
  },
};

/**
 * Fade In Down: Used for navbar badges and top announcements
 */
export const fadeInDown = {
  hidden: () => {
    const profile = getPerformanceProfile();
    return {
      opacity: 0,
      y: profile === "C" ? -4 : profile === "B" ? -10 : -16,
    };
  },
  visible: (custom = 0) => {
    const profile = getPerformanceProfile();
    const isLow = profile === "C";
    const isStd = profile === "B";

    return {
      opacity: 1,
      y: 0,
      transition: {
        duration: isLow ? 0.2 : isStd ? 0.38 : 0.6,
        delay: isLow ? 0 : typeof custom === "number" ? (isStd ? custom * 0.6 : custom) : 0,
        ease: isLow ? "easeOut" : smoothEase,
      },
    };
  },
};

/**
 * Fade In Scale: Used for cards, interactive badges, and modals
 */
export const fadeInScale = {
  hidden: () => {
    const profile = getPerformanceProfile();
    return {
      opacity: 0,
      scale: profile === "C" ? 1.0 : profile === "B" ? 0.98 : 0.95,
      y: profile === "C" ? 0 : profile === "B" ? 8 : 14,
    };
  },
  visible: (custom = 0) => {
    const profile = getPerformanceProfile();
    const isLow = profile === "C";
    const isStd = profile === "B";

    return {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: isLow ? 0.2 : isStd ? 0.38 : 0.55,
        delay: isLow ? 0 : typeof custom === "number" ? (isStd ? custom * 0.6 : custom) : 0,
        ease: isLow ? "easeOut" : smoothEase,
      },
    };
  },
};

/**
 * Stagger Container: Orchestrates children elements seamlessly
 */
export const staggerContainer = (staggerChildren = 0.08, delayChildren = 0.04) => {
  const profile = getPerformanceProfile();
  const isLow = profile === "C";
  const isStd = profile === "B";

  return {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: isLow ? 0 : isStd ? staggerChildren * 0.5 : staggerChildren,
        delayChildren: isLow ? 0 : isStd ? delayChildren * 0.5 : delayChildren,
      },
    },
  };
};

/**
 * Interactive Micro-interactions
 * Profile C relies on hardware-accelerated CSS hover classes, avoiding JS main-thread contention
 */
export const cardHoverProps = {
  get whileHover() {
    const profile = getPerformanceProfile();
    if (profile === "C" || shouldReduceMotion()) return undefined;
    return {
      y: profile === "B" ? -3 : -5,
      transition: { duration: 0.22, ease: "easeOut" },
    };
  },
  get whileTap() {
    return { scale: 0.985 };
  },
};

export const buttonHoverProps = {
  get whileHover() {
    const profile = getPerformanceProfile();
    if (profile === "C" || shouldReduceMotion()) return undefined;
    return {
      scale: profile === "B" ? 1.02 : 1.035,
      transition: { duration: 0.18, ease: "easeOut" },
    };
  },
  get whileTap() {
    return { scale: 0.965 };
  },
};

export const iconHoverProps = {
  get whileHover() {
    const profile = getPerformanceProfile();
    if (profile === "C" || shouldReduceMotion()) return undefined;
    return {
      scale: 1.08,
      transition: { duration: 0.25, ease: "easeOut" },
    };
  },
};
