import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Rocket, ArrowUpRight } from "lucide-react";

/**
 * ScrollToTop
 * Lightweight quick-registration action button.
 *
 * Performance Optimizations:
 * - Passive scroll listener with RAF throttling.
 * - Only triggers React state updates when crossing the 300px threshold,
 *   completely eliminating continuous scroll-driven re-renders.
 */
export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const isVisibleRef = useRef(false);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const visible = window.scrollY > 300;
          if (visible !== isVisibleRef.current) {
            isVisibleRef.current = visible;
            setIsVisible(visible);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleClick = () => {
    window.open("https://forms.gle/mNU3damnJBMfnmSU7", "_blank", "noopener,noreferrer");
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 20 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 select-none"
        >
          <motion.button
            onClick={handleClick}
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.96 }}
            className="group relative flex items-center space-x-2 px-3.5 py-2.5 sm:px-5 sm:py-3.5 rounded-full bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] text-darkNavy font-black font-orbitron text-[11px] sm:text-xs shadow-neonLg border border-white/20 transition-all duration-300"
          >
            <Rocket className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:-translate-y-0.5 transition-transform" />
            <span>Register Now</span>
            <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
