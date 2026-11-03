import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Trophy, Users, Calendar, Award, Sparkles, ArrowRight, Zap, Target } from "lucide-react";

export default function Stats() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center space-y-4 mb-16"
        >
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
            <Sparkles className="w-3.5 h-3.5" />
            <span>DISCOVER THE EXPERIENCE</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-black font-orbitron gradient-text">
            About TechXpo 2026
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded-full" />
          <p className="text-gray-300 max-w-3xl mx-auto text-base sm:text-lg leading-relaxed">
            TechXpo 2026 is a high-octane celebration of innovation, embedded systems, and autonomous robotics.
            Organized by Circuitron at RVSCET, it gathers tech visionaries, student creators, and developers across Eastern India.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          
          {/* Bento Item 1 (Wide): Big Impact */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="md:col-span-2 glass-card p-8 rounded-2xl border border-primary/25 relative overflow-hidden group flex flex-col justify-between"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none group-hover:bg-primary/20 transition-all duration-500" />
            <div className="space-y-4 relative z-10">
              <div className="w-12 h-12 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold font-orbitron text-white">
                Next-Gen IoT &amp; Embedded Arena
              </h3>
              <p className="text-gray-300 leading-relaxed text-sm sm:text-base">
                From autonomous line-followers and heavy combat bots to cutting-edge smart hardware prototypes,
                TechXpo offers real-world arena challenges judged by distinguished academia and industry mentors.
              </p>
            </div>

            <div className="pt-6 relative z-10">
              <Link
                to="/about"
                className="inline-flex items-center space-x-2 text-accent font-semibold text-sm hover:underline"
              >
                <span>Read the Story of Circuitron</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>

          {/* Bento Item 2: Prize Pool */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="glass-card p-8 rounded-2xl border border-amber-500/30 flex flex-col justify-between relative overflow-hidden group"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mb-4">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <div className="text-4xl font-black font-orbitron text-amber-400">
                ₹50,000+
              </div>
              <h4 className="text-lg font-bold text-white mt-1">Prize Pool</h4>
              <p className="text-gray-400 text-xs mt-2 leading-relaxed">
                Cash rewards, championship trophies, and certificates for arena winners.
              </p>
            </div>
          </motion.div>

          {/* Bento Item 3: Participants */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="glass-card p-8 rounded-2xl border border-primary/25 flex flex-col justify-between"
          >
            <div className="w-12 h-12 rounded-xl bg-accent/20 border border-accent/40 flex items-center justify-center text-accent mb-4">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-4xl font-black font-orbitron text-white">
                500+
              </div>
              <h4 className="text-lg font-bold text-white mt-1">Innovators</h4>
              <p className="text-gray-400 text-xs mt-2 leading-relaxed">
                Talented engineering students from colleges across Jharkhand, Bihar, and West Bengal.
              </p>
            </div>
          </motion.div>

          {/* Bento Item 4: Challenges */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="glass-card p-8 rounded-2xl border border-cyberPurple/30 flex flex-col justify-between"
          >
            <div className="w-12 h-12 rounded-xl bg-cyberPurple/20 border border-cyberPurple/40 flex items-center justify-center text-cyberPurple mb-4">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <div className="text-4xl font-black font-orbitron text-cyberPurple">
                20+
              </div>
              <h4 className="text-lg font-bold text-white mt-1">Events &amp; Demos</h4>
              <p className="text-gray-400 text-xs mt-2 leading-relaxed">
                Multi-category robotics, project stalls, technical exhibits, and workshops.
              </p>
            </div>
          </motion.div>

          {/* Bento Item 5: Duration */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            viewport={{ once: true }}
            className="md:col-span-2 lg:col-span-3 glass-card p-8 rounded-2xl border border-primary/25 flex flex-col sm:flex-row items-center justify-between gap-6"
          >
            <div className="space-y-2 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start space-x-2 text-sm text-primary font-semibold">
                <Calendar className="w-4 h-4" />
                <span>Mark Your Calendar</span>
              </div>
              <h4 className="text-xl sm:text-2xl font-bold font-orbitron text-white">
                Ready to compete with the finest minds in tech?
              </h4>
              <p className="text-gray-300 text-sm max-w-xl">
                Registrations are currently open for Project Exhibition, Robo War, and Robo Race. Secure your slot now!
              </p>
            </div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-shrink-0">
              <Link to="/events" className="btn-primary">
                <span>Explore Events</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
