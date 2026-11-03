import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { facultyCoordinators, executiveTeam } from "../data/team";
import { Users, ArrowRight, Sparkles, Shield } from "lucide-react";

export default function HomeTeam() {
  const showcase = [
    { ...facultyCoordinators[0], category: "Faculty Mentor" },
    { ...executiveTeam[0], category: "Student Leadership" },
    { ...executiveTeam[1], category: "Student Leadership" },
  ];

  return (
    <section className="py-24 relative overflow-hidden bg-gradient-to-b from-transparent via-cyberPurple/5 to-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center space-y-4 mb-16"
        >
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyberPurple/15 border border-cyberPurple/30 text-xs font-semibold text-cyberPurple">
            <Sparkles className="w-3.5 h-3.5" />
            <span>THE MINDS BEHIND THE SCENES</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-black font-orbitron gradient-text">
            Meet Our Leadership
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded-full" />
          <p className="text-gray-300 max-w-2xl mx-auto text-base sm:text-lg">
            Guiding technology research and driving student excellence across RVSCET. Meet the mentors and student executives leading Circuitron.
          </p>
        </motion.div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {showcase.map((member, index) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              viewport={{ once: true }}
              className="glass-card rounded-2xl p-8 border border-primary/20 flex flex-col items-center text-center group relative overflow-hidden"
            >
              {/* Category Pill */}
              <div className="mb-6 px-3 py-1 rounded-full bg-darkNavy/80 border border-primary/20 text-[11px] font-semibold text-accent uppercase tracking-wider">
                {member.category}
              </div>

              {/* Avatar with Animated Glow Ring */}
              <div className="relative w-36 h-36 mb-6">
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary to-cyberPurple blur-md opacity-40 group-hover:opacity-80 transition-opacity duration-300" />
                <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-primary/40 group-hover:border-accent transition-colors duration-300 bg-secondary">
                  {member.img ? (
                    <img
                      src={member.img}
                      alt={member.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-primary text-3xl font-bold">
                      {member.name.charAt(0)}
                    </div>
                  )}
                </div>
              </div>

              {/* Information */}
              <h3 className="text-xl font-bold font-orbitron text-white group-hover:text-primary transition-colors">
                {member.name}
              </h3>
              <p className="text-primary font-semibold text-sm mt-1">
                {member.position}
              </p>
              {member.rollNo && (
                <span className="text-[11px] font-mono text-gray-400 mt-1 bg-white/5 px-2.5 py-0.5 rounded">
                  Roll: {member.rollNo}
                </span>
              )}
              {member.description && (
                <p className="text-gray-300 text-xs mt-3 leading-relaxed">
                  {member.description}
                </p>
              )}
            </motion.div>
          ))}
        </div>

        {/* View All Team Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link to="/team" className="inline-block">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="btn-secondary">
              <Users className="w-4 h-4" />
              <span>Meet All Faculty &amp; Core Members</span>
              <ArrowRight className="w-4 h-4" />
            </motion.div>
          </Link>
        </motion.div>

      </div>
    </section>
  );
}
