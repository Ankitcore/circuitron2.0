import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, Zap } from "lucide-react";

// Target countdown deadline: 29th November 2026 at 11:59:00 PM IST
const TARGET_DATE = new Date("2026-11-29T23:59:00+05:30").getTime();

export default function CountdownTimer() {
  const calculateTimeLeft = () => {
    const now = new Date().getTime();
    const difference = TARGET_DATE - now;

    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
      expired: false,
    };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const timeUnits = [
    { label: "DAYS", value: timeLeft.days },
    { label: "HOURS", value: timeLeft.hours },
    { label: "MINS", value: timeLeft.minutes },
    { label: "SECS", value: timeLeft.seconds },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      className="inline-flex flex-col items-center p-2.5 xs:p-3 sm:p-4 rounded-2xl glass-card border border-primary/30 max-w-full sm:max-w-xl mx-auto shadow-neon group"
    >
      <div className="flex items-center space-x-1.5 sm:space-x-2 text-[10px] sm:text-xs font-orbitron font-semibold text-accent mb-2.5 sm:mb-3 tracking-wider">
        <Clock className="w-3.5 h-3.5 animate-spin-slow flex-shrink-0" />
        <span className="truncate">COUNTDOWN TO TECHXPO 2.O</span>
      </div>

      <div className="grid grid-cols-4 gap-1.5 xs:gap-2 sm:gap-4 w-full">
        {timeUnits.map((unit, index) => (
          <motion.div
            key={unit.label}
            initial={{ opacity: 0, scale: 0.9, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{
              duration: 0.5,
              delay: 0.2 + index * 0.08,
              ease: [0.25, 0.1, 0.25, 1],
            }}
            whileHover={{ y: -2, scale: 1.03 }}
            className="flex flex-col items-center justify-center bg-darkNavy/70 px-2 py-1.5 xs:px-2.5 xs:py-2 sm:px-4 sm:py-3 rounded-xl border border-primary/20 min-w-[50px] xs:min-w-[58px] sm:min-w-[85px] transition-colors group-hover:border-primary/40"
          >
            <span className="font-orbitron font-extrabold text-base xs:text-xl sm:text-3xl text-white tracking-wider">
              {String(unit.value).padStart(2, "0")}
            </span>
            <span className="text-[8px] xs:text-[9px] sm:text-[10px] font-mono text-gray-400 mt-0.5 tracking-wider font-semibold">
              {unit.label}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Subtle Animated Readiness Progress Bar */}
      <div className="w-full mt-3 pt-2.5 border-t border-white/5 space-y-1.5">
        <div className="flex items-center justify-between text-[8px] xs:text-[9px] font-mono text-gray-400">
          <span className="flex items-center space-x-1">
            <span className={`w-1.5 h-1.5 rounded-full ${timeLeft.expired ? "bg-red-400" : "bg-accent animate-ping"}`} />
            <span className="text-gray-300">TIMELINE STATUS</span>
          </span>
          <span className="text-accent font-semibold flex items-center space-x-1">
            <Zap className="w-2.5 h-2.5" />
            <span>{timeLeft.expired ? "COUNTDOWN CONCLUDED" : "REGISTRATIONS LIVE"}</span>
          </span>
        </div>
        <div className="w-full h-1.5 bg-darkNavy/90 rounded-full overflow-hidden p-[1px] border border-primary/20">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: timeLeft.expired ? "100%" : "72%" }}
            transition={{ duration: 1.4, delay: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
            className="h-full bg-gradient-to-r from-primary via-accent to-cyberPurple rounded-full relative"
          >
            <div className="absolute inset-0 bg-white/25 animate-pulse rounded-full" />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
