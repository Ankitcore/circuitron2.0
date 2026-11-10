import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  MessageSquare,
  ChevronDown,
  AlertCircle,
  Clock,
  Train,
  Bus,
  Car,
  Navigation,
  Compass,
  ShieldCheck,
} from "lucide-react";

const inquiryCategories = [
  "General TechXpo 2.O Inquiry",
  "Event Registration & Team Slots",
  "Project Exhibition & Hardware Guidelines",
  "Robo War & Robo Race Arenas",
  "Campus Accommodation & Dining",
  "Sponsorship & Media Collaboration",
  "Other / Administrative Support",
];

const faqs = [
  {
    q: "Who is eligible to participate in TechXpo 2.O?",
    a: "TechXpo 2.O is open to all bona-fide undergraduate, diploma, and polytechnic students currently enrolled in B.Tech, BE, Diploma, BCA, MCA, or B.Sc programs across recognized colleges and universities nationwide.",
  },
  {
    q: "Can team members be from different colleges or engineering branches?",
    a: "Yes! Cross-departmental and inter-collegiate teams are warmly encouraged across all events, including the flagship Project Exhibition and autonomous/manual robotics competitions (Robo War, Robo Race).",
  },
  {
    q: "Is spot registration available on the day of the event?",
    a: "While limited spot registration may be accommodated subject to arena slot availability, we strongly recommend registering in advance via our online forms to guarantee team slots, test windows, and official delegate credentials.",
  },
  {
    q: "Will accommodation and meals be arranged for outstation participants?",
    a: "Yes, basic accommodation support in campus guest hostels and dining facilities can be coordinated upon prior request. Outstation teams should contact the secretariat at circuitronrvscet@gmail.com or WhatsApp as early as possible.",
  },
  {
    q: "What credentials and items should participants bring on event day?",
    a: "All participants must carry their original College Identity Card, government-issued photo ID, their project prototypes/robot hardware with spare batteries, and the official institutional consent form if applicable.",
  },
  {
    q: "How do I verify team credentials or digital member badges?",
    a: "Official badges issued to participants and executive committee members feature a cryptographically verifiable QR code. Visit the Secretariat Desk or use the online Member Verification portal on this site to confirm clearance.",
  },
];

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    category: inquiryCategories[0],
    subject: "",
    message: "",
    hp: "", // Honeypot field for bot spam prevention
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [openFaq, setOpenFaq] = useState(0);

  // Security: Clean and sanitize inputs against XSS and pseudo-protocol injections
  const sanitizeInput = (val, maxLen = 300) => {
    if (typeof val !== "string") return "";
    return val
      .replace(/<[^>]*>?/gm, "")
      .replace(/javascript:/gi, "")
      .slice(0, maxLen);
  };

  const handleChange = (e) => {
    setErrorMsg("");
    const { name, value } = e.target;
    const maxLen = name === "message" ? 1000 : name === "subject" ? 120 : name === "email" ? 100 : 80;
    setFormData((prev) => ({ ...prev, [name]: sanitizeInput(value, maxLen) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (formData.hp) {
      // Silently discard bot submission
      setSubmitted(true);
      return;
    }

    if (!formData.name.trim() || formData.name.trim().length < 2) {
      setErrorMsg("Please enter your full name.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setErrorMsg("Please enter a valid email address (e.g. name@college.edu).");
      return;
    }

    if (!formData.message.trim() || formData.message.trim().length < 10) {
      setErrorMsg("Please provide a message with at least 10 characters.");
      return;
    }

    setErrorMsg("");
    setIsSubmitting(true);

    try {
      const payloadSubject = formData.subject.trim()
        ? `[${formData.category}] ${formData.subject.trim()}`
        : `[${formData.category}] Inquiry from Contact Page`;

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          subject: payloadSubject,
          message: formData.message.trim(),
          hp: formData.hp,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok && data.success !== false) {
        setSubmitted(true);
        setFormData({
          name: "",
          email: "",
          category: inquiryCategories[0],
          subject: "",
          message: "",
          hp: "",
        });
        setTimeout(() => setSubmitted(false), 7000);
      } else {
        setErrorMsg(
          data.error ||
            "Unable to transmit your message right now. Please reach out via WhatsApp or email directly."
        );
      }
    } catch (err) {
      console.error("Transmission error:", err);
      setErrorMsg(
        "Network connection failed. Please reach out to circuitronrvscet@gmail.com or WhatsApp directly."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const socialLinks = [
    {
      name: "Instagram",
      handle: "@circuitron.rvscet",
      href: "https://www.instagram.com/circuitron.rvscet?igsh=MTlodTUweno3YjN5bQ==",
      icon: "M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0-.795-.646-1.44-1.44-1.44-.795 0-1.44.646-1.44 1.44 0 .794.646 1.439 1.44 1.439.793-.001 1.44-.645 1.44-1.439z",
    },
    {
      name: "LinkedIn",
      handle: "RVS College of Engineering & Tech",
      href: "https://www.linkedin.com/school/rvs-college-of-engineering-and-technology/",
      icon: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
    },
    {
      name: "YouTube",
      handle: "@rvscetjsr",
      href: "https://www.youtube.com/@rvscetjsr",
      icon: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen pt-28 pb-20"
    >
      {/* =========================================================================
          SECTION 1: HERO & STATUS BAR
      ========================================================================= */}
      <section className="relative py-12 md:py-16 overflow-hidden">
        <div className="absolute inset-0 circuit-bg opacity-30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-primary/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <span className="tracking-wider uppercase">Official Secretariat &amp; Communications</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black font-orbitron gradient-text tracking-tight">
            Contact &amp; Assistance Hub
          </h1>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="w-24 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded-full origin-center"
          />

          <p className="text-gray-300 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            Direct communication lines for registered delegates, participating institutions, faculty advisors, and event sponsors.
          </p>

          {/* Real-time Status Badges */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs font-mono">
            <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-darkNavy/80 border border-emerald-500/30 text-emerald-400 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>WhatsApp Desk: <strong>Active</strong></span>
            </div>
            <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-darkNavy/80 border border-primary/30 text-cyan-300 shadow-sm">
              <Clock className="w-3.5 h-3.5 text-accent" />
              <span>Helpline Desk: <strong>09:00 AM &ndash; 07:00 PM IST</strong></span>
            </div>
            <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-darkNavy/80 border border-white/10 text-gray-300 shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
              <span>Response Window: <strong>&lt; 24 Hours</strong></span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: ORGANIZED 4-CARD QUICK CHANNELS GRID
      ========================================================================= */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            
            {/* Card 1: WhatsApp Helpline */}
            <div className="glass-card p-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500/60 transition-all duration-300 flex flex-col justify-between group">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold font-orbitron text-white text-base">
                    WhatsApp Desk
                  </h3>
                  <p className="text-gray-400 text-xs mt-1">
                    Fastest channel for registration queries, rulebooks, and team slot status.
                  </p>
                </div>
                <div className="pt-1 space-y-1 font-mono text-xs">
                  <div className="text-emerald-400 font-bold block">+91 96315 35834</div>
                  <div className="text-emerald-400 font-bold block">+91 87096 58260</div>
                </div>
              </div>

              <div className="pt-4 mt-2 border-t border-emerald-500/20">
                <a
                  href="https://wa.me/919631535834?text=Hello%20Circuitron%20RVSCET,%20I%20have%20an%20inquiry%20regarding%20TechXpo%202.O"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center space-x-2 py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-darkNavy font-orbitron text-xs font-bold transition-all shadow-md"
                >
                  <span>Chat on WhatsApp</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Card 2: Voice Helpline */}
            <div className="glass-card p-6 rounded-2xl border border-primary/20 hover:border-accent/40 transition-all duration-300 flex flex-col justify-between group">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold font-orbitron text-white text-base">
                    Helpline Desks
                  </h3>
                  <p className="text-gray-400 text-xs mt-1">
                    Voice calling for urgent on-site guidance, travel arrival, and queries.
                  </p>
                </div>
                <div className="pt-1 space-y-1 font-mono text-xs">
                  <a href="tel:+919631535834" className="text-accent hover:text-white font-bold block transition-colors">
                    +91 96315 35834 <span className="text-[10px] text-gray-400 font-normal">(Primary)</span>
                  </a>
                  <a href="tel:+918709658260" className="text-accent hover:text-white font-bold block transition-colors">
                    +91 87096 58260 <span className="text-[10px] text-gray-400 font-normal">(Secondary)</span>
                  </a>
                </div>
              </div>

              <div className="pt-4 mt-2 border-t border-primary/10">
                <a
                  href="tel:+919631535834"
                  className="w-full inline-flex items-center justify-center space-x-2 py-2 px-3 rounded-xl bg-darkNavy/80 hover:bg-primary/20 border border-primary/30 text-white font-orbitron text-xs font-bold transition-all"
                >
                  <Phone className="w-3.5 h-3.5 text-accent" />
                  <span>Call Primary Desk</span>
                </a>
              </div>
            </div>

            {/* Card 3: Categorized Email Directory */}
            <div className="glass-card p-6 rounded-2xl border border-primary/20 hover:border-primary/50 transition-all duration-300 flex flex-col justify-between group">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold font-orbitron text-white text-base">
                    Email Directory
                  </h3>
                  <p className="text-gray-400 text-xs mt-1">
                    Direct institutional emails for formal inquiries and sponsorship.
                  </p>
                </div>
                <div className="pt-1 space-y-1.5 text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-sans">Official Desk:</span>
                    <a href="mailto:circuitronrvscet@gmail.com" className="text-primary hover:text-accent font-semibold break-all transition-colors">
                      circuitronrvscet@gmail.com
                    </a>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-sans">Technical &amp; Rules:</span>
                    <a href="mailto:aashmitanand15.8@gmail.com" className="text-primary hover:text-accent font-semibold break-all transition-colors">
                      aashmitanand15.8@gmail.com
                    </a>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-2 border-t border-primary/10">
                <a
                  href="mailto:circuitronrvscet@gmail.com?subject=TechXpo%202.O%20Inquiry"
                  className="w-full inline-flex items-center justify-center space-x-2 py-2 px-3 rounded-xl bg-darkNavy/80 hover:bg-primary/20 border border-primary/30 text-white font-orbitron text-xs font-bold transition-all"
                >
                  <Mail className="w-3.5 h-3.5 text-primary" />
                  <span>Write to Us</span>
                </a>
              </div>
            </div>

            {/* Card 4: Campus Headquarters */}
            <div className="glass-card p-6 rounded-2xl border border-primary/20 hover:border-primary/50 transition-all duration-300 flex flex-col justify-between group">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold font-orbitron text-white text-base">
                    Campus Venue
                  </h3>
                  <p className="text-gray-400 text-xs mt-1">
                    Event arena and secretariat at RVSCET campus in Jamshedpur.
                  </p>
                </div>
                <div className="pt-1 text-xs text-gray-300 space-y-0.5">
                  <p className="font-semibold text-white">RVS College of Engg. &amp; Tech.</p>
                  <p className="text-gray-400 text-[11px]">Edalbera, PO- Bhilai Pahari, NH-33</p>
                  <p className="text-gray-400 text-[11px]">Jamshedpur &ndash; 831001, Jharkhand</p>
                </div>
              </div>

              <div className="pt-4 mt-2 border-t border-primary/10">
                <a
                  href="https://maps.app.goo.gl/PxfFwyV8UVVcCkex8"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center space-x-2 py-2 px-3 rounded-xl bg-darkNavy/80 hover:bg-purple-500/20 border border-purple-500/30 text-white font-orbitron text-xs font-bold transition-all"
                >
                  <Navigation className="w-3.5 h-3.5 text-purple-400" />
                  <span>Open Maps</span>
                  <ExternalLink className="w-3 h-3 text-gray-400" />
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: MAIN DUAL-COLUMN ACTION AREA (FORM + COORDINATORS)
      ========================================================================= */}
      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* Left Column (5 cols): Key Contacts, Social Channels & Hours */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Key Student & Faculty Leads */}
              <div className="glass-panel p-6 rounded-2xl border border-primary/25 space-y-4">
                <div className="flex items-center space-x-2 border-b border-primary/15 pb-3">
                  <MessageSquare className="w-4 h-4 text-accent" />
                  <h3 className="font-bold font-orbitron text-white text-base tracking-wide">
                    Secretariat Points of Contact
                  </h3>
                </div>

                <div className="space-y-3.5 text-xs">
                  {/* Coordinator 1 */}
                  <div className="p-3 rounded-xl bg-darkNavy/60 border border-white/5 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white text-sm">Umang Kumar Sharma</div>
                      <div className="text-[11px] text-accent font-mono font-medium">President &bull; Circuitron Club</div>
                    </div>
                    <a
                      href="https://wa.me/919631535834?text=Hello%20Umang,%20I%20have%20an%20inquiry%20regarding%20TechXpo%202.O"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-darkNavy font-mono font-bold text-[10px] transition-all"
                    >
                      Connect
                    </a>
                  </div>

                  {/* Coordinator 2 */}
                  <div className="p-3 rounded-xl bg-darkNavy/60 border border-white/5 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white text-sm">Akshat Anand Singh</div>
                      <div className="text-[11px] text-primary font-mono font-medium">Technical &amp; Event Rules Lead</div>
                    </div>
                    <a
                      href="mailto:aashmitanand15.8@gmail.com?subject=TechXpo%20Rules%20Inquiry"
                      className="px-2.5 py-1 rounded-lg bg-primary/20 hover:bg-primary text-primary hover:text-darkNavy font-mono font-bold text-[10px] transition-all"
                    >
                      Email
                    </a>
                  </div>

                  {/* Coordinator 3 */}
                  <div className="p-3 rounded-xl bg-darkNavy/60 border border-white/5 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white text-sm">Subha Pain</div>
                      <div className="text-[11px] text-gray-300 font-mono font-medium">Secretariat &amp; Delegate Clearance</div>
                    </div>
                    <a
                      href="tel:+918709658260"
                      className="px-2.5 py-1 rounded-lg bg-accent/20 hover:bg-accent text-accent hover:text-darkNavy font-mono font-bold text-[10px] transition-all"
                    >
                      Call
                    </a>
                  </div>
                </div>
              </div>

              {/* Secretariat Working Hours */}
              <div className="glass-panel p-5 rounded-2xl border border-primary/20 space-y-3">
                <div className="flex items-center space-x-2 text-xs font-mono text-gray-400 uppercase tracking-wider">
                  <Clock className="w-3.5 h-3.5 text-accent" />
                  <span>Support Schedule &amp; Desk Timings</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-white/5 text-gray-300">
                    <span>Monday &ndash; Saturday</span>
                    <span className="font-mono font-bold text-white">09:00 AM &ndash; 07:00 PM IST</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5 text-gray-300">
                    <span>Sunday &amp; General Holidays</span>
                    <span className="font-mono font-bold text-emerald-400">WhatsApp Desk Only</span>
                  </div>
                  <div className="flex justify-between py-1 text-gray-300">
                    <span>TechXpo 2.O Event Days</span>
                    <span className="font-mono font-bold text-accent">24-Hour Arena Operations</span>
                  </div>
                </div>
              </div>

              {/* Official Social Media Channels */}
              <div className="glass-panel p-5 rounded-2xl border border-primary/20 space-y-3">
                <h4 className="text-xs font-mono uppercase tracking-wider text-gray-400">
                  Follow Official Social Channels
                </h4>
                <div className="grid grid-cols-1 gap-2.5">
                  {socialLinks.map((s) => (
                    <a
                      key={s.name}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-xl bg-darkNavy/70 border border-primary/20 hover:border-accent hover:bg-primary/10 transition-all duration-200 group"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-darkNavy border border-primary/40 flex items-center justify-center text-accent group-hover:text-white transition-colors">
                          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                            <path d={s.icon} />
                          </svg>
                        </div>
                        <div>
                          <div className="text-white font-bold text-xs">{s.name}</div>
                          <div className="text-[10px] text-gray-400 font-mono">{s.handle}</div>
                        </div>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-gray-500 group-hover:text-accent transition-colors" />
                    </a>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Column (7 cols): Clean Interactive Inquiry Transmission Form */}
            <div className="lg:col-span-7">
              <div className="glass-panel p-6 sm:p-10 rounded-2xl sm:rounded-3xl border border-primary/30 shadow-2xl space-y-6">
                <div>
                  <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-primary/10 text-primary text-[11px] font-mono font-semibold mb-2">
                    <Sparkles className="w-3 h-3 text-accent" />
                    <span>DIRECT DISPATCH TO SECRETARIAT</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black font-orbitron text-white">
                    Send an Inquiry
                  </h2>
                  <p className="text-gray-400 text-xs sm:text-sm mt-1">
                    Fill out this form and our team will follow up via email or WhatsApp promptly.
                  </p>
                </div>

                {/* Inline Error Alert */}
                {errorMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center space-x-2 text-rose-300 text-xs font-mono"
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                    <span>{errorMsg}</span>
                  </motion.div>
                )}

                {submitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3"
                  >
                    <div className="w-14 h-14 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 mx-auto shadow-neon">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold font-orbitron text-white">
                      Transmission Received!
                    </h3>
                    <p className="text-gray-300 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
                      Thank you for contacting Circuitron TechXpo 2.O. An organizing coordinator has received your message and will respond shortly.
                    </p>
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => setSubmitted(false)}
                        className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-mono transition-all"
                      >
                        Send Another Inquiry &rarr;
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                    
                    {/* Honeypot anti-spam field */}
                    <input
                      type="text"
                      name="hp"
                      value={formData.hp}
                      onChange={(e) => setFormData((p) => ({ ...p, hp: e.target.value }))}
                      tabIndex={-1}
                      autoComplete="off"
                      className="hidden"
                      aria-hidden="true"
                    />

                    {/* Inquiry Category Select */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] sm:text-xs font-semibold text-gray-300 uppercase tracking-wider block">
                        Inquiry Topic / Department *
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 sm:px-4 sm:py-3 bg-darkNavy/80 border border-primary/25 rounded-xl text-white focus:outline-none focus:border-accent text-xs sm:text-sm appearance-none cursor-pointer"
                      >
                        {inquiryCategories.map((cat) => (
                          <option key={cat} value={cat} className="bg-darkNavy text-white">
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                      {/* Name */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] sm:text-xs font-semibold text-gray-300 uppercase tracking-wider block">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          maxLength={80}
                          placeholder="e.g. Amit Sharma"
                          className="w-full px-3.5 py-2.5 sm:px-4 sm:py-3 bg-darkNavy/80 border border-primary/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-accent text-xs sm:text-sm"
                        />
                      </div>

                      {/* Email */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] sm:text-xs font-semibold text-gray-300 uppercase tracking-wider block">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          maxLength={100}
                          placeholder="name@college.edu"
                          className="w-full px-3.5 py-2.5 sm:px-4 sm:py-3 bg-darkNavy/80 border border-primary/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-accent text-xs sm:text-sm"
                        />
                      </div>
                    </div>

                    {/* Specific Subject */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] sm:text-xs font-semibold text-gray-300 uppercase tracking-wider block">
                        Subject / Brief Header (Optional)
                      </label>
                      <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        maxLength={120}
                        placeholder="e.g. Question on Robo War weight specs / Hostel check-in"
                        className="w-full px-3.5 py-2.5 sm:px-4 sm:py-3 bg-darkNavy/80 border border-primary/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-accent text-xs sm:text-sm"
                      />
                    </div>

                    {/* Message Area */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] sm:text-xs font-semibold text-gray-300 uppercase tracking-wider block">
                          Detailed Message *
                        </label>
                        <span className="text-[10px] text-gray-500 font-mono">
                          {formData.message.length} / 1000
                        </span>
                      </div>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        maxLength={1000}
                        rows={5}
                        placeholder="Write your questions or instructions here..."
                        className="w-full px-3.5 py-2.5 sm:px-4 sm:py-3 bg-darkNavy/80 border border-primary/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-accent text-xs sm:text-sm resize-none"
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full btn-primary py-3.5 text-xs sm:text-sm font-bold flex items-center justify-center space-x-2 shadow-neon disabled:opacity-50 transition-all"
                    >
                      <Send className="w-4 h-4" />
                      <span>{isSubmitting ? "Transmitting to Secretariat..." : "Send Official Message"}</span>
                    </button>
                  </form>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: CAMPUS LOCATION, INTERACTIVE MAP & TRAVEL GUIDE
      ========================================================================= */}
      <section className="py-12 bg-darkNavy/40 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="text-center space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
              <Compass className="w-3.5 h-3.5 text-accent" />
              <span>VENUE &amp; TRANSIT DIRECTIONS</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black font-orbitron text-white">
              How to Reach TechXpo 2.O
            </h2>
            <p className="text-gray-400 text-xs sm:text-sm max-w-xl mx-auto">
              Plan your travel smoothly to RVS College of Engineering &amp; Technology, located on the Ranchi-Jamshedpur Highway (NH-33).
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Interactive Embedded Google Map (7 cols) */}
            <div className="lg:col-span-7 rounded-2xl overflow-hidden border border-primary/30 shadow-2xl bg-darkNavy relative min-h-[360px] flex flex-col">
              <iframe
                title="RVSCET Jamshedpur Campus Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3678.368545802167!2d86.27123017582524!3d22.80530667932822!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39f5e30ff76d3319%3A0x4986ace5ea086802!2sRVS%20College%20of%20Engineering%20and%20Technology!5e0!3m2!1sen!2sin!4v1710000000000!5m2!1sen!2sin"
                width="100%"
                height="100%"
                className="w-full h-full min-h-[360px] border-0 filter contrast-125"
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
              />
              <div className="p-3 bg-darkNavy/90 border-t border-primary/20 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-gray-300">
                <span className="flex items-center space-x-1.5">
                  <MapPin className="w-3.5 h-3.5 text-accent" />
                  <span>Edalbera, Bhilai Pahari, Jamshedpur &bull; NH-33</span>
                </span>
                <a
                  href="https://maps.app.goo.gl/PxfFwyV8UVVcCkex8"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline flex items-center space-x-1 font-bold"
                >
                  <span>Open Full Screen</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Transit & Commute Guidance (5 cols) */}
            <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
              
              <div className="glass-panel p-5 rounded-2xl border border-primary/20 space-y-4">
                <h3 className="font-bold font-orbitron text-white text-base flex items-center space-x-2">
                  <Navigation className="w-4 h-4 text-accent" />
                  <span>Transit Options &amp; Distances</span>
                </h3>

                <div className="space-y-3.5 text-xs">
                  {/* Option 1: Railway */}
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center text-primary flex-shrink-0 mt-0.5">
                      <Train className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-white">Tatanagar Junction (TATA)</div>
                      <div className="text-gray-400 text-[11px] mt-0.5">
                        Distance: <strong>~14 km</strong>. Direct pre-paid autos, auto-rickshaws, and ride-hailing cabs available directly to RVSCET along NH-33.
                      </div>
                    </div>
                  </div>

                  {/* Option 2: Bus Stand */}
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-accent/20 border border-accent/30 flex items-center justify-center text-accent flex-shrink-0 mt-0.5">
                      <Bus className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-white">Mango / Sitaramdera Bus Terminus</div>
                      <div className="text-gray-400 text-[11px] mt-0.5">
                        Distance: <strong>~10 km</strong>. Frequent buses and shared autos ply directly along the Bhilai Pahari route toward Ghatsila/Kharagpur.
                      </div>
                    </div>
                  </div>

                  {/* Option 3: Airport */}
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0 mt-0.5">
                      <Car className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-white">Birsa Munda Airport, Ranchi (IXR)</div>
                      <div className="text-gray-400 text-[11px] mt-0.5">
                        Distance: <strong>~130 km</strong>. Scenic 2.5-hour drive via NH-33 4-lane expressway; direct express cabs operate daily.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Need Travel Assistance Note */}
              <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 text-xs space-y-1.5">
                <div className="font-bold text-white font-orbitron text-xs flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-accent" />
                  <span>Outstation Campus Arrival Guidance</span>
                </div>
                <p className="text-gray-300 text-[11px] leading-relaxed">
                  Delegation teams requiring group transit advice or late-night arrival coordination can inform the hospitality committee 24 hours prior at{" "}
                  <a href="tel:+919631535834" className="text-accent font-mono font-bold hover:underline">
                    +91 96315 35834
                  </a>.
                </p>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: FREQUENTLY ANSWERED QUESTIONS (ACCORDION)
      ========================================================================= */}
      <section className="py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-4xl font-black font-orbitron text-white">
              Frequently Answered Questions
            </h2>
            <p className="text-gray-400 text-xs sm:text-sm">
              Quick clarifications on eligibility, team composition, spot registrations, and credentials.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="glass-card rounded-2xl border border-primary/20 overflow-hidden transition-colors hover:border-primary/40"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between text-white font-semibold text-sm sm:text-base focus:outline-none"
                >
                  <span className="pr-4">{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-accent flex-shrink-0 transition-transform duration-200 ${
                      openFaq === idx ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {openFaq === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-4 sm:px-5 pb-5 text-gray-300 text-xs sm:text-sm leading-relaxed border-t border-white/5 pt-3"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>
    </motion.div>
  );
}
