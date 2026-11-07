import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, MapPin, ArrowUpRight, Heart, Sparkles } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      name: "Instagram",
      href: "https://www.instagram.com/circuitron.rvscet?igsh=MTlodTUweno3YjN5bQ==",
      icon: "M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0-.795-.646-1.44-1.44-1.44-.795 0-1.44.646-1.44 1.44 0 .794.646 1.439 1.44 1.439.793-.001 1.44-.645 1.44-1.439z",
    },
    {
      name: "LinkedIn",
      href: "https://www.linkedin.com/school/rvs-college-of-engineering-and-technology/",
      icon: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
    },
    {
      name: "YouTube",
      href: "https://www.youtube.com/@rvscetjsr",
      icon: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
    },
  ];

  const quickLinks = [
    { name: "Home", path: "/" },
    { name: "About Us", path: "/about" },
    { name: "All Events", path: "/events" },
    { name: "Timeline Schedule", path: "/schedule" },
    { name: "Core Committee", path: "/team" },
    { name: "Photo Archive", path: "/gallery" },
    { name: "Support & Contact", path: "/contact" },
    { name: "Verify Credentials", path: "/verify" },
    { name: "Event Brochure (PDF)", path: "/assets/techxpo-2.0-brochure.pdf", download: true },
  ];

  return (
    <footer className="bg-darkNavy/90 border-t border-primary/20 relative z-20 pt-16 pb-8 overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-primary/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 pb-12 border-b border-white/10">
          
          {/* Brand Info (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <Link to="/" className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="w-12 h-12 rounded-xl p-0.5 bg-darkNavy border border-primary/40 shadow-neon flex items-center justify-center overflow-hidden">
                  <img
                    src="/logo.png"
                    alt="Circuitron Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="w-12 h-12 rounded-xl p-1 bg-darkNavy border border-primary/30 shadow-neon flex items-center justify-center overflow-hidden">
                  <img
                    src="/assets/rvscet-logo.webp"
                    alt="RVSCET Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
              <div>
                <h3 className="font-orbitron font-extrabold text-xl gradient-text">
                  Circuitron
                </h3>
                <p className="text-xs text-gray-400 font-mono">
                  IoT &amp; Embedded System Club
                </p>
              </div>
            </Link>

            <p className="text-gray-300 text-sm leading-relaxed max-w-sm">
              Empowering engineers and innovators through applied robotics, IoT research, and cutting-edge hardware design at RVSCET Jamshedpur.
            </p>

            {/* Social Icons */}
            <div className="flex items-center space-x-3 pt-2">
              {socialLinks.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.name}
                  className="w-10 h-10 rounded-xl bg-darkNavy border border-primary/40 flex items-center justify-center text-accent hover:text-white hover:bg-primary/20 hover:border-accent hover:shadow-neon transition-all duration-200 group"
                >
                  <svg className="w-5 h-5 fill-current" fill="currentColor" viewBox="0 0 24 24">
                    <path d={s.icon} fill="currentColor" />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-sm font-bold font-orbitron text-white uppercase tracking-wider">
              Navigation
            </h4>
            <ul className="space-y-2 text-sm">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  {link.download ? (
                    <a
                      href={link.path}
                      download="TechXpo_2.0_Official_Brochure.pdf"
                      className="text-accent hover:text-white transition-colors duration-200 flex items-center space-x-1.5 font-semibold"
                    >
                      <span className="text-primary text-xs">&rsaquo;</span>
                      <span>{link.name}</span>
                    </a>
                  ) : (
                    <Link
                      to={link.path}
                      className="text-gray-400 hover:text-accent transition-colors duration-200 flex items-center space-x-1.5"
                    >
                      <span className="text-primary text-xs">&rsaquo;</span>
                      <span>{link.name}</span>
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Campus Coordinates (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg p-0.5 bg-darkNavy border border-primary/30 flex items-center justify-center overflow-hidden">
                <img
                  src="/assets/rvscet-logo.webp"
                  alt="RVSCET"
                  className="w-full h-full object-contain"
                />
              </div>
              <h4 className="text-sm font-bold font-orbitron text-white uppercase tracking-wider">
                Host Institute
              </h4>
            </div>
            <div className="space-y-3 text-sm text-gray-300">
              <div className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-primary flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-white">
                    RVS College of Engineering &amp; Technology
                  </p>
                  <p className="text-gray-400 text-xs mt-0.5">
                    Edalbera, PO- Bhilai Pahari, Jamshedpur, Jharkhand - 831001
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-accent flex-shrink-0" />
                <a
                  href="mailto:circuitronrvscet@gmail.com"
                  className="text-primary hover:underline text-xs font-mono"
                >
                  circuitronrvscet@gmail.com
                </a>
              </div>
            </div>

            <div className="pt-2">
              <a
                href="https://forms.gle/mNU3damnJBMfnmSU7"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full btn-primary text-xs py-2.5 px-4 font-bold inline-flex items-center justify-center space-x-1"
              >
                <span>Register for TechXpo 2.O</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Credits */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 space-y-3 sm:space-y-0">
          <p>
            &copy; {currentYear} Circuitron &bull; RVS College of Engineering &amp; Technology. All rights reserved.
          </p>
          <div className="flex items-center space-x-1 text-gray-400">
            <span>Engineered with passion by</span>
            <span className="text-primary font-bold">Circuitron Crew</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
