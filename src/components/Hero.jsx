import React from "react";
import { motion } from "framer-motion";
import { Calendar, MapPin, Download, ArrowRight, Sparkles, Trophy, Users, Bot } from "lucide-react";
import TechModel3D from "./TechModel3D";
import CountdownTimer from "./CountdownTimer";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-28 pb-16 lg:pt-32 lg:pb-24">
      {/* Background radial glow spots */}
      <div className="absolute inset-0 pointer-events-none circuit-bg opacity-30" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-cyberPurple/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Hero Content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-7 space-y-6 text-center lg:text-left"
          >
            {/* Announcement Top Pill */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full glass-panel border border-primary/30 text-xs font-semibold text-accent shadow-neon"
            >
              <Sparkles className="w-3.5 h-3.5 text-accent animate-pulse" />
              <span>Flagship Tech Symposium &bull; RVSCET Jamshedpur</span>
            </motion.div>

            {/* Giant Title */}
            <div className="space-y-2">
              <motion.h1
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="text-5xl sm:text-7xl lg:text-8xl font-black font-orbitron tracking-tight"
              >
                <span className="gradient-text">TechXpo</span>
                <span className="block text-4xl sm:text-6xl text-white mt-1">
                  2.O
                </span>
              </motion.h1>

              {/* Tagline Bracket */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="inline-block"
              >
                <p className="text-xl sm:text-2xl font-bold font-orbitron tracking-wider text-accent uppercase">
                  [ Think &bull; Inspire &bull; Innovate ]
                </p>
              </motion.div>
            </div>

            {/* Subtitle Description */}
            <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Organized by{" "}
              <span className="text-primary font-bold">Circuitron</span> &mdash;
              The Premier IoT and Embedded System Club of RVS College of Engineering &amp; Technology, Jamshedpur.
            </p>

            {/* Event Key Details */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-sm text-gray-300">
              <div className="flex items-center space-x-2 bg-darkNavy/80 px-4 py-2 rounded-xl border border-primary/20">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="font-semibold text-white">30 November 2026</span>
              </div>
              <div className="flex items-center space-x-2 bg-darkNavy/80 px-4 py-2 rounded-xl border border-primary/20">
                <MapPin className="w-4 h-4 text-accent" />
                <span className="font-semibold text-white">RVSCET Campus, Jamshedpur</span>
              </div>
            </div>

            {/* Countdown Component */}
            <div className="pt-2">
              <CountdownTimer />
            </div>

            {/* Action CTA Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <motion.a
                href="https://forms.gle/mmUiZV4xpYRamn5r8"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-primary w-full sm:w-auto"
              >
                <span>Register for TechXpo 2.O</span>
                <ArrowRight className="w-4 h-4" />
              </motion.a>

              <motion.a
                href="https://drive.google.com/file/d/1Zv-wZ5zcP8t6_KfL859mo2oRgRSMpr4r/view?usp=drivesdk"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-secondary w-full sm:w-auto"
              >
                <Download className="w-4 h-4" />
                <span>Event Brochure</span>
              </motion.a>
            </div>
          </motion.div>

          {/* Right Column: 3D Tech Model Rig */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="lg:col-span-5 flex flex-col items-center justify-center"
          >
            <TechModel3D />

            {/* Highlights Chips Below 3D Model */}
            <div className="grid grid-cols-3 gap-3 w-full max-w-sm mt-8">
              <div className="glass-card p-3 rounded-xl text-center border border-primary/20">
                <Trophy className="w-4 h-4 text-yellow-400 mx-auto mb-1" />
                <div className="text-xs font-bold text-white font-orbitron">₹50K+</div>
                <div className="text-[10px] text-gray-400">Prizes</div>
              </div>
              <div className="glass-card p-3 rounded-xl text-center border border-primary/20">
                <Bot className="w-4 h-4 text-primary mx-auto mb-1" />
                <div className="text-xs font-bold text-white font-orbitron">3 Arenas</div>
                <div className="text-[10px] text-gray-400">Combat &amp; Race</div>
              </div>
              <div className="glass-card p-3 rounded-xl text-center border border-primary/20">
                <Users className="w-4 h-4 text-accent mx-auto mb-1" />
                <div className="text-xs font-bold text-white font-orbitron">500+</div>
                <div className="text-[10px] text-gray-400">Innovators</div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
