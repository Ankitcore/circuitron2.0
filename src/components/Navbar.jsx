import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowUpRight, Sparkles } from "lucide-react";

const navItems = [
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
  { name: "Events", path: "/events" },
  { name: "Team", path: "/team" },
  { name: "Gallery", path: "/gallery" },
  { name: "Schedule", path: "/schedule" },
  { name: "Contact", path: "/contact" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "py-2 sm:py-3" : "py-4 sm:py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav
          className={`flex items-center justify-between px-4 sm:px-6 py-2.5 rounded-2xl transition-all duration-300 ${
            isScrolled
              ? "glass-panel shadow-2xl border-primary/25"
              : "bg-secondary/40 backdrop-blur-md border border-white/10"
          }`}
        >
          {/* Logo & Branding */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative w-10 h-10 rounded-xl overflow-hidden p-0.5 border border-primary/40 group-hover:border-accent transition-all duration-300 bg-darkNavy/80 flex items-center justify-center shadow-neon">
              <img
                src="/logo.png"
                alt="Circuitron Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center space-x-1">
                <span className="font-orbitron font-extrabold text-base sm:text-lg gradient-text tracking-wide">
                  Circuitron
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              </div>
              <p className="text-[10px] text-gray-400 font-mono tracking-tight hidden sm:block">
                RVSCET &bull; TECHXPO 2.O
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center space-x-1 bg-darkNavy/60 px-3 py-1.5 rounded-full border border-white/5">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`relative px-3.5 py-1.5 text-xs font-semibold rounded-full transition-colors duration-200 ${
                    isActive ? "text-white" : "text-gray-300 hover:text-white"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activePill"
                      className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-full opacity-90 shadow-sm"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Right Action: Register Now */}
          <div className="hidden sm:flex items-center space-x-3">
            <motion.a
              href="https://forms.gle/mmUiZV4xpYRamn5r8"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-primary text-xs py-2 px-5 font-bold"
            >
              <span>Register</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </motion.a>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center space-x-2">
            <motion.a
              href="https://forms.gle/mmUiZV4xpYRamn5r8"
              target="_blank"
              rel="noopener noreferrer"
              whileTap={{ scale: 0.95 }}
              className="btn-primary text-xs py-1.5 px-3 sm:hidden"
            >
              Register
            </motion.a>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl bg-darkNavy/80 border border-primary/20 text-gray-300 hover:text-white focus:outline-none"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile Drawer Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden max-w-7xl mx-auto px-4 mt-2"
          >
            <div className="glass-panel p-5 rounded-2xl border border-primary/30 space-y-3 shadow-2xl">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`block px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? "bg-gradient-to-r from-primary/30 to-accent/30 text-white border border-primary/40"
                        : "text-gray-300 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}

              <div className="pt-2">
                <a
                  href="https://forms.gle/mmUiZV4xpYRamn5r8"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full btn-primary py-3 text-xs font-bold flex items-center justify-center space-x-1"
                >
                  <span>Register for TechXpo 2.O</span>
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
