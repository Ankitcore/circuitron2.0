import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { events } from "../data/events";
import { Bot, Cpu, Sparkles, ExternalLink, ArrowRight, ShieldCheck, Zap } from "lucide-react";
import CyberProgressBar from "./CyberProgressBar";
import AnimatedCounter from "./AnimatedCounter";
import { cardHoverProps, buttonHoverProps, smoothEase, viewportConfig } from "../utils/motion";

export default function FeaturedEvents() {
  const featured = events.slice(0, 3);

  const getEventIcon = (id) => {
    switch (id) {
      case 2:
        return <Bot className="w-6 h-6 text-emerald-400" />;
      case 3:
        return <Zap className="w-6 h-6 text-amber-400" />;
      default:
        return <Cpu className="w-6 h-6 text-cyan-400" />;
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
    <section className="py-24 relative overflow-hidden bg-gradient-to-b from-transparent via-primary/5 to-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center space-y-4 mb-16"
        >
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-xs font-semibold text-accent">
            <Sparkles className="w-3.5 h-3.5" />
            <span>FLAGSHIP CHALLENGES</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-black font-orbitron gradient-text">
            Featured Competitions
          </h2>
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="w-24 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded-full origin-center"
          />
          <p className="text-gray-300 max-w-2xl mx-auto text-base sm:text-lg">
            Battle your robots in high-stakes combat arenas, race autonomous bots against the clock, or display your breakthrough hardware prototypes.
          </p>
        </motion.div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featured.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.15, ease: smoothEase }}
              viewport={viewportConfig}
              {...cardHoverProps}
              className="glass-card rounded-2xl p-7 border border-primary/20 flex flex-col justify-between group relative overflow-hidden"
            >
              {/* Corner tech accent */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-bl-full pointer-events-none group-hover:bg-primary/20 transition-all duration-300" />

              <div className="space-y-5">
                {/* Top Row: Icon & Category */}
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-darkNavy/80 border border-primary/30 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-300">
                    {getEventIcon(event.id)}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getBadgeStyle(event.category)}`}>
                    {event.category}
                  </span>
                </div>

                {/* Title & Tagline */}
                <div>
                  <h3 className="text-2xl font-bold font-orbitron text-white group-hover:text-primary transition-colors duration-200">
                    {event.title}
                  </h3>
                  <p className="text-accent font-semibold text-sm mt-1">
                    {event.tagline}
                  </p>
                </div>

                {/* Description */}
                <p className="text-gray-300 text-sm leading-relaxed">
                  {event.description}
                </p>

                {/* Requirements badge */}
                {event.requirements && (
                  <div className="flex items-center space-x-2 text-xs text-gray-400 bg-darkNavy/60 px-3 py-2 rounded-lg border border-white/5">
                    <ShieldCheck className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>Req: {event.requirements}</span>
                  </div>
                )}

                {/* Event Slot Progress Bar */}
                <div className="pt-2 space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-mono text-gray-400">
                    <span>REGISTRATION SLOTS</span>
                    <span className="text-accent font-semibold">
                      <AnimatedCounter
                        from={0}
                        to={event.id === 1 ? 80 : event.id === 2 ? 90 : 75}
                        suffix="% Reserved"
                        duration={1.1}
                        delay={0.15 + index * 0.08}
                      />
                    </span>
                  </div>
                  <CyberProgressBar
                    value={event.id === 1 ? 80 : event.id === 2 ? 90 : 75}
                    gradient="from-primary to-accent"
                    height="h-1"
                    borderColor="border-primary/25"
                    delay={0.15 + index * 0.08}
                    duration={1.1}
                    inView={true}
                    showShimmer={true}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-6 mt-6 border-t border-white/10 flex items-center space-x-3">
                {event.registrationLink ? (
                  <motion.a
                    href={event.registrationLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    {...buttonHoverProps}
                    className="flex-1 btn-primary py-2.5 text-xs font-bold flex items-center justify-center space-x-1.5"
                  >
                    <span>Register Now</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </motion.a>
                ) : (
                  <Link to="/events" className="flex-1">
                    <motion.div
                      {...buttonHoverProps}
                      className="w-full btn-secondary py-2.5 text-xs font-bold flex items-center justify-center space-x-1.5"
                    >
                      <span>Event Specs</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </motion.div>
                  </Link>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* View All Events Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: smoothEase }}
          viewport={viewportConfig}
          className="text-center mt-16"
        >
          <Link to="/events" className="inline-block">
            <motion.div {...buttonHoverProps} className="btn-secondary">
              <span>View All Events &amp; Rulebooks</span>
              <ArrowRight className="w-4 h-4" />
            </motion.div>
          </Link>
        </motion.div>

      </div>
    </section>
  );
}
