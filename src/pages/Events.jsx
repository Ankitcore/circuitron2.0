import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CyberProgressBar from "../components/CyberProgressBar";
import AnimatedCounter from "../components/AnimatedCounter";
import { cardHoverProps, buttonHoverProps, smoothEase, viewportConfig } from "../utils/motion";
import {
  events,
  exhibitionGroups,
  prizePoolDistribution,
  rulesAndGuidelines,
} from "../data/events";
import {
  Bot,
  Cpu,
  Sparkles,
  ExternalLink,
  X,
  ShieldCheck,
  Trophy,
  MapPin,
  Calendar,
  Layers,
  Download,
  Users,
  GraduationCap,
  Award,
  Gift,
  Wrench,
  CheckCircle2,
  FileText,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";

export default function Events() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

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
      {/* ================= HERO HEADER ================= */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 circuit-bg opacity-30" />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[380px] rounded-full pointer-events-none opacity-30"
          style={{
            background: "radial-gradient(ellipse at center, rgba(0, 191, 255, 0.18) 0%, transparent 70%)",
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-xs font-semibold text-accent">
            <Sparkles className="w-3.5 h-3.5" />
            <span>THREE ARENAS &bull; ONE DAY</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-4xl sm:text-6xl font-black font-orbitron gradient-text">
              Competitions &amp; Events
            </h1>
            <p className="text-accent font-orbitron font-bold text-sm sm:text-lg tracking-wider uppercase">
              30 November 2026 &bull; RVSCET Campus, Jamshedpur
            </p>
          </div>

          <div className="w-24 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded-full" />

          <p className="text-gray-300 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
            A one-day technology exhibition and multi-track championship for school, diploma, and undergraduate innovators across India.
          </p>

          {/* Key Stat Pills */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs font-mono">
            <div className="bg-darkNavy/80 border border-primary/30 px-4 py-2 rounded-xl text-accent font-bold shadow-neon">
              🏆 ₹1,00,000 GRAND PRIZE POOL
            </div>
            <div className="bg-darkNavy/80 border border-emerald-500/30 px-4 py-2 rounded-xl text-emerald-400 font-bold">
              ⚡ 100% FREE REGISTRATION
            </div>
            <div className="bg-darkNavy/80 border border-cyan-500/30 px-4 py-2 rounded-xl text-cyan-300 font-bold">
              🎯 3 EXHIBITION GROUPS
            </div>
          </div>

          {/* Action CTAs: Brochure, Consent Form & Registration */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <a
              href="https://drive.google.com/file/d/1BnXjrzGn_Y86PqJAFMarpxXRjEKq6CjT/view?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary py-3 px-6 text-xs sm:text-sm font-bold flex items-center space-x-2 shadow-neon"
            >
              <FileText className="w-4 h-4" />
              <span>Official Brochure (Drive / PDF)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <a
              href="https://drive.google.com/file/d/1JFCu9FgjKEwbq1IvaDAJ1vKGnCU7nd3I/view?usp=drive_link"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary py-3 px-6 text-xs sm:text-sm font-bold flex items-center space-x-2 border-emerald-500/40 text-emerald-300 hover:text-white hover:bg-emerald-500/20 shadow-sm"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Consent Form</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <a
              href="https://forms.gle/mNU3damnJBMfnmSU7"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary py-3 px-6 text-xs sm:text-sm font-bold flex items-center space-x-2"
            >
              <span>Register for Exhibition</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <a
              href="https://forms.gle/EGqdueaPzzKsWuuBA"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary py-3 px-6 text-xs sm:text-sm font-bold flex items-center space-x-2"
            >
              <span>Register for Robotics</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>

      {/* ================= SECTION: WHO CAN PARTICIPATE (THREE GROUPS) ================= */}
      <section className="py-16 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-semibold text-cyan-400 font-mono uppercase tracking-wider">
              <Users className="w-3.5 h-3.5" />
              <span>ELIGIBILITY &amp; TRACKS</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black font-orbitron text-white">
              Who Can Participate
            </h2>
            <p className="text-accent font-orbitron font-semibold text-base sm:text-xl">
              The exhibition runs in three groups
            </p>
            <div className="w-16 h-1 bg-gradient-to-r from-cyan-400 to-primary mx-auto rounded-full" />
          </div>

          {/* Three Groups Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {exhibitionGroups.map((grp) => (
              <motion.div
                key={grp.id}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={viewportConfig}
                transition={{ duration: 0.6, delay: grp.id * 0.12, ease: smoothEase }}
                {...cardHoverProps}
                className={`glass-card rounded-3xl p-7 sm:p-8 border-2 ${grp.borderColor} flex flex-col justify-between relative overflow-hidden shadow-xl bg-gradient-to-b ${grp.bgGradient}`}
              >
                {/* Background Watermark */}
                <div className="absolute -top-10 -right-10 w-36 h-36 bg-white/5 rounded-full blur-2xl pointer-events-none" />

                <div className="space-y-6 relative z-10">
                  {/* Group Header Badge */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold tracking-widest text-gray-400 uppercase">
                      {grp.group}
                    </span>
                    <span className={`text-[11px] font-mono font-bold px-3 py-1 rounded-full border ${grp.btnColor}`}>
                      {grp.badge}
                    </span>
                  </div>

                  {/* Group Name & Target Audience */}
                  <div>
                    <h3 className="text-3xl font-black font-orbitron text-white">
                      {grp.name}
                    </h3>
                    <div className="mt-2 inline-flex items-center space-x-2 px-3 py-1 rounded-lg bg-darkNavy/80 border border-white/10 text-xs font-semibold text-white">
                      <GraduationCap className="w-4 h-4 text-accent" />
                      <span>{grp.audience}</span>
                    </div>
                  </div>

                  {/* Exhibition Topic */}
                  <div className="p-4 rounded-2xl bg-darkNavy/60 border border-white/10 space-y-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-accent font-bold block">
                      EXHIBITION TOPIC
                    </span>
                    <p className="text-gray-200 text-sm leading-relaxed font-medium">
                      {grp.topic}
                    </p>
                  </div>

                  {/* Cash Prizes for This Group */}
                  <div className="space-y-2 pt-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-gray-400 font-bold block">
                      CATEGORY CASH PRIZES (POOL {grp.totalPool})
                    </span>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="p-2.5 rounded-xl bg-white/5 border border-amber-500/30">
                        <span className="text-[10px] font-mono text-amber-400 block font-bold">1ST PRIZE</span>
                        <span className="text-sm font-bold text-white font-orbitron">{grp.firstPrize}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white/5 border border-gray-400/30">
                        <span className="text-[10px] font-mono text-gray-300 block font-bold">2ND PRIZE</span>
                        <span className="text-sm font-bold text-white font-orbitron">{grp.secondPrize}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white/5 border border-amber-700/30">
                        <span className="text-[10px] font-mono text-amber-600 block font-bold">3RD PRIZE</span>
                        <span className="text-sm font-bold text-white font-orbitron">{grp.thirdPrize}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Direct Register Link for this group */}
                <div className="pt-6 mt-6 border-t border-white/10 relative z-10">
                  <a
                    href="https://forms.gle/mNU3damnJBMfnmSU7"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full btn-primary py-2.5 text-xs font-bold text-center flex items-center justify-center space-x-2"
                  >
                    <span>Register in {grp.name}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Team Composition Callout Banner */}
          <div className="glass-card p-5 sm:p-6 rounded-2xl border border-primary/30 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-primary/10 via-darkNavy to-accent/10">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center text-accent flex-shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div className="space-y-1 text-center sm:text-left">
                <h4 className="text-base font-bold font-orbitron text-white">
                  Team Composition Rule
                </h4>
                <p className="text-gray-300 text-xs sm:text-sm">
                  Teams of <strong>2 to 4 members</strong>. Inter-college and inter-school teams are welcome. Solo entries are not allowed.
                </p>
              </div>
            </div>

            <div className="flex-shrink-0">
              <span className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold uppercase tracking-wider">
                Free Registration
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* ================= SECTION: GRAND PRIZE POOL (₹1,00,000) ================= */}
      <section className="py-16 relative overflow-hidden bg-darkNavy/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center space-y-3">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-xs font-semibold text-amber-400 font-mono uppercase tracking-wider">
              <Trophy className="w-3.5 h-3.5" />
              <span>REWARDS &amp; HONORS</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black font-orbitron text-white">
              Grand Prize Pool
            </h2>
            <div className="inline-block px-6 py-2 rounded-2xl bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 border border-accent/40 shadow-neon">
              <span className="text-3xl sm:text-5xl font-black font-orbitron text-accent tracking-wider">
                <AnimatedCounter prefix="₹" to={100000} duration={1.6} delay={0.2} />
              </span>
            </div>
            <p className="text-gray-300 max-w-xl mx-auto text-sm sm:text-base">
              Cash prizes, prestigious championship trophies, and official participation certificates.
            </p>
          </div>

          {/* Prize Breakdown Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Project Exhibition Prize Distribution (7 cols) */}
            <div className="lg:col-span-7 glass-card p-6 sm:p-8 rounded-3xl border border-primary/30 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center text-accent">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-orbitron font-bold text-lg text-white">
                      Project Exhibition Distribution
                    </h3>
                    <p className="text-xs text-gray-400 font-mono">
                      Total Allocated Pool: <strong className="text-accent">₹54,000</strong>
                    </p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary">
                  3 Groups
                </span>
              </div>

              {/* Groups Distribution List */}
              <div className="space-y-4">
                {prizePoolDistribution.projectExhibition.groups.map((grp) => (
                  <div
                    key={grp.name}
                    className="p-4 rounded-2xl bg-darkNavy/80 border border-white/10 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-orbitron font-bold text-sm text-white">
                        {grp.name}
                      </span>
                      <span className="text-[11px] font-mono text-emerald-400 font-semibold">
                        Cash Award
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {grp.prizes.map((p, idx) => (
                        <div
                          key={p.rank}
                          className={`p-2.5 rounded-xl border text-center ${
                            idx === 0
                              ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
                              : idx === 1
                              ? "bg-gray-400/10 border-gray-400/30 text-gray-200"
                              : "bg-amber-700/10 border-amber-700/30 text-amber-500"
                          }`}
                        >
                          <span className="text-[10px] font-mono font-bold block">
                            {p.rank} Prize
                          </span>
                          <span className="text-base font-orbitron font-black text-white">
                            {p.amount}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Robotics Arenas Prize Distribution (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              {prizePoolDistribution.robotics.map((robo) => (
                <div
                  key={robo.name}
                  className="glass-card p-6 sm:p-7 rounded-3xl border border-emerald-500/30 space-y-5"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                        <Bot className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-orbitron font-bold text-lg text-white">
                          {robo.name} Championship
                        </h3>
                        <p className="text-xs text-gray-400 font-mono">
                          Arena Pool: <strong className="text-emerald-400">{robo.pool}</strong>
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                      Cash + Trophy
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {robo.prizes.map((p, idx) => (
                      <div
                        key={p.rank}
                        className={`p-2.5 rounded-xl border text-center ${
                          idx === 0
                            ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-300"
                            : idx === 1
                            ? "bg-white/5 border-white/20 text-gray-200"
                            : "bg-white/5 border-white/10 text-gray-400"
                        }`}
                      >
                        <span className="text-[10px] font-mono font-bold block">
                          {p.rank}
                        </span>
                        <span className="text-base font-orbitron font-black text-white">
                          {p.amount}
                        </span>
                        <span className="text-[9px] font-mono text-gray-400 block mt-0.5">
                          + Trophy
                        </span>
                      </div>
                    ))}
                  </div>

                  <a
                    href="https://forms.gle/EGqdueaPzzKsWuuBA"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full btn-secondary py-2 text-xs font-bold text-center flex items-center justify-center space-x-1.5"
                  >
                    <span>Register for {robo.name}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              ))}
            </div>

          </div>

          {/* Perks for Every Participant */}
          <div className="glass-card p-6 sm:p-8 rounded-3xl border border-primary/20 space-y-6">
            <div className="text-center space-y-2">
              <h3 className="font-orbitron font-black text-xl sm:text-2xl text-white">
                Every Participant Gets
              </h3>
              <p className="text-gray-400 text-xs sm:text-sm">
                Participation certificates awarded for all valid registered teams at RVSCET Jamshedpur.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {prizePoolDistribution.participantPerks.map((perk, idx) => (
                <div
                  key={perk.title}
                  className="p-5 rounded-2xl bg-darkNavy/70 border border-white/10 flex flex-col items-center text-center space-y-2 group hover:border-primary/40 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
                    {idx === 0 ? (
                      <Award className="w-5 h-5" />
                    ) : idx === 1 ? (
                      <Gift className="w-5 h-5" />
                    ) : idx === 2 ? (
                      <Wrench className="w-5 h-5" />
                    ) : (
                      <Users className="w-5 h-5" />
                    )}
                  </div>
                  <h4 className="font-orbitron font-bold text-sm text-white">
                    {perk.title}
                  </h4>
                  <p className="text-gray-400 text-xs leading-relaxed">
                    {perk.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ================= SECTION: COMPETITIONS BENTO GRID ================= */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="text-center space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary font-mono uppercase">
              <Bot className="w-3.5 h-3.5" />
              <span>THE THREE ARENAS</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black font-orbitron text-white">
              Official Arenas &amp; Rules
            </h2>
            <div className="w-16 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded-full" />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center overflow-x-auto no-scrollbar gap-2 sm:gap-3 sm:justify-center py-2 px-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 sm:px-5 py-2 rounded-full text-xs font-semibold transition-all duration-200 border whitespace-nowrap flex-shrink-0 ${
                  activeCategory === cat
                    ? "bg-gradient-to-r from-primary to-accent text-darkNavy font-bold border-transparent shadow-neon"
                    : "glass-card text-gray-300 hover:text-white border-primary/20 hover:border-primary/40"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Events Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event, index) => (
              <motion.div
                key={event.id}
                onClick={() => setSelectedEvent(event)}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={viewportConfig}
                transition={{
                  duration: 0.55,
                  delay: (index % 6) * 0.07,
                  ease: smoothEase,
                }}
                {...cardHoverProps}
                className="glass-card rounded-3xl p-7 border border-primary/20 flex flex-col justify-between cursor-pointer group hover:border-accent/50 relative overflow-hidden shadow-xl"
              >
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="w-14 h-14 rounded-2xl bg-darkNavy/80 border border-primary/30 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                      {getEventIcon(event.id)}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] font-mono text-gray-400 font-bold">
                        ARENA {event.arenaNumber || `0${event.id}`}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getBadgeStyle(event.category)}`}>
                        {event.category}
                      </span>
                    </div>
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

                  {/* Prize Tag */}
                  {event.prizePool && (
                    <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-between text-xs font-mono">
                      <span className="text-gray-400 font-bold">PRIZE POOL:</span>
                      <span className="text-accent font-black text-sm font-orbitron">
                        {event.prizePool}
                      </span>
                    </div>
                  )}

                  {event.requirements && (
                    <div className="flex items-center space-x-2 text-xs text-gray-400 bg-darkNavy/60 px-3.5 py-2.5 rounded-xl border border-white/5">
                      <ShieldCheck className="w-4 h-4 text-primary flex-shrink-0" />
                      <span>{event.requirements}</span>
                    </div>
                  )}

                  {/* Quota Progress Bar */}
                  <div className="pt-2 space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-mono text-gray-400">
                      <span>REGISTRATION QUOTA</span>
                      <span className="text-accent font-semibold">
                        <AnimatedCounter from={0} to={event.id === 1 ? 80 : event.id === 2 ? 90 : 75} suffix="% Filled" duration={1.1} delay={0.12 + (index % 3) * 0.08} />
                      </span>
                    </div>
                    <CyberProgressBar
                      value={event.id === 1 ? 80 : event.id === 2 ? 90 : 75}
                      gradient="from-primary via-accent to-cyberPurple"
                      height="h-1"
                      borderColor="border-primary/25"
                      delay={0.12 + (index % 3) * 0.08}
                      duration={1.1}
                      inView={true}
                      showShimmer={true}
                    />
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-white/10 flex items-center space-x-3">
                  {event.registrationLink ? (
                    <a
                      href={event.registrationLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 btn-primary py-2.5 text-xs font-bold text-center flex items-center justify-center space-x-1.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span>Register Now</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : null}
                  <button
                    onClick={() => setSelectedEvent(event)}
                    className="flex-1 btn-secondary py-2.5 text-xs font-bold"
                  >
                    View Details
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* ================= SECTION: BEFORE YOU REGISTER (GUIDELINES & RULES) ================= */}
      <section className="py-16 bg-darkNavy/60 border-t border-primary/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-semibold text-amber-400 font-mono uppercase">
              <FileText className="w-3.5 h-3.5" />
              <span>OFFICIAL RULEBOOK</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black font-orbitron text-white">
              Before You Register
            </h2>
            <p className="text-gray-300 max-w-xl mx-auto text-sm sm:text-base">
              Essential guidelines, participation prerequisites, and checklist for the symposium day.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Team Rules */}
            <div className="glass-card p-6 sm:p-7 rounded-3xl border border-primary/25 space-y-4">
              <div className="flex items-center space-x-3 pb-3 border-b border-white/10">
                <Users className="w-5 h-5 text-accent" />
                <h3 className="font-orbitron font-bold text-lg text-white">
                  Your Team
                </h3>
              </div>
              <ul className="space-y-3">
                {rulesAndGuidelines.teamRules.map((r) => (
                  <li key={r.num} className="flex items-start space-x-3 text-xs text-gray-300">
                    <span className="font-mono font-bold text-accent px-1.5 py-0.5 rounded bg-accent/10 border border-accent/20">
                      {r.num}
                    </span>
                    <span className="leading-relaxed">{r.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Bring on the Day */}
            <div className="glass-card p-6 sm:p-7 rounded-3xl border border-primary/25 space-y-4">
              <div className="flex items-center space-x-3 pb-3 border-b border-white/10">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <h3 className="font-orbitron font-bold text-lg text-white">
                  Bring on the Day
                </h3>
              </div>
              <ul className="space-y-3">
                {rulesAndGuidelines.bringOnDay.map((b) => (
                  <li key={b.title} className="p-3.5 rounded-xl bg-darkNavy/80 border border-white/5 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white font-mono uppercase text-emerald-400">
                        {b.title}
                      </h4>
                      {b.link && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold">
                          Required Template
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      {b.desc}
                    </p>
                    {b.link && (
                      <div className="pt-1.5 flex flex-wrap items-center gap-2">
                        <a
                          href={b.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:text-white hover:bg-emerald-500/30 text-xs font-mono font-bold transition-all shadow-sm group"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>{b.linkText || "Download Consent Form (PDF)"}</span>
                          <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                        </a>
                        {b.localPdf && (
                          <a
                            href={b.localPdf}
                            download="TechXpo_2.0_Institutional_Consent_Form.pdf"
                            className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-darkNavy border border-white/10 text-gray-400 hover:text-white text-[11px] font-mono transition-all"
                            title="Direct File Download"
                          >
                            <Download className="w-3 h-3" />
                            <span>Direct Download</span>
                          </a>
                        )}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Fair Play & Ethics */}
            <div className="glass-card p-6 sm:p-7 rounded-3xl border border-primary/25 space-y-4">
              <div className="flex items-center space-x-3 pb-3 border-b border-white/10">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <h3 className="font-orbitron font-bold text-lg text-white">
                  Fair Play Policy
                </h3>
              </div>
              <ul className="space-y-2.5 text-xs text-gray-300">
                {rulesAndGuidelines.fairPlay.map((f, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <span className="text-amber-400 font-bold">&bull;</span>
                    <span className="leading-relaxed">{f}</span>
                  </li>
                ))}
              </ul>
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] font-mono text-amber-300 flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 text-amber-400" />
                <span>Judges' and coordinators' decisions are final and binding.</span>
              </div>
            </div>

          </div>

          {/* Brochure Download Banner */}
          <div className="glass-card p-8 rounded-3xl border-2 border-primary/30 flex flex-col sm:flex-row items-center justify-between gap-6 bg-gradient-to-r from-primary/15 via-darkNavy to-accent/15">
            <div className="space-y-2 text-center sm:text-left">
              <span className="text-xs font-mono text-accent font-bold uppercase tracking-wider block">
                COMPLETE 8-PAGE OFFICIAL DOCUMENT
              </span>
              <h3 className="text-2xl sm:text-3xl font-black font-orbitron text-white">
                Download the TechXpo 2.O Official Brochure
              </h3>
              <p className="text-gray-300 text-xs sm:text-sm max-w-2xl">
                Contains the full schedule, arena dimensions, technical robot constraints, jury criteria, faculty contacts, and institutional consent templates.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <a
                href="https://drive.google.com/file/d/1BnXjrzGn_Y86PqJAFMarpxXRjEKq6CjT/view?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary py-3.5 px-6 text-xs sm:text-sm font-bold whitespace-nowrap flex items-center justify-center space-x-2 shadow-neon"
              >
                <FileText className="w-4 h-4" />
                <span>Open in Google Drive</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <a
                href="/assets/techxpo-2.0-brochure.pdf"
                download="TechXpo_2.0_Official_Brochure.pdf"
                className="btn-secondary py-3.5 px-6 text-xs sm:text-sm font-bold whitespace-nowrap flex items-center justify-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF (4.9 MB)</span>
              </a>
            </div>
          </div>

        </div>
      </section>

      {/* ================= MODAL LIGHTBOX ================= */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-darkNavy/90 backdrop-blur-xl z-50 flex items-center justify-center p-3 sm:p-4"
            onClick={() => setSelectedEvent(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-panel p-5 sm:p-10 rounded-2xl sm:rounded-3xl max-w-2xl w-full border border-primary/30 shadow-2xl relative max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedEvent(null)}
                className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-5 sm:space-y-6">
                <div className="space-y-2 pr-8">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getBadgeStyle(selectedEvent.category)}`}>
                    {selectedEvent.category}
                  </span>
                  <h2 className="text-2xl sm:text-4xl font-black font-orbitron text-white mt-1">
                    {selectedEvent.title}
                  </h2>
                  <p className="text-accent font-semibold text-sm sm:text-base">
                    {selectedEvent.tagline}
                  </p>
                </div>

                <div className="space-y-2 sm:space-y-3">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-gray-400">
                    Event Overview
                  </h4>
                  <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
                    {selectedEvent.description}
                  </p>
                </div>

                {selectedEvent.prizeDetails && (
                  <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 space-y-1">
                    <span className="text-[11px] font-mono text-accent font-bold uppercase block">
                      Prize Distribution
                    </span>
                    <p className="text-white text-xs sm:text-sm font-semibold">
                      {selectedEvent.prizeDetails}
                    </p>
                  </div>
                )}

                {selectedEvent.requirements && (
                  <div className="space-y-2 bg-darkNavy/80 p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-primary/20">
                    <h4 className="text-xs font-mono uppercase tracking-wider text-primary font-bold">
                      Kit &amp; Participation Specifications
                    </h4>
                    <p className="text-gray-300 text-xs sm:text-sm">
                      {selectedEvent.requirements}
                    </p>
                  </div>
                )}

                <div className="pt-3 sm:pt-4 flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
                  {selectedEvent.registrationLink && (
                    <a
                      href={selectedEvent.registrationLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto flex-1 btn-primary text-center text-xs sm:text-sm py-3 px-5 flex items-center justify-center space-x-2"
                    >
                      <span>Proceed to Official Registration Form</span>
                      <ExternalLink className="w-4 h-4 ml-1.5" />
                    </a>
                  )}
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="w-full sm:w-auto btn-secondary text-xs sm:text-sm py-3 px-5"
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
