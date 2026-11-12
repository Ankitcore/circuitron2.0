import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowUpRight, Sparkles, ShieldCheck } from "lucide-react";

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
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile drawer when route changes or Escape key pressed
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <motion.header
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "py-2 sm:py-3" : "py-4 sm:py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav
          className={`flex items-center justify-between px-2.5 sm:px-6 py-2 sm:py-2.5 rounded-2xl transition-all duration-300 ${
            isScrolled
              ? "glass-panel shadow-2xl border-primary/25"
              : "bg-secondary/40 backdrop-blur-md border border-white/10"
          }`}
        >
          {/* Logo & Branding */}
          <Link to="/" className="flex items-center space-x-2 sm:space-x-3 group min-w-0 flex-shrink">
            <div className="flex items-center space-x-1.5 sm:space-x-2 flex-shrink-0">
              <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-xl overflow-hidden p-0.5 border border-primary/40 group-hover:border-accent transition-all duration-300 bg-darkNavy/80 flex items-center justify-center shadow-neon">
                <img
                  src="/logo.png"
                  alt="Circuitron Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="hidden xs:flex relative w-8 h-8 sm:w-10 sm:h-10 rounded-xl overflow-hidden p-0.5 border border-primary/30 group-hover:border-accent transition-all duration-300 bg-darkNavy/80 items-center justify-center shadow-neon">
                <img
                  src="/assets/rvscet-logo.webp"
                  alt="RVSCET Logo"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-1">
                <span className="font-orbitron font-extrabold text-xs xs:text-sm sm:text-lg gradient-text tracking-wide whitespace-nowrap">
                  Circuitron
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse flex-shrink-0" />
              </div>
              <p className="text-[8px] xs:text-[9px] sm:text-[10px] text-gray-300 font-mono tracking-tight block whitespace-nowrap font-medium">
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

          {/* Right Action: Register Now & Admin Access */}
          <div className="hidden sm:flex items-center space-x-2.5">
            <Link
              to="/admin"
              title="Admin Portal"
              className="p-2 rounded-xl bg-darkNavy/80 border border-primary/20 text-gray-400 hover:text-accent hover:border-accent/40 transition-all flex items-center justify-center"
            >
              <ShieldCheck className="w-4 h-4" />
            </Link>
            <motion.a
              href="https://forms.gle/mNU3damnJBMfnmSU7"
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

          {/* Mobile Menu Button & Compact Register */}
          <div className="lg:hidden flex items-center space-x-1.5 sm:space-x-2 flex-shrink-0">
            <motion.a
              href="https://forms.gle/mNU3damnJBMfnmSU7"
              target="_blank"
              rel="noopener noreferrer"
              whileTap={{ scale: 0.95 }}
              className="sm:hidden inline-flex items-center justify-center text-[10px] xs:text-[11px] font-bold font-orbitron py-1 px-2.5 xs:px-3 rounded-full bg-gradient-to-r from-primary to-accent text-darkNavy shadow-neon flex-shrink-0"
            >
              Register
            </motion.a>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-1.5 sm:p-2.5 min-w-[34px] min-h-[34px] sm:min-w-[40px] sm:min-h-[40px] flex items-center justify-center rounded-xl bg-darkNavy/80 border border-primary/20 text-gray-300 hover:text-white focus:outline-none flex-shrink-0"
              aria-label="Toggle menu"
              aria-expanded={isOpen}
            >
              {isOpen ? <X className="w-4 h-4 sm:w-5 sm:h-5" /> : <Menu className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile Drawer Dropdown & Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[-1]"
            />
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="lg:hidden max-w-7xl mx-auto px-4 mt-2"
            >
              <div className="bg-darkNavy/95 backdrop-blur-xl p-4 sm:p-5 rounded-2xl border border-primary/30 space-y-2 shadow-2xl">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={() => setIsOpen(false)}
                      className={`block px-4 py-3 rounded-xl text-sm font-semibold transition-all min-h-[44px] flex items-center ${
                        isActive
                          ? "bg-gradient-to-r from-primary/30 to-accent/30 text-white border border-primary/40 font-bold"
                          : "text-gray-300 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      {item.name}
                    </Link>
                  );
                })}

                <div className="pt-2 space-y-2">
                  <Link
                    to="/verify"
                    onClick={() => setIsOpen(false)}
                    className="w-full py-2.5 px-3 rounded-xl bg-darkNavy/80 border border-primary/20 text-xs font-mono text-gray-300 hover:text-primary flex items-center justify-center space-x-1.5"
                  >
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span>Verify Credentials &amp; Badges</span>
                  </Link>

                  <a
                    href="https://forms.gle/mNU3damnJBMfnmSU7"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full btn-primary py-3 text-xs font-bold flex items-center justify-center space-x-1.5 min-h-[44px]"
                  >
                    <span>Register for TechXpo 2.O</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </a>

                  <Link
                    to="/admin"
                    onClick={() => setIsOpen(false)}
                    className="w-full py-2.5 px-3 rounded-xl bg-darkNavy/80 border border-primary/20 text-xs font-mono text-gray-300 hover:text-accent flex items-center justify-center space-x-1.5"
                  >
                    <ShieldCheck className="w-4 h-4 text-accent" />
                    <span>Admin Portal</span>
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
