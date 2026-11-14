import React from "react";
import { motion } from "framer-motion";
import { cardHoverProps, smoothEase, gentleEase, viewportConfig } from "../utils/motion";
import { scheduleDays } from "../data/schedule";
import { Clock, MapPin, Sparkles, AlertCircle, Info, CalendarCheck } from "lucide-react";

export default function Schedule() {
  const getTypeBadgeClass = (type) => {
    switch (type) {
      case "Competition":
        return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
      case "Workshop":
        return "bg-purple-500/15 text-purple-300 border-purple-500/30";
      case "Exhibition":
        return "bg-blue-500/15 text-blue-300 border-blue-500/30";
      case "Ceremony":
        return "bg-yellow-500/15 text-yellow-300 border-yellow-500/30";
      case "Keynote":
        return "bg-rose-500/15 text-rose-300 border-rose-500/30";
      default:
        return "bg-primary/15 text-primary border-primary/30";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen pt-28 pb-20"
    >
      {/* Header */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 circuit-bg opacity-30" />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] rounded-full pointer-events-none opacity-30"
          style={{
            background: "radial-gradient(ellipse at center, rgba(0, 191, 255, 0.18) 0%, transparent 70%)",
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
            <Sparkles className="w-3.5 h-3.5" />
            <span>EVENT TIMELINE</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-black font-orbitron gradient-text">
            Event Schedule
          </h1>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.75, delay: 0.2, ease: gentleEase }}
            className="w-24 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded-full origin-center"
          />
          <p className="text-gray-300 max-w-2xl mx-auto text-base sm:text-lg">
            Plan your TechXpo 2.O participation. Note down registration check-in windows, competition rounds, and the grand closing ceremony.
          </p>
        </div>
      </section>

      {/* Schedule Timeline */}
      <section className="py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {scheduleDays.map((dayGroup) => (
            <div key={dayGroup.day} className="space-y-8">
              {/* Day Header Badge */}
              <div className="text-center">
                <div className="inline-flex items-center space-x-2 px-5 py-2 rounded-2xl glass-panel border border-accent/40 shadow-neon">
                  <CalendarCheck className="w-5 h-5 text-accent" />
                  <span className="font-orbitron font-extrabold text-lg text-white">
                    {dayGroup.day}
                  </span>
                </div>
              </div>

              {/* Timeline Container with Left Glowing Trace */}
              <div className="relative border-l-2 border-primary/30 ml-2 xs:ml-4 sm:ml-8 pl-5 xs:pl-6 sm:pl-10 space-y-4 sm:space-y-6">
                {dayGroup.events.map((event, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -18 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={viewportConfig}
                    transition={{
                      duration: 0.55,
                      delay: idx * 0.07,
                      ease: smoothEase,
                    }}
                    whileHover={{ x: 5, transition: { duration: 0.2 } }}
                    className="relative glass-card p-4 sm:p-6 rounded-2xl border border-primary/20 group hover:border-accent/50 transition-all duration-300"
                  >
                    {/* Glowing Node on the timeline */}
                    <div className="absolute -left-[28px] xs:-left-[32px] sm:-left-[48px] top-5 sm:top-6 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-darkNavy border-2 border-primary group-hover:border-accent group-hover:scale-125 transition-all shadow-[0_0_10px_#00bfff]" />

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                      <div className="space-y-1.5 sm:space-y-2">
                        {/* Time & Venue */}
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
                          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-primary/20 border border-primary/40 font-mono font-bold text-accent text-[11px] sm:text-xs">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{event.time}</span>
                          </span>

                          <span className="inline-flex items-center space-x-1.5 text-gray-400 text-[11px] sm:text-xs">
                            <img
                              src="/assets/rvscet-logo.webp"
                              alt="RVSCET"
                              className="w-3.5 h-3.5 object-contain flex-shrink-0"
                            />
                            <span>{event.location}</span>
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-lg sm:text-xl font-bold font-orbitron text-white group-hover:text-primary transition-colors">
                          {event.title}
                        </h3>
                      </div>

                      {/* Type Badge */}
                      <span className={`self-start sm:self-center px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold border ${getTypeBadgeClass(event.type)}`}>
                        {event.type}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Important Information Cards */}
      <section className="py-10 sm:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-panel p-5 sm:p-10 rounded-2xl sm:rounded-3xl border border-primary/30">
            <h3 className="text-xl sm:text-2xl font-bold font-orbitron text-white mb-6 flex items-center space-x-2">
              <Info className="w-6 h-6 text-primary" />
              <span>Participant Guidelines &amp; Directives</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-300">
              <div className="space-y-2 bg-darkNavy/60 p-5 rounded-2xl border border-white/5">
                <h4 className="font-bold text-white font-orbitron text-sm text-accent">
                  01. Registration Desk
                </h4>
                <p className="text-xs leading-relaxed text-gray-400">
                  Check-in counter opens promptly at 09:00 AM on Day 1 at Main Auditorium. Bring college photo IDs and payment confirmation.
                </p>
              </div>

              <div className="space-y-2 bg-darkNavy/60 p-5 rounded-2xl border border-white/5">
                <h4 className="font-bold text-white font-orbitron text-sm text-primary">
                  02. Pit Arena Access
                </h4>
                <p className="text-xs leading-relaxed text-gray-400">
                  Combat bots must clear weight, dimension, and voltage safety inspection at the Robotics Pit Lab 30 minutes prior to match start.
                </p>
              </div>

              <div className="space-y-2 bg-darkNavy/60 p-5 rounded-2xl border border-white/5">
                <h4 className="font-bold text-white font-orbitron text-sm text-cyberPurple">
                  03. Live Notice Board
                </h4>
                <p className="text-xs leading-relaxed text-gray-400">
                  Match fixtures, qualifying brackets, and stage announcements will be posted on display monitors and WhatsApp announcement groups.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
