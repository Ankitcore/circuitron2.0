import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Trophy, Users, Calendar, Award, Sparkles, ArrowRight, Zap, Target } from "lucide-react";
import CyberProgressBar from "./CyberProgressBar";
import AnimatedCounter from "./AnimatedCounter";
import { cardHoverProps, buttonHoverProps, smoothEase, viewportConfig } from "../utils/motion";

export default function Stats() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background glow: Zero blur overhead */}
      <div
        className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none opacity-25"
        style={{
          background: "radial-gradient(circle, rgba(0, 191, 255, 0.2) 0%, transparent 70%)",
        }}
      />

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
            About TechXpo 2.O
          </h2>
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="w-24 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded-full origin-center"
          />
          <p className="text-gray-300 max-w-3xl mx-auto text-base sm:text-lg leading-relaxed">
            TechXpo 2.0 is where innovation meets imagination and technology shapes tomorrow. More than just a tech festival, it's an immersive experience celebrating creativity, emerging technologies. Organized by{" "}
            <strong className="text-white font-bold">
              Circuitron &ndash; The IoT &amp; Embedded Systems Club of RVSCET
            </strong>
            , TechXpo 2.0 brings together passionate innovators, tech enthusiasts, and future engineers to explore ideas, showcase talent, build solutions, and push the boundaries of what's possible.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          
          {/* Bento Item 1 (Wide): Big Impact */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.1, ease: smoothEase }}
            viewport={viewportConfig}
            {...cardHoverProps}
            className="md:col-span-2 glass-card p-8 rounded-2xl border border-primary/25 relative overflow-hidden group flex flex-col justify-between"
          >
            <div
              className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none opacity-30 group-hover:opacity-60 transition-opacity duration-500"
              style={{
                background: "radial-gradient(circle, rgba(0, 191, 255, 0.25) 0%, transparent 70%)",
              }}
            />
            <div className="space-y-4 relative z-10">
              <div className="w-12 h-12 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary group-hover:scale-105 transition-transform duration-300">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold font-orbitron text-white">
                Next-Gen IoT &amp; Embedded Arena
              </h3>
              <p className="text-gray-300 leading-relaxed text-sm sm:text-base">
                From autonomous line-followers and heavy combat bots to cutting-edge smart hardware prototypes,
                TechXpo 2.O offers real-world arena challenges judged by distinguished academia and industry mentors.
              </p>
            </div>

            <div className="pt-6 relative z-10">
              <Link
                to="/about"
                className="inline-flex items-center space-x-2 text-accent font-semibold text-sm hover:underline group-hover:translate-x-1 transition-transform"
              >
                <span>Read the Story of Circuitron</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>

          {/* Bento Item 2: Prize Pool */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: smoothEase }}
            viewport={viewportConfig}
            {...cardHoverProps}
            className="glass-card p-6 sm:p-8 rounded-2xl border border-amber-500/30 flex flex-col justify-between relative overflow-hidden group"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mb-4 shadow-sm group-hover:scale-110 transition-transform duration-300">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-black font-orbitron text-amber-400">
                <AnimatedCounter prefix="₹" to={100000} suffix="+" duration={1.5} delay={0.2} />
              </div>
              <h4 className="text-lg font-bold text-white mt-1">Prize Pool</h4>
              <p className="text-gray-400 text-xs mt-1.5 leading-relaxed">
                Cash rewards, championship trophies, and certificates for arena winners.
              </p>

              {/* Progress Bar: Prize Pool Allocation */}
              <div className="mt-4 pt-3 border-t border-amber-500/15 space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-mono text-amber-300/80">
                  <span>Prize Pool Backing</span>
                  <span className="font-bold text-amber-400">
                    <AnimatedCounter to={100} suffix="% Unlocked" duration={1.2} delay={0.25} />
                  </span>
                </div>
                <CyberProgressBar
                  value={100}
                  gradient="from-amber-500 via-yellow-400 to-amber-300"
                  borderColor="border-amber-500/25"
                  delay={0.25}
                  duration={1.2}
                  inView={true}
                  showShimmer={true}
                />
              </div>
            </div>
          </motion.div>

          {/* Bento Item 3: Participants */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: smoothEase }}
            viewport={viewportConfig}
            {...cardHoverProps}
            className="glass-card p-6 sm:p-8 rounded-2xl border border-primary/25 flex flex-col justify-between group"
          >
            <div className="w-12 h-12 rounded-xl bg-accent/20 border border-accent/40 flex items-center justify-center text-accent mb-4 shadow-sm group-hover:scale-110 transition-transform duration-300">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-black font-orbitron text-white">
                <AnimatedCounter to={500} suffix="+" duration={1.3} delay={0.3} />
              </div>
              <h4 className="text-lg font-bold text-white mt-1">Innovators</h4>
              <p className="text-gray-400 text-xs mt-1.5 leading-relaxed">
                Talented engineering students from colleges across Jharkhand, Bihar, and West Bengal.
              </p>

              {/* Progress Bar: Capacity Fill */}
              <div className="mt-4 pt-3 border-t border-primary/15 space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-mono text-accent/80">
                  <span>Slot Intake</span>
                  <span className="font-bold text-accent">
                    <AnimatedCounter to={85} suffix="% Enrolled" duration={1.2} delay={0.35} />
                  </span>
                </div>
                <CyberProgressBar
                  value={85}
                  gradient="from-primary to-accent"
                  borderColor="border-primary/25"
                  delay={0.35}
                  duration={1.2}
                  inView={true}
                  showShimmer={true}
                />
              </div>
            </div>
          </motion.div>

          {/* Bento Item 4: Challenges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: smoothEase }}
            viewport={viewportConfig}
            {...cardHoverProps}
            className="glass-card p-6 sm:p-8 rounded-2xl border border-cyberPurple/30 flex flex-col justify-between group"
          >
            <div className="w-12 h-12 rounded-xl bg-cyberPurple/20 border border-cyberPurple/40 flex items-center justify-center text-cyberPurple mb-4 shadow-sm group-hover:scale-110 transition-transform duration-300">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-black font-orbitron text-cyberPurple">
                <AnimatedCounter to={20} suffix="+" duration={1.1} delay={0.4} />
              </div>
              <h4 className="text-lg font-bold text-white mt-1">Events &amp; Demos</h4>
              <p className="text-gray-400 text-xs mt-1.5 leading-relaxed">
                Multi-category robotics, project stalls, technical exhibits, and workshops.
              </p>

              {/* Progress Bar: Arena Prepped */}
              <div className="mt-4 pt-3 border-t border-cyberPurple/15 space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-mono text-cyberPurple/90">
                  <span>Arena Specs</span>
                  <span className="font-bold text-cyberPurple">
                    <AnimatedCounter to={92} suffix="% Ready" duration={1.2} delay={0.45} />
                  </span>
                </div>
                <CyberProgressBar
                  value={92}
                  gradient="from-cyberPurple via-primary to-accent"
                  borderColor="border-cyberPurple/25"
                  delay={0.45}
                  duration={1.2}
                  inView={true}
                  showShimmer={true}
                />
              </div>
            </div>
          </motion.div>

          {/* Bento Item 5: Duration */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5, ease: smoothEase }}
            viewport={viewportConfig}
            {...cardHoverProps}
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

            <motion.div {...buttonHoverProps} className="flex-shrink-0">
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
