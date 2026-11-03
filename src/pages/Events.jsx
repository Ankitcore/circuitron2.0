import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { events } from "../data/events";
import { Bot, Cpu, Sparkles, ExternalLink, X, ShieldCheck, Trophy, MapPin, Calendar } from "lucide-react";

export default function Events() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedEvent, setSelectedEvent] = useState(null);

  const categories = ["All", "Robotics", "Exhibition", "Technical", "Workshop"];

  const filteredEvents =
    activeCategory === "All"
      ? events
      : events.filter((e) => e.category === activeCategory);

  const getEventIcon = (id) => {
    switch (id) {
      case 2:
        return <Bot className="w-7 h-7 text-emerald-400" />;
      case 3:
        return <Bot className="w-7 h-7 text-amber-400" />;
      default:
        return <Cpu className="w-7 h-7 text-cyan-400" />;
    }
  };

  const getBadgeStyle = (category) => {
    switch (category) {
      case "Robotics":
        return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
      case "Technical":
        return "bg-cyan-500/15 text-cyan-300 border-cyan-500/30";
      default:
        return "bg-purple-500/15 text-purple-300 border-purple-500/30";
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
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-primary/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-xs font-semibold text-accent">
            <Sparkles className="w-3.5 h-3.5" />
            <span>CHALLENGES &amp; ARENAS</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-black font-orbitron gradient-text">
            Competitions &amp; Events
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded-full" />
          <p className="text-gray-300 max-w-2xl mx-auto text-base sm:text-lg">
            Review the official competitions of TechXpo 2.O. Inspect specifications, technical guidelines, and register your team before slots close.
          </p>
        </div>
      </section>

      {/* Category Pills */}
      <section className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-3">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 rounded-full text-xs font-semibold transition-all duration-200 border ${
                  activeCategory === cat
                    ? "bg-gradient-to-r from-primary to-accent text-darkNavy font-bold border-transparent shadow-neon"
                    : "glass-card text-gray-300 hover:text-white border-primary/20 hover:border-primary/40"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                onClick={() => setSelectedEvent(event)}
                className="glass-card rounded-2xl p-7 border border-primary/20 flex flex-col justify-between cursor-pointer group hover:border-accent/50 relative overflow-hidden"
              >
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="w-14 h-14 rounded-2xl bg-darkNavy/80 border border-primary/30 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                      {getEventIcon(event.id)}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getBadgeStyle(event.category)}`}>
                      {event.category}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold font-orbitron text-white group-hover:text-primary transition-colors">
                      {event.title}
                    </h3>
                    <p className="text-accent font-semibold text-sm mt-1">
                      {event.tagline}
                    </p>
                  </div>

                  <p className="text-gray-300 text-sm leading-relaxed line-clamp-3">
                    {event.description}
                  </p>

                  {event.requirements && (
                    <div className="flex items-center space-x-2 text-xs text-gray-400 bg-darkNavy/60 px-3.5 py-2.5 rounded-xl border border-white/5">
                      <ShieldCheck className="w-4 h-4 text-primary flex-shrink-0" />
                      <span>{event.requirements}</span>
                    </div>
                  )}
                </div>

                <div className="pt-6 mt-6 border-t border-white/10 flex items-center space-x-3">
                  {event.registrationLink ? (
                    <a
                      href={event.registrationLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button className="w-full btn-primary py-2.5 text-xs font-bold">
                        <span>Register Now</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </a>
                  ) : null}
                  <button
                    onClick={() => setSelectedEvent(event)}
                    className="flex-1 btn-secondary py-2.5 text-xs font-bold"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modal Lightbox */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-darkNavy/90 backdrop-blur-xl z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedEvent(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-panel p-8 sm:p-10 rounded-3xl max-w-2xl w-full border border-primary/30 shadow-2xl relative max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedEvent(null)}
                className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-6">
                <div className="space-y-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getBadgeStyle(selectedEvent.category)}`}>
                    {selectedEvent.category}
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-black font-orbitron text-white">
                    {selectedEvent.title}
                  </h2>
                  <p className="text-accent font-semibold text-base">
                    {selectedEvent.tagline}
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-gray-400">
                    Event Overview
                  </h4>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {selectedEvent.description}
                  </p>
                </div>

                {selectedEvent.requirements && (
                  <div className="space-y-2 bg-darkNavy/80 p-5 rounded-2xl border border-primary/20">
                    <h4 className="text-xs font-mono uppercase tracking-wider text-primary font-bold">
                      Kit &amp; Participation Specifications
                    </h4>
                    <p className="text-gray-300 text-sm">
                      {selectedEvent.requirements}
                    </p>
                  </div>
                )}

                <div className="pt-4 flex flex-col sm:flex-row items-center gap-4">
                  {selectedEvent.registrationLink && (
                    <a
                      href={selectedEvent.registrationLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto flex-1 btn-primary text-center"
                    >
                      <span>Proceed to Official Registration Form</span>
                      <ExternalLink className="w-4 h-4 ml-1.5 inline" />
                    </a>
                  )}
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="w-full sm:w-auto btn-secondary"
                  >
                    Close Dossier
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
