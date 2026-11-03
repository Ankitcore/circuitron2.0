import React from "react";
import { motion } from "framer-motion";

export default function PageLoader() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center relative z-20 py-20">
      <div className="relative flex items-center justify-center">
        {/* Outer glowing pulsing ring */}
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.08, 1],
          }}
          transition={{
            rotate: { duration: 3, repeat: Infinity, ease: "linear" },
            scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
          }}
          className="w-20 h-20 rounded-full border-2 border-primary/20 border-t-accent border-r-primary shadow-neon"
        />

        {/* Inner reverse spin ring */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="absolute w-12 h-12 rounded-full border border-cyberPurple/40 border-b-primary"
        />

        {/* Center icon / circuit node */}
        <div className="absolute w-6 h-6 rounded-lg bg-darkNavy border border-primary/60 flex items-center justify-center shadow-neon">
          <div className="w-2 h-2 rounded-full bg-accent animate-ping" />
        </div>
      </div>

      <div className="mt-6 flex flex-col items-center space-y-1">
        <span className="font-orbitron font-bold text-xs uppercase tracking-[0.25em] text-accent">
          Circuitron 2.0
        </span>
        <span className="font-mono text-[11px] text-gray-400">
          Loading system telemetry...
        </span>
      </div>
    </div>
  );
}
