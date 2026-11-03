import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";

export default function CountdownTimer() {
  const targetDate = new Date("2025-11-10T09:00:00+05:30").getTime();

  const calculateTimeLeft = () => {
    const now = new Date().getTime();
    const difference = targetDate - now;

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
    <div className="inline-flex flex-col items-center p-3 sm:p-4 rounded-2xl glass-card border border-primary/30 max-w-xl mx-auto shadow-neon">
      <div className="flex items-center space-x-2 text-xs font-orbitron font-semibold text-accent mb-3 tracking-wider">
        <Clock className="w-3.5 h-3.5 animate-spin-slow" />
        <span>COUNTDOWN TO TECHXPO 2025</span>
      </div>

      <div className="grid grid-cols-4 gap-2 sm:gap-4">
        {timeUnits.map((unit) => (
          <div
            key={unit.label}
            className="flex flex-col items-center bg-darkNavy/70 px-3 py-2 sm:px-4 sm:py-3 rounded-xl border border-primary/20 min-w-[65px] sm:min-w-[85px]"
          >
            <span className="font-orbitron font-extrabold text-xl sm:text-3xl text-white tracking-wider">
              {String(unit.value).padStart(2, "0")}
            </span>
            <span className="text-[9px] sm:text-[10px] font-mono text-gray-400 mt-0.5 tracking-wider font-semibold">
              {unit.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
