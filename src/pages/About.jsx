import React from "react";
import { motion } from "framer-motion";
import { Lightbulb, Award, Users, CheckCircle, Sparkles, Target, Compass, Rocket } from "lucide-react";

export default function About() {
  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
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
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ORIGIN &amp; MISSION</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-black font-orbitron gradient-text">
            About TechXpo 2.O &amp; Circuitron
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded-full" />
          <p className="text-gray-300 max-w-2xl mx-auto text-base sm:text-lg">
            Discover the legacy behind the flagship technical symposium and the vision that empowers students to build next-generation hardware.
          </p>
        </div>
      </section>

      {/* Story of Circuitron */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Story Text */}
            <motion.div
              variants={itemVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="lg:col-span-7 space-y-6"
            >
              <div className="space-y-2">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                  <img
                    src="/assets/rvscet-logo.png"
                    alt="RVSCET"
                    className="w-4 h-4 object-contain flex-shrink-0"
                  />
                  <span className="text-accent text-xs font-mono tracking-wider uppercase font-semibold">
                    ESTABLISHED 2018 &bull; RVSCET JAMSHEDPUR
                  </span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-black font-orbitron text-white">
                  The Story of Circuitron
                </h2>
              </div>
              <div className="w-20 h-1 bg-gradient-to-r from-primary to-accent rounded-full" />
              
              <div className="space-y-4 text-gray-300 leading-relaxed text-sm sm:text-base">
                <p>
                  Founded in 2018, Circuitron has spearheaded embedded systems and IoT innovation at RVS College of Engineering &amp; Technology, Jamshedpur. What originated as a determined group of electronics and robotics enthusiasts has evolved into one of the most proactive technical societies in the region.
                </p>
                <p>
                  Our journey was sparked by a clear objective: bridging the divide between classroom theoretical concepts and applied engineering reality. Over the seasons, we have orchestrated high-impact hands-on bootcamps, competitive hackathons, and state-level robotics challenges.
                </p>
                <p>
                  Today, TechXpo 2.O stands as our premier annual showcase &mdash; a vibrant stage where passionate engineers demonstrate autonomous machines, smart systems, and groundbreaking projects.
                </p>
              </div>
            </motion.div>

            {/* Core Values Cards */}
            <motion.div
              variants={itemVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="lg:col-span-5 space-y-4"
            >
              <div className="glass-card p-6 rounded-2xl border border-primary/20 flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary flex-shrink-0">
                  <Lightbulb className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-orbitron text-white">Innovation First</h3>
                  <p className="text-gray-400 text-xs mt-0.5">Pioneering applied IoT, sensor networks, and autonomous algorithms.</p>
                </div>
              </div>

              <div className="glass-card p-6 rounded-2xl border border-primary/20 flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-accent/20 border border-accent/40 flex items-center justify-center text-accent flex-shrink-0">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-orbitron text-white">Engineering Rigor</h3>
                  <p className="text-gray-400 text-xs mt-0.5">Striving for real-world robustness, precision fabrication, and safety.</p>
                </div>
              </div>

              <div className="glass-card p-6 rounded-2xl border border-primary/20 flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-cyberPurple/20 border border-cyberPurple/40 flex items-center justify-center text-cyberPurple flex-shrink-0">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-orbitron text-white">Vibrant Community</h3>
                  <p className="text-gray-400 text-xs mt-0.5">Creating lasting networks between students, faculty mentors, and alumni.</p>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Vision Pillars */}
      <section className="py-20 relative overflow-hidden bg-gradient-to-b from-transparent via-primary/5 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl sm:text-5xl font-black font-orbitron gradient-text">
              Our Vision Pillars
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
              whileHover={{ y: -4 }}
              className="glass-card p-6 sm:p-8 rounded-2xl border border-primary/25 text-center space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary mx-auto shadow-neon">
                  <Rocket className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold font-orbitron text-white">Empower</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Provide young engineers with high-tier laboratory access, prototyping modules, microcontrollers, and mentorship.
                </p>
              </div>

              {/* Progress metric */}
              <div className="pt-3 border-t border-primary/15 space-y-1">
                <div className="flex justify-between text-[10px] font-mono text-gray-400">
                  <span>Lab Prototyping Access</span>
                  <span className="text-primary font-bold">100% Equipped</span>
                </div>
                <div className="w-full h-1 bg-darkNavy/80 rounded-full overflow-hidden p-[0.5px] border border-primary/20">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: "100%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.1, delay: 0.3 }}
                    className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                  />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
              whileHover={{ y: -4 }}
              className="glass-card p-6 sm:p-8 rounded-2xl border border-accent/25 text-center space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-accent/20 border border-accent/40 flex items-center justify-center text-accent mx-auto shadow-neon">
                  <Target className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold font-orbitron text-white">Innovate</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Instill a problem-solving mindset tackling actual challenges in industrial automation, smart agriculture, and green tech.
                </p>
              </div>

              {/* Progress metric */}
              <div className="pt-3 border-t border-accent/15 space-y-1">
                <div className="flex justify-between text-[10px] font-mono text-gray-400">
                  <span>Applied Project Success</span>
                  <span className="text-accent font-bold">95% Verified</span>
                </div>
                <div className="w-full h-1 bg-darkNavy/80 rounded-full overflow-hidden p-[0.5px] border border-accent/20">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: "95%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.1, delay: 0.4 }}
                    className="h-full bg-gradient-to-r from-accent to-yellow-400 rounded-full"
                  />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              whileHover={{ y: -4 }}
              className="glass-card p-6 sm:p-8 rounded-2xl border border-cyberPurple/25 text-center space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-cyberPurple/20 border border-cyberPurple/40 flex items-center justify-center text-cyberPurple mx-auto shadow-neon">
                  <Compass className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold font-orbitron text-white">Connect</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Foster cross-departmental collaboration uniting Electrical, Electronics, Computer Science, and Mechanical innovators.
                </p>
              </div>

              {/* Progress metric */}
              <div className="pt-3 border-t border-cyberPurple/15 space-y-1">
                <div className="flex justify-between text-[10px] font-mono text-gray-400">
                  <span>Cross-Branch Synergy</span>
                  <span className="text-cyberPurple font-bold">100% Unified</span>
                </div>
                <div className="w-full h-1 bg-darkNavy/80 rounded-full overflow-hidden p-[0.5px] border border-cyberPurple/20">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: "100%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.1, delay: 0.5 }}
                    className="h-full bg-gradient-to-r from-cyberPurple to-primary rounded-full"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why TechXpo 2.O Matters */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl sm:text-5xl font-black font-orbitron gradient-text">
              Why TechXpo 2.O Matters
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* For Students */}
            <div className="glass-panel p-8 sm:p-10 rounded-2xl border border-primary/30 space-y-6">
              <h3 className="text-2xl font-bold font-orbitron text-white flex items-center space-x-2">
                <span className="text-primary">&gt;</span>
                <span>For Students &amp; Creators</span>
              </h3>
              <ul className="space-y-4 text-sm text-gray-300">
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <span>Hands-on arena combat experience against leading regional teams.</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <span>Direct evaluations and technical feedback from experienced university faculty.</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <span>Substantial cash prize pool, merit certificates, and portfolio recognition.</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <span>Practical exposure to sensor telemetry, motor drivers, and microcontroller debugging.</span>
                </li>
              </ul>
            </div>

            {/* For Industry */}
            <div className="glass-panel p-8 sm:p-10 rounded-2xl border border-cyberPurple/30 space-y-6">
              <h3 className="text-2xl font-bold font-orbitron text-white flex items-center space-x-2">
                <span className="text-cyberPurple">&gt;</span>
                <span>For Industry &amp; Mentors</span>
              </h3>
              <ul className="space-y-4 text-sm text-gray-300">
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-cyberPurple flex-shrink-0 mt-0.5" />
                  <span>Direct talent scouting of top-performing hardware and software engineers.</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-cyberPurple flex-shrink-0 mt-0.5" />
                  <span>Demonstrating new tech, embedded boards, and development toolchains.</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-cyberPurple flex-shrink-0 mt-0.5" />
                  <span>Collaborating on student capstone and research-grade engineering projects.</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-cyberPurple flex-shrink-0 mt-0.5" />
                  <span>Bridging regional academic potential with corporate engineering needs.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
