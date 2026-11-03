import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Rocket, ArrowUpRight } from "lucide-react";

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleClick = () => {
    window.open("https://forms.gle/mNU3damnJBMfnmSU7", "_blank", "noopener,noreferrer");
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 30 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed bottom-6 right-6 z-50 select-none"
        >
          <motion.button
            onClick={handleClick}
            whileHover={{ scale: 1.05, y: -3 }}
            whileTap={{ scale: 0.95 }}
            className="group relative flex items-center space-x-2.5 px-5 py-3.5 rounded-full bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] text-darkNavy font-black font-orbitron text-xs shadow-neonLg border border-white/20 transition-all duration-300"
          >
            <Rocket className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
            <span>Register Now</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
