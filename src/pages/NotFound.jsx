import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertTriangle, Home, Compass, MessageSquare, ArrowRight } from "lucide-react";

export default function NotFound() {
  useEffect(() => {
    document.title = "404 - Sector Not Found | TechXpo 2.O";
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pt-32 pb-24 flex items-center justify-center relative overflow-hidden"
    >
      {/* Background radial glow: Zero blur overhead */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] rounded-full pointer-events-none opacity-30"
        style={{
          background: "radial-gradient(ellipse at center, rgba(0, 191, 255, 0.18) 0%, transparent 70%)",
        }}
      />

      <div className="max-w-2xl mx-auto px-4 text-center space-y-6 relative z-10">
        
        {/* Clickable Logo */}
        <Link to="/" className="inline-block group" title="Return to Home">
          <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-2xl p-1.5 bg-darkNavy border-2 border-primary/40 group-hover:border-accent transition-all duration-300 shadow-neon flex items-center justify-center overflow-hidden">
            <img src="/logo.png" alt="Circuitron Logo" className="w-full h-full object-contain group-hover:scale-105 transition-transform" />
          </div>
        </Link>

        {/* Error Badge */}
        <div>
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-xs font-mono font-bold text-red-400">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>HTTP ERROR 404 &bull; SUBSPACE ANOMALY</span>
          </div>
        </div>

        {/* 404 Neon Glitch Text */}
        <h1 className="text-7xl sm:text-9xl font-black font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-accent to-primary tracking-widest">
          404
        </h1>

        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold font-orbitron text-white">
            Sector Not Found
          </h2>
          <p className="text-gray-300 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
            The requested navigational coordinates or subspace frequency do not exist in the official TechXpo 2.O network registry.
          </p>
        </div>

        {/* Quick Action Matrix */}
        <div className="pt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/"
            className="btn-primary py-3 px-6 text-xs sm:text-sm font-bold flex items-center space-x-2 shadow-neon"
          >
            <Home className="w-4 h-4" />
            <span>Return to Main Console</span>
          </Link>

          <Link
            to="/events"
            className="btn-secondary py-3 px-6 text-xs sm:text-sm font-bold flex items-center space-x-2"
          >
            <Compass className="w-4 h-4 text-accent" />
            <span>Browse Events &amp; Arenas</span>
          </Link>

          <Link
            to="/contact"
            className="btn-secondary py-3 px-6 text-xs sm:text-sm font-bold flex items-center space-x-2"
          >
            <MessageSquare className="w-4 h-4 text-primary" />
            <span>Contact Help Desk</span>
          </Link>
        </div>

      </div>
    </motion.div>
  );
}
