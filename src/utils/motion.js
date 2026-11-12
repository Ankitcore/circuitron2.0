/**
 * Professional UI Motion & Animation Design System for Circuitron / TechXpo 2.O
 * Built with Framer Motion for 60 FPS GPU-accelerated transforms & opacity.
 * Respects prefers-reduced-motion and hardware performance tiers.
 */

// Custom cubic-bezier easing curve: fast out, ultra smooth slow down
export const smoothEase = [0.22, 1, 0.36, 1];
export const springPhysics = { type: "spring", stiffness: 380, damping: 28 };
export const gentleHoverSpring = { type: "spring", stiffness: 400, damping: 25 };

// Standardized viewport configuration (fires once, smooth margin offset)
export const viewportConfig = {
  once: true,
  margin: "-40px",
};

// Fade In Up: Primary entrance for section headings, text, and containers
export const fadeInUp = {
  hidden: { opacity: 0, y: 22 },
  visible: (custom = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
      delay: typeof custom === "number" ? custom : 0,
      ease: smoothEase,
    },
  }),
};

// Fade In Down: Used for navbar badges and top announcements
export const fadeInDown = {
  hidden: { opacity: 0, y: -18 },
  visible: (custom = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      delay: typeof custom === "number" ? custom : 0,
      ease: smoothEase,
    },
  }),
};

// Fade In Scale: Used for cards, interactive badges, and modals
export const fadeInScale = {
  hidden: { opacity: 0, scale: 0.95, y: 15 },
  visible: (custom = 0) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.55,
      delay: typeof custom === "number" ? custom : 0,
      ease: smoothEase,
    },
  }),
};

// Stagger Container: Orchestrates children elements seamlessly
export const staggerContainer = (staggerChildren = 0.09, delayChildren = 0.05) => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren,
      delayChildren,
    },
  },
});

// Interactive Micro-interactions
export const cardHoverProps = {
  whileHover: {
    y: -5,
    transition: { duration: 0.28, ease: "easeOut" },
  },
  whileTap: { scale: 0.985 },
};

export const buttonHoverProps = {
  whileHover: {
    scale: 1.035,
    transition: { duration: 0.2, ease: "easeOut" },
  },
  whileTap: { scale: 0.965 },
};

export const iconHoverProps = {
  whileHover: {
    scale: 1.12,
    rotate: [0, -4, 4, 0],
    transition: { duration: 0.35, ease: "easeOut" },
  },
};
