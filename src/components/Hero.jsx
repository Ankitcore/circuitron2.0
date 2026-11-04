import React from "react";
import { motion } from "framer-motion";
import { Calendar, MapPin, Download, ArrowRight, Sparkles, Trophy, Users, Bot } from "lucide-react";
import TechModel3D from "./TechModel3D";
import CountdownTimer from "./CountdownTimer";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 pb-12 sm:pt-28 sm:pb-16 lg:pt-32 lg:pb-24">
      {/* Background radial glow spots */}
      <div className="absolute inset-0 pointer-events-none circuit-bg opacity-30" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[350px] sm:w-[600px] h-[350px] sm:h-[600px] bg-primary/10 rounded-full blur-[100px] sm:blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] bg-cyberPurple/15 rounded-full blur-[90px] sm:blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Hero Content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-7 space-y-5 sm:space-y-6 text-center lg:text-left"
          >
            {/* Announcement Top Pill */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center space-x-2 px-3 sm:px-4 py-1.5 rounded-full glass-panel border border-primary/30 text-[11px] sm:text-xs font-semibold text-accent shadow-neon max-w-full truncate"
            >
              <img
                src="/assets/rvscet-logo.webp"
                alt="RVSCET Logo"
                className="w-4 h-4 object-contain flex-shrink-0"
              />
              <span className="truncate">Flagship Tech Symposium &bull; RVSCET Jamshedpur</span>
            </motion.div>

            {/* Giant Title */}
            <div className="space-y-2">
              <motion.h1
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="text-3xl xs:text-4xl sm:text-6xl lg:text-7xl font-black font-orbitron tracking-tight"
              >
                <span className="gradient-text block">TechXpo 2.O</span>
                <span className="block text-2xl xs:text-3xl sm:text-5xl lg:text-6xl text-white mt-1 sm:mt-2">
                  2026
                </span>
              </motion.h1>

              {/* Tagline Bracket */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="inline-block"
              >
                <p className="text-sm xs:text-base sm:text-xl lg:text-2xl font-bold font-orbitron tracking-wider text-accent uppercase">
                  [ Think &bull; Inspire &bull; Innovate ]
                </p>
              </motion.div>
            </div>

            {/* Subtitle Description */}
            <p className="text-sm sm:text-base lg:text-lg text-gray-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Organized by{" "}
              <span className="text-primary font-bold">Circuitron</span> &mdash;
              The Premier IoT and Embedded System Club of RVS College of Engineering &amp; Technology, Jamshedpur.
            </p>

            {/* Event Key Details */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 sm:gap-4 text-xs sm:text-sm text-gray-300">
              <div className="flex items-center space-x-2 bg-darkNavy/80 px-3.5 py-2 rounded-xl border border-primary/20">
                <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="font-semibold text-white">30 November 2026</span>
              </div>
              <div className="flex items-center space-x-2 bg-darkNavy/80 px-3.5 py-2 rounded-xl border border-primary/20">
                <img
                  src="/assets/rvscet-logo.webp"
                  alt="RVSCET"
                  className="w-4 h-4 object-contain flex-shrink-0"
                />
                <span className="font-semibold text-white">RVSCET Campus, Jamshedpur</span>
              </div>
            </div>

            {/* Countdown Component */}
            <div className="pt-2">
              <CountdownTimer />
            </div>

            {/* Action CTA Buttons */}
            <div className="pt-3 sm:pt-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4">
              <motion.a
                href="https://forms.gle/mNU3damnJBMfnmSU7"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-primary w-full sm:w-auto text-sm py-3 px-6"
              >
                <span>Register for TechXpo 2.O</span>
                <ArrowRight className="w-4 h-4" />
              </motion.a>

              <motion.a
                href="https://drive.google.com/file/d/1AInB0u15DomA8HFDeoEd3eXsWX3ppwJe/view?usp=drivesdk"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-secondary w-full sm:w-auto text-sm py-3 px-6"
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
            className="lg:col-span-5 flex flex-col items-center justify-center mt-4 lg:mt-0"
          >
            <TechModel3D />

            {/* Highlights Chips Below 3D Model */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full max-w-sm mt-6 sm:mt-8">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                whileHover={{ y: -3, scale: 1.02 }}
                className="glass-card p-2.5 sm:p-3 rounded-xl text-center border border-primary/20 flex flex-col justify-between"
              >
                <div>
                  <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-400 mx-auto mb-1" />
                  <div className="text-[11px] sm:text-xs font-bold text-white font-orbitron">₹100K+</div>
                  <div className="text-[9px] sm:text-[10px] text-gray-400">Prize Pool</div>
                </div>
                {/* Micro Progress Bar */}
                <div className="w-full h-1 bg-darkNavy/80 rounded-full overflow-hidden mt-2 p-[0.5px] border border-yellow-400/20">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full"
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                whileHover={{ y: -3, scale: 1.02 }}
                className="glass-card p-2.5 sm:p-3 rounded-xl text-center border border-primary/20 flex flex-col justify-between"
              >
                <div>
                  <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary mx-auto mb-1" />
                  <div className="text-[11px] sm:text-xs font-bold text-white font-orbitron">3 Arenas</div>
                  <div className="text-[9px] sm:text-[10px] text-gray-400">Combat &amp; Race</div>
                </div>
                {/* Micro Progress Bar */}
                <div className="w-full h-1 bg-darkNavy/80 rounded-full overflow-hidden mt-2 p-[0.5px] border border-primary/20">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1, delay: 0.7, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                whileHover={{ y: -3, scale: 1.02 }}
                className="glass-card p-2.5 sm:p-3 rounded-xl text-center border border-primary/20 flex flex-col justify-between"
              >
                <div>
                  <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent mx-auto mb-1" />
                  <div className="text-[11px] sm:text-xs font-bold text-white font-orbitron">500+</div>
                  <div className="text-[9px] sm:text-[10px] text-gray-400">Innovators</div>
                </div>
                {/* Micro Progress Bar */}
                <div className="w-full h-1 bg-darkNavy/80 rounded-full overflow-hidden mt-2 p-[0.5px] border border-accent/20">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "85%" }}
                    transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-accent to-cyberPurple rounded-full"
                  />
                </div>
              </motion.div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
