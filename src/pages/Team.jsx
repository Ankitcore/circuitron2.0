import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { facultyCoordinators, executiveTeam, coreTeam } from "../data/team";
import { Sparkles, Award, Shield, UserCheck } from "lucide-react";

export default function Team() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
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
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-primary/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
            <Sparkles className="w-3.5 h-3.5" />
            <span>CIRCUITRON ROSTER</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-black font-orbitron gradient-text">
            Meet the Circuitron Crew
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded-full" />
          <p className="text-gray-300 max-w-2xl mx-auto text-base sm:text-lg">
            The visionary faculty guides, executive leaders, and core student coordinators steering TechXpo 2026.
          </p>
        </div>
      </section>

      {/* 1. Faculty Mentors */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-12">
            <span className="text-xs font-mono uppercase tracking-wider text-accent font-semibold">
              ACADEMIC ADVISORY BOARD
            </span>
            <h2 className="text-3xl sm:text-4xl font-black font-orbitron text-white">
              Faculty Coordinators
            </h2>
            <div className="w-16 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {facultyCoordinators.map((mentor) => (
              <div
                key={mentor.name}
                className="glass-card p-8 rounded-3xl border border-primary/25 flex flex-col items-center text-center group"
              >
                <div className="relative w-36 h-36 mb-6">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary to-accent blur-md opacity-50 group-hover:opacity-90 transition-opacity duration-300" />
                  <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-primary/40 group-hover:border-accent transition-colors bg-darkNavy shadow-xl">
                    <img
                      src={mentor.img}
                      alt={mentor.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-[11px] font-bold text-accent uppercase tracking-wider">
                    {mentor.position}
                  </span>
                  <h3 className="text-xl font-bold font-orbitron text-white group-hover:text-primary transition-colors">
                    {mentor.name}
                  </h3>
                  <p className="text-gray-300 text-xs leading-relaxed max-w-xs mx-auto">
                    {mentor.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. Executive Leadership */}
      <section className="py-16 bg-gradient-to-b from-transparent via-primary/5 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-12">
            <span className="text-xs font-mono uppercase tracking-wider text-cyberPurple font-semibold">
              OFFICE BEARERS
            </span>
            <h2 className="text-3xl sm:text-4xl font-black font-orbitron text-white">
              Executive Team
            </h2>
            <div className="w-16 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {executiveTeam.map((exec) => (
              <div
                key={exec.name}
                className="glass-card p-8 rounded-3xl border border-primary/25 flex flex-col sm:flex-row items-center space-y-6 sm:space-y-0 sm:space-x-6 group"
              >
                <div className="relative w-36 h-36 flex-shrink-0">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary to-cyberPurple blur-md opacity-40 group-hover:opacity-80 transition-opacity duration-300" />
                  <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-primary/40 group-hover:border-accent transition-colors bg-darkNavy shadow-xl">
                    <img
                      src={exec.img}
                      alt={exec.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                </div>

                <div className="space-y-2 text-center sm:text-left">
                  <span className="px-3 py-1 rounded-full bg-accent/15 border border-accent/30 text-[11px] font-bold text-accent uppercase tracking-wider">
                    {exec.position}
                  </span>
                  <h3 className="text-xl font-bold font-orbitron text-white group-hover:text-primary transition-colors">
                    {exec.name}
                  </h3>
                  {exec.rollNo && (
                    <p className="text-xs font-mono text-gray-400">
                      Roll No: {exec.rollNo}
                    </p>
                  )}
                  {exec.description && (
                    <p className="text-gray-300 text-xs leading-relaxed">
                      {exec.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Core Coordinators */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-12">
            <span className="text-xs font-mono uppercase tracking-wider text-accent font-semibold">
              OPERATIONS &amp; LOGISTICS
            </span>
            <h2 className="text-3xl sm:text-4xl font-black font-orbitron text-white">
              Core Team Members
            </h2>
            <div className="w-16 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded-full" />
            <p className="text-gray-300 text-sm max-w-xl mx-auto">
              The driving engine coordinating technical design, workshop logistics, content, hardware inventory, and public relations.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {coreTeam.map((member) => (
              <div
                key={member.name}
                className="glass-card p-6 rounded-2xl border border-primary/20 flex flex-col items-center text-center group hover:border-primary/50"
              >
                <div className="relative w-28 h-28 mb-4">
                  <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-primary/30 group-hover:border-accent transition-colors bg-darkNavy shadow-md">
                    <img
                      src={member.img}
                      alt={member.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                </div>

                <h3 className="text-base font-bold font-orbitron text-white group-hover:text-primary transition-colors">
                  {member.name}
                </h3>
                <p className="text-accent font-semibold text-xs mt-1">
                  {member.role}
                </p>
                {member.rollNo && (
                  <span className="text-[10px] font-mono text-gray-400 mt-1 bg-white/5 px-2 py-0.5 rounded">
                    {member.rollNo}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </motion.div>
  );
}
