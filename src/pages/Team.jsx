import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  getVisibleFaculty,
  getVisibleExecutives,
  getVisibleCoreTeam,
  getVisibleCustomTeams,
  TIER_CONFIG,
  normalizeTierKey,
} from "../data/team";
import { Sparkles, Award, Shield, UserCheck, Users } from "lucide-react";

function MemberAvatar({ src, name }) {
  const [hasError, setHasError] = useState(false);
  const avatarSrc = (src && !hasError) ? src : "/assets/default-avatar.jpg";

  return (
    <img
      src={avatarSrc}
      alt={name}
      onError={() => setHasError(true)}
      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      loading="lazy"
    />
  );
}

export default function Team() {
  const [faculty, setFaculty] = useState(() => getVisibleFaculty());
  const [executives, setExecutives] = useState(() => getVisibleExecutives());
  const [core, setCore] = useState(() => getVisibleCoreTeam());
  const [customTeams, setCustomTeams] = useState(() => getVisibleCustomTeams());

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    const handleUpdate = () => {
      setFaculty(getVisibleFaculty());
      setExecutives(getVisibleExecutives());
      setCore(getVisibleCoreTeam());
      setCustomTeams(getVisibleCustomTeams());
    };
    window.addEventListener("tx2_members_updated", handleUpdate);
    return () => window.removeEventListener("tx2_members_updated", handleUpdate);
  }, []);

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
            <span>CIRCUITRON ROSTER</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-black font-orbitron gradient-text">
            Meet the Circuitron Crew
          </h1>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="w-24 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded-full origin-center"
          />
          <p className="text-gray-300 max-w-2xl mx-auto text-base sm:text-lg">
            The visionary faculty guides, executive leaders, and core student coordinators steering TechXpo 2.O.
          </p>
        </div>
      </section>

      {/* 1. Faculty Mentors */}
      {faculty.length > 0 && (
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-3 mb-12">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                <img
                  src="/assets/rvscet-logo.webp"
                  alt="RVSCET"
                  className="w-4 h-4 object-contain flex-shrink-0"
                />
                <span className="text-xs font-mono uppercase tracking-wider text-accent font-semibold">
                  ACADEMIC ADVISORY BOARD &bull; RVSCET
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black font-orbitron text-white">
                Faculty Mentors
              </h2>
              <div className="w-16 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded-full" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto gap-8">
              {faculty.map((mentor) => (
                <div
                  key={mentor.name}
                  className="glass-card p-8 rounded-3xl border border-primary/25 flex flex-col items-center text-center group"
                >
                  <div className="relative w-36 h-36 mb-6">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary to-accent blur-md opacity-50 group-hover:opacity-90 transition-opacity duration-300" />
                    <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-primary/40 group-hover:border-accent transition-colors bg-darkNavy shadow-xl flex items-center justify-center">
                      <MemberAvatar src={mentor.img} name={mentor.name} />
                    </div>
                  </div>

                  <div className="space-y-2 text-center flex-1 flex flex-col items-center justify-between w-full">
                    <div>
                      <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-[11px] font-bold text-accent uppercase tracking-wider inline-block mb-2">
                        {mentor.position || "Faculty Coordinator"}
                      </span>
                      <h3 className="text-xl font-bold font-orbitron text-white group-hover:text-primary transition-colors">
                        {mentor.name}
                      </h3>
                      <p className="text-gray-300 text-xs leading-relaxed max-w-xs mx-auto mt-2">
                        {mentor.description}
                      </p>
                    </div>
                    {mentor.department && (
                      <span className="text-[11px] font-mono text-gray-400 mt-3 inline-block bg-white/5 border border-white/10 px-3 py-1 rounded-full">
                        {mentor.department}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 2. Executive Leadership */}
      {executives.length > 0 && (
        <section className="py-16 bg-gradient-to-b from-transparent via-primary/5 to-transparent">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-3 mb-12">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                <Shield className="w-3.5 h-3.5 text-accent" />
                <span className="text-xs font-mono uppercase tracking-wider text-accent font-semibold">
                  OFFICE BEARERS
                </span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-black font-orbitron text-white">
                Executive Team
              </h2>
              <div className="w-20 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded-full mt-2" />
              <p className="text-gray-300 max-w-2xl mx-auto text-sm sm:text-base mt-3">
                The leadership team that drives our vision and ensures the success of every event
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
              {executives.map((exec) => (
                <div
                  key={exec.name}
                  className="glass-card p-8 rounded-3xl border border-primary/25 flex flex-col items-center text-center group hover:border-accent/40 transition-all duration-300"
                >
                  <div className="relative w-36 h-36 mb-6 flex-shrink-0">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary to-cyberPurple blur-md opacity-40 group-hover:opacity-80 transition-opacity duration-300" />
                    <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-primary/40 group-hover:border-accent transition-colors bg-darkNavy shadow-xl flex items-center justify-center">
                      <MemberAvatar src={exec.img} name={exec.name} />
                    </div>
                  </div>

                  <div className="space-y-2 text-center flex-1 flex flex-col items-center justify-between w-full">
                    <div>
                      <h3 className="text-xl font-bold font-orbitron text-white group-hover:text-primary transition-colors">
                        {exec.name}
                      </h3>
                      <p className="text-primary font-semibold text-sm mt-1">
                        {exec.position}
                      </p>
                    </div>
                    {(exec.tagline || exec.description) && (
                      <p className="text-gray-300 text-xs sm:text-sm leading-relaxed max-w-xs mx-auto pt-3 border-t border-white/10 mt-3">
                        {exec.tagline || exec.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 3. Core Coordinators */}
      {core.length > 0 && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-3 mb-12">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                <UserCheck className="w-3.5 h-3.5 text-accent" />
                <span className="text-xs font-mono uppercase tracking-wider text-accent font-semibold">
                  OPERATIONS &amp; LOGISTICS
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black font-orbitron text-white">
                Core Team Members
              </h2>
              <div className="w-16 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded-full" />
              <p className="text-gray-300 text-sm max-w-xl mx-auto">
                The driving engine coordinating technical design, workshop logistics, content, hardware inventory, and public relations.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {core.map((member) => (
                <div
                  key={member.name}
                  className="glass-card p-6 rounded-2xl border border-primary/20 flex flex-col items-center text-center group hover:border-primary/50"
                >
                  <div className="relative w-28 h-28 mb-4">
                    <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-primary/30 group-hover:border-accent transition-colors bg-darkNavy shadow-md flex items-center justify-center">
                      <MemberAvatar src={member.img} name={member.name} />
                    </div>
                  </div>

                  <h3 className="text-base font-bold font-orbitron text-white group-hover:text-primary transition-colors">
                    {member.name}
                  </h3>
                  <p className="text-accent font-semibold text-xs mt-1">
                    {member.role}
                  </p>
                  {member.department && (
                    <span className="text-[10px] font-mono text-gray-300 mt-1.5 inline-block bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-full">
                      {member.department}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. Special Teams & Featured Delegations (Dynamic from Admin Portal) */}
      {customTeams.length > 0 && (
        <section className="py-16 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-3 mb-12">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20">
                <Users className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-xs font-mono uppercase tracking-wider text-cyan-300 font-semibold">
                  FEATURED TEAMS &amp; DELEGATIONS
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black font-orbitron text-white">
                Special Teams &amp; Delegations
              </h2>
              <div className="w-16 h-1 bg-gradient-to-r from-cyan-400 to-accent mx-auto rounded-full" />
              <p className="text-gray-300 text-sm max-w-xl mx-auto">
                Specialized teams, event volunteers, and registered delegations featured for TechXpo 2.O.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {customTeams.map((member) => {
                const tKey = normalizeTierKey(member.tierKey || member.tier || member.category, member.id);
                const cfg = TIER_CONFIG[tKey] || TIER_CONFIG.participant;

                return (
                  <div
                    key={member.id || member.name}
                    className="glass-card p-6 rounded-2xl border border-white/10 hover:border-cyan-400/40 flex flex-col items-center text-center group transition-all duration-300"
                  >
                    <div className="relative w-28 h-28 mb-4">
                      <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-white/20 group-hover:border-accent transition-colors bg-darkNavy shadow-md flex items-center justify-center">
                        <MemberAvatar src={member.img} name={member.name} />
                      </div>
                    </div>

                    <span
                      className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider mb-2"
                      style={{
                        backgroundColor: `${cfg.color}15`,
                        color: cfg.color,
                        border: `1px solid ${cfg.color}40`,
                      }}
                    >
                      {cfg.label}
                    </span>

                    <h3 className="text-base font-bold font-orbitron text-white group-hover:text-primary transition-colors">
                      {member.name}
                    </h3>
                    <p className="text-accent font-semibold text-xs mt-1">
                      {member.role || member.position}
                    </p>
                    {member.teamName && (
                      <span className="text-[11px] font-mono text-amber-300 mt-1 inline-block">
                        Team: {member.teamName}
                      </span>
                    )}
                    {member.department && (
                      <span className="text-[10px] font-mono text-gray-400 mt-1.5 inline-block bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full">
                        {member.department}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </motion.div>
  );
}
