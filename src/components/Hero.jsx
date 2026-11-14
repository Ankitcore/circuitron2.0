import React from "react";
import { motion } from "framer-motion";
import { Calendar, MapPin, Download, ArrowRight, Sparkles, Trophy, Users, Bot, ExternalLink } from "lucide-react";
import TechModel3D from "./TechModel3D";
import CountdownTimer from "./CountdownTimer";
import CyberProgressBar from "./CyberProgressBar";
import AnimatedCounter from "./AnimatedCounter";
import { buttonHoverProps, cardHoverProps, smoothEase, gentleEase } from "../utils/motion";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 pb-12 sm:pt-28 sm:pb-16 lg:pt-32 lg:pb-24">
      {/* Background radial glow spots: Zero blur multi-pass overhead */}
      <div className="absolute inset-0 pointer-events-none circuit-bg opacity-30" />
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[350px] sm:w-[550px] h-[350px] sm:h-[550px] rounded-full pointer-events-none opacity-40"
        style={{
          background: "radial-gradient(circle, rgba(0, 191, 255, 0.16) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute bottom-10 right-10 w-[250px] sm:w-[380px] h-[250px] sm:h-[380px] rounded-full pointer-events-none opacity-35"
        style={{
          background: "radial-gradient(circle, rgba(139, 92, 246, 0.16) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Hero Content */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: gentleEase }}
            className="lg:col-span-7 space-y-5 sm:space-y-6 text-center lg:text-left"
          >
            {/* Announcement Top Pill */}
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: gentleEase }}
              className="inline-flex items-center space-x-2 px-3 sm:px-4 py-1.5 rounded-full glass-panel border border-primary/30 text-[11px] sm:text-xs font-semibold text-accent shadow-neon max-w-full truncate"
            >
              <img
                src="/assets/rvscet-logo.webp"
                alt="RVSCET Logo"
                className="w-4 h-4 object-contain flex-shrink-0"
              />
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
              <span className="truncate">Flagship Tech Symposium &bull; RVSCET Jamshedpur</span>
            </motion.div>

            {/* Giant Title */}
            <div className="space-y-2">
              <motion.h1
                initial={{ opacity: 0, scale: 0.97, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2, ease: gentleEase }}
                className="text-3xl xs:text-4xl sm:text-6xl lg:text-7xl font-black font-orbitron tracking-tight"
              >
                <span className="gradient-text block">TechXpo 2.O</span>
                <span className="block text-2xl xs:text-3xl sm:text-5xl lg:text-6xl text-white mt-1 sm:mt-2">
                  2026
                </span>
              </motion.h1>

              {/* Tagline Bracket */}
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.32, ease: gentleEase }}
                className="inline-block"
              >
                <p className="text-sm xs:text-base sm:text-xl lg:text-2xl font-bold font-orbitron tracking-wider text-accent uppercase">
                  [ Think &bull; Inspire &bull; Innovate ]
                </p>
              </motion.div>
            </div>

            {/* Subtitle Description */}
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.42, ease: gentleEase }}
              className="text-sm sm:text-base lg:text-lg text-gray-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed"
            >
              Organized by{" "}
              <span className="text-primary font-bold">Circuitron</span> &mdash;
              The Premier IoT and Embedded System Club of RVS College of Engineering &amp; Technology, Jamshedpur.
            </motion.p>

            {/* Event Key Details */}
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5, ease: gentleEase }}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 sm:gap-4 text-xs sm:text-sm text-gray-300"
            >
              <div className="flex items-center space-x-2 bg-darkNavy/80 px-3.5 py-2 rounded-xl border border-primary/20">
                <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="font-semibold text-white">30 November 2026</span>
              </div>
              <a
                href="https://www.google.com/maps/place/RVS+College+of+Engineering+and+Technology/@22.8053067,86.2738051,764m/data=!3m2!1e3!4b1!4m6!3m5!1s0x39f5e30ff76d3319:0x4986ace5ea086802!8m2!3d22.8053067!4d86.2738051!16s%2Fg%2F11b6gcq2xv?entry=ttu&g_ep=EgoyMDI2MTExMC4wIKXMDSoASAFQAw%3D%3D"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 bg-darkNavy/80 hover:bg-darkNavy px-3.5 py-2 rounded-xl border border-primary/20 hover:border-primary/50 transition-all group"
                title="Open RVSCET Campus on Google Maps"
              >
                <img
                  src="/assets/rvscet-logo.webp"
                  alt="RVSCET"
                  className="w-4 h-4 object-contain flex-shrink-0 group-hover:scale-110 transition-transform"
                />
                <span className="font-semibold text-white group-hover:text-accent transition-colors">RVSCET Campus, Jamshedpur</span>
              </a>
            </motion.div>

            {/* Countdown Component */}
            <div className="pt-2">
              <CountdownTimer />
            </div>

            {/* Action CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.6, ease: gentleEase }}
              className="pt-3 sm:pt-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4"
            >
              <motion.a
                href="https://forms.gle/mNU3damnJBMfnmSU7"
                target="_blank"
                rel="noopener noreferrer"
                {...buttonHoverProps}
                className="btn-primary w-full sm:w-auto text-sm py-3 px-6"
              >
                <span>Register for TechXpo 2.O</span>
                <ArrowRight className="w-4 h-4" />
              </motion.a>

              <motion.a
                href="https://drive.google.com/file/d/1BnXjrzGn_Y86PqJAFMarpxXRjEKq6CjT/view?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
                {...buttonHoverProps}
                className="btn-secondary w-full sm:w-auto text-sm py-3 px-6"
              >
                <Download className="w-4 h-4" />
                <span>Official Brochure</span>
                <ExternalLink className="w-3.5 h-3.5 ml-1 opacity-80" />
              </motion.a>
            </motion.div>
          </motion.div>

          {/* Right Column: 3D Tech Model Rig */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.85, delay: 0.25, ease: gentleEase }}
            className="lg:col-span-5 flex flex-col items-center justify-center mt-4 lg:mt-0"
          >
            <TechModel3D />

            {/* Highlights Chips Below 3D Model */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full max-w-sm mt-6 sm:mt-8">
              <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.38, ease: gentleEase }}
                {...cardHoverProps}
                className="glass-card p-2.5 sm:p-3 rounded-xl text-center border border-primary/20 flex flex-col justify-between"
              >
                <div>
                  <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-400 mx-auto mb-1" />
                  <div className="text-[11px] sm:text-xs font-bold text-white font-orbitron">
                    <AnimatedCounter prefix="₹" to={100} suffix="K+" duration={1.2} delay={0.4} />
                  </div>
                  <div className="text-[9px] sm:text-[10px] text-gray-400">Prize Pool</div>
                </div>
                {/* Micro Progress Bar */}
                <CyberProgressBar
                  value={100}
                  gradient="from-amber-500 to-yellow-400"
                  height="h-1"
                  borderColor="border-yellow-400/25"
                  delay={0.5}
                  duration={1.0}
                  inView={false}
                  showShimmer={true}
                  className="mt-2"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.48, ease: gentleEase }}
                {...cardHoverProps}
                className="glass-card p-2.5 sm:p-3 rounded-xl text-center border border-primary/20 flex flex-col justify-between"
              >
                <div>
                  <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary mx-auto mb-1" />
                  <div className="text-[11px] sm:text-xs font-bold text-white font-orbitron">
                    <AnimatedCounter to={3} suffix=" Arenas" duration={1.0} delay={0.5} />
                  </div>
                  <div className="text-[9px] sm:text-[10px] text-gray-400">Combat &amp; Race</div>
                </div>
                {/* Micro Progress Bar */}
                <CyberProgressBar
                  value={100}
                  gradient="from-primary to-accent"
                  height="h-1"
                  borderColor="border-primary/25"
                  delay={0.6}
                  duration={1.0}
                  inView={false}
                  showShimmer={true}
                  className="mt-2"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.58, ease: gentleEase }}
                {...cardHoverProps}
                className="glass-card p-2.5 sm:p-3 rounded-xl text-center border border-primary/20 flex flex-col justify-between"
              >
                <div>
                  <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent mx-auto mb-1" />
                  <div className="text-[11px] sm:text-xs font-bold text-white font-orbitron">
                    <AnimatedCounter to={500} suffix="+" duration={1.2} delay={0.6} />
                  </div>
                  <div className="text-[9px] sm:text-[10px] text-gray-400">Innovators</div>
                </div>
                {/* Micro Progress Bar */}
                <CyberProgressBar
                  value={85}
                  gradient="from-accent to-cyberPurple"
                  height="h-1"
                  borderColor="border-accent/25"
                  delay={0.7}
                  duration={1.0}
                  inView={false}
                  showShimmer={true}
                  className="mt-2"
                />
              </motion.div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
