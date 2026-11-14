/**
 * Professional UI Motion & Animation Design System for Circuitron / TechXpo 2.O
 * Built with Framer Motion for locked 60 FPS GPU-accelerated transforms & opacity.
 * Respects prefers-reduced-motion and hardware performance tiers.
 */

import { shouldReduceMotion, isLowEndDevice } from "./performance";

// Custom cubic-bezier easing curves
export const smoothEase = [0.22, 1, 0.36, 1];
// Ultra-refined silky ease curve: fast gentle launch, whisper-smooth deceleration
export const gentleEase = [0.16, 1, 0.3, 1];
export const springPhysics = { type: "spring", stiffness: 380, damping: 28 };
export const gentleHoverSpring = { type: "spring", stiffness: 400, damping: 25 };

// Standardized viewport configuration (fires once, smooth margin offset)
export const viewportConfig = {
  once: true,
  margin: "-40px",
};

/**
 * Returns performance-adaptive animation duration (shorter on low-spec/mobile)
 */
export function getAdaptiveDuration(base = 0.6) {
  if (typeof window === "undefined") return base;
  if (shouldReduceMotion()) return 0.05;
  if (isLowEndDevice()) return Math.max(0.25, base * 0.7);
  return base;
}

// Fade In Up: Primary entrance for section headings, text, and containers
export const fadeInUp = {
  hidden: { opacity: 0, y: 22 },
  visible: (custom = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: getAdaptiveDuration(0.65),
      delay: typeof custom === "number" ? custom : 0,
      ease: gentleEase,
    },
  }),
};

// Gentle Subtle Fade In Up: Ideal for text and micro-components
export const gentleFadeInUp = {
  hidden: { opacity: 0, y: 14 },
  visible: (custom = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: getAdaptiveDuration(0.55),
      delay: typeof custom === "number" ? custom : 0,
      ease: gentleEase,
    },
  }),
};

// Fade In Down: Used for navbar badges and top announcements
export const fadeInDown = {
  hidden: { opacity: 0, y: -16 },
  visible: (custom = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: getAdaptiveDuration(0.55),
      delay: typeof custom === "number" ? custom : 0,
      ease: gentleEase,
    },
  }),
};

// Fade In Scale: Used for cards, interactive badges, and modals
export const fadeInScale = {
  hidden: { opacity: 0, scale: 0.96, y: 12 },
  visible: (custom = 0) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: getAdaptiveDuration(0.5),
      delay: typeof custom === "number" ? custom : 0,
      ease: gentleEase,
    },
  }),
};

// Decorative Underline Expand: Originates from center outwards
export const underlineExpand = {
  hidden: { scaleX: 0, opacity: 0.8 },
  visible: (custom = 0.2) => ({
    scaleX: 1,
    opacity: 1,
    transition: {
      duration: getAdaptiveDuration(0.75),
      delay: typeof custom === "number" ? custom : 0.2,
      ease: gentleEase,
    },
  }),
};

// Stagger Container: Orchestrates children elements seamlessly
export const staggerContainer = (staggerChildren = 0.08, delayChildren = 0.04) => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: isLowEndDevice() ? 0.04 : staggerChildren,
      delayChildren,
    },
  },
});

// Interactive Micro-interactions
export const cardHoverProps = {
  whileHover: {
    y: -4,
    transition: { duration: 0.25, ease: "easeOut" },
  },
  whileTap: { scale: 0.985 },
};

export const buttonHoverProps = {
  whileHover: {
    scale: 1.03,
    transition: { duration: 0.2, ease: "easeOut" },
  },
  whileTap: { scale: 0.97 },
};

export const iconHoverProps = {
  whileHover: {
    scale: 1.1,
    rotate: [0, -3, 3, 0],
    transition: { duration: 0.3, ease: "easeOut" },
  },
};
