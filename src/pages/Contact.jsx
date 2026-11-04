import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Phone, MapPin, Send, CheckCircle2, Sparkles, ExternalLink, MessageSquare, ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "Who is eligible to participate in TechXpo 2.O?",
    a: "TechXpo 2.O is open to all bona-fide students currently enrolled in B.Tech, Diploma, BCA/MCA, or B.Sc programs across recognized universities and polytechnics.",
  },
  {
    q: "Can team members be from different colleges or branches?",
    a: "Yes! Inter-departmental and inter-collegiate teams are permitted for both Project Exhibition and Robotics competitions (Robo War, Robo Race).",
  },
  {
    q: "Is spot registration available on the event day?",
    a: "While spot registration may be accommodated subject to slot availability, we strongly recommend registering in advance via our online forms to guarantee team slots and arena test windows.",
  },
  {
    q: "Will accommodation and food be provided for outstation participants?",
    a: "Basic accommodation support and dining facilities within the campus hostels can be arranged on prior request. Reach out to circuitron@rvscet.ac.in for assistance.",
  },
];

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  // Security: Clean and sanitize inputs against XSS and script injections
  const sanitizeInput = (val, maxLen = 200) => {
    if (typeof val !== "string") return "";
    return val
      .replace(/<[^>]*>?/gm, "") // strip HTML tags
      .replace(/javascript:/gi, "") // strip pseudo-protocols
      .slice(0, maxLen);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const maxLen = name === "message" ? 1000 : name === "subject" ? 120 : name === "email" ? 100 : 60;
    setFormData((prev) => ({ ...prev, [name]: sanitizeInput(value, maxLen) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      alert("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setIsSubmitting(false);
      setFormData({ name: "", email: "", subject: "", message: "" });
    }, 4000);
  };

  const contactCards = [
    {
      icon: <Mail className="w-6 h-6 text-primary" />,
      title: "Direct Emails",
      details: ["circuitron@rvscet.ac.in", "techxpo2026@rvscet.ac.in"],
      action: "mailto:circuitron@rvscet.ac.in",
      actionText: "Send Email",
    },
    {
      icon: <Phone className="w-6 h-6 text-accent" />,
      title: "Campus Secretariat",
      details: ["+91 657 2364402", "+91 657 2364403"],
      action: "tel:+916572364402",
      actionText: "Call RVSCET Desk",
    },
    {
      icon: (
        <img
          src="/assets/rvscet-logo.webp"
          alt="RVSCET"
          className="w-6 h-6 object-contain"
        />
      ),
      title: "Campus Address",
      details: ["RVS College of Engineering & Technology", "Jamshedpur, Jharkhand - 831001"],
      action: "https://maps.google.com/?q=RVSCET+Jamshedpur",
      actionText: "Open in Maps",
    },
  ];

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
            <span>24/7 SUPPORT DESK</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-black font-orbitron gradient-text">
            Contact &amp; Assistance
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded-full" />
          <p className="text-gray-300 max-w-2xl mx-auto text-base sm:text-lg">
            Reach out to the organizing committee for technical clarifications, sponsorship partnerships, or campus venue logistics.
          </p>
        </div>
      </section>

      {/* Main Grid: Info + Form */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Info Cards Column (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="space-y-4">
                <h2 className="text-3xl font-black font-orbitron text-white">
                  Get In Touch Directly
                </h2>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Our coordinator desk is available throughout the week to resolve participant and faculty queries.
                </p>
              </div>

              <div className="space-y-4">
                {contactCards.map((card) => (
                  <div
                    key={card.title}
                    className="glass-card p-6 rounded-2xl border border-primary/20 flex flex-col justify-between"
                  >
                    <div className="flex items-start space-x-4 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-darkNavy/80 border border-primary/30 flex items-center justify-center flex-shrink-0">
                        {card.icon}
                      </div>
                      <div>
                        <h3 className="font-bold font-orbitron text-white text-base">
                          {card.title}
                        </h3>
                        {card.details.map((d, i) => (
                          <p key={i} className="text-gray-300 text-xs mt-0.5">
                            {d}
                          </p>
                        ))}
                      </div>
                    </div>

                    <a
                      href={card.action}
                      target={card.action.startsWith("http") ? "_blank" : undefined}
                      rel={card.action.startsWith("http") ? "noopener noreferrer" : undefined}
                      className="inline-flex items-center space-x-1 text-xs font-semibold text-accent hover:underline self-end"
                    >
                      <span>{card.actionText}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ))}
              </div>

              {/* Social Channels */}
              <div className="glass-panel p-6 rounded-2xl border border-primary/20 space-y-3">
                <h4 className="text-xs font-mono uppercase tracking-wider text-gray-400">
                  Follow Official Updates
                </h4>
                <div className="flex items-center space-x-3">
                  {socialLinks.map((s) => (
                    <a
                      key={s.name}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-xl bg-darkNavy border border-primary/40 flex items-center justify-center text-accent hover:text-white hover:bg-primary/20 hover:border-accent hover:shadow-neon transition-all duration-200 group"
                      aria-label={s.name}
                    >
                      <svg className="w-5 h-5 fill-current" fill="currentColor" viewBox="0 0 24 24">
                        <path d={s.icon} fill="currentColor" />
                      </svg>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Form Column (7 cols) */}
            <div className="lg:col-span-7">
              <div className="glass-panel p-5 sm:p-10 rounded-2xl sm:rounded-3xl border border-primary/30 shadow-2xl space-y-5 sm:space-y-6">
                <div>
                  <h3 className="text-xl sm:text-2xl font-black font-orbitron text-white">
                    Send a Message
                  </h3>
                  <p className="text-gray-400 text-xs sm:text-sm mt-1">
                    Fill out the inquiry form and our response team will email you promptly.
                  </p>
                </div>

                {submitted ? (
                  <div className="p-6 sm:p-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
                    <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-400 mx-auto" />
                    <h4 className="text-lg sm:text-xl font-bold font-orbitron text-white">
                      Message Received!
                    </h4>
                    <p className="text-gray-300 text-xs sm:text-sm">
                      Thank you for contacting Circuitron. A coordinator will reply via email shortly.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                      <div className="space-y-1.5">
                        <label className="text-[11px] sm:text-xs font-semibold text-gray-300 uppercase tracking-wider">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          maxLength={60}
                          placeholder="Your full name"
                          className="w-full px-3.5 py-2.5 sm:px-4 sm:py-3 bg-darkNavy/80 border border-primary/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-accent text-xs sm:text-sm"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] sm:text-xs font-semibold text-gray-300 uppercase tracking-wider">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          maxLength={100}
                          placeholder="you@domain.com"
                          className="w-full px-3.5 py-2.5 sm:px-4 sm:py-3 bg-darkNavy/80 border border-primary/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-accent text-xs sm:text-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] sm:text-xs font-semibold text-gray-300 uppercase tracking-wider">
                        Subject / Query Domain *
                      </label>
                      <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        maxLength={120}
                        placeholder="e.g. Robo War Rules Clarification"
                        className="w-full px-3.5 py-2.5 sm:px-4 sm:py-3 bg-darkNavy/80 border border-primary/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-accent text-xs sm:text-sm"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] sm:text-xs font-semibold text-gray-300 uppercase tracking-wider">
                        Message *
                      </label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        maxLength={1000}
                        rows={4}
                        placeholder="Describe your inquiry with relevant details..."
                        className="w-full px-3.5 py-2.5 sm:px-4 sm:py-3 bg-darkNavy/80 border border-primary/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-accent text-xs sm:text-sm resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full btn-primary py-3 sm:py-4 text-xs sm:text-sm font-bold min-h-[44px]"
                    >
                      <Send className="w-4 h-4 mr-1.5 inline" />
                      <span>Transmit Inquiries</span>
                    </button>
                  </form>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="py-16 bg-gradient-to-b from-transparent via-primary/5 to-transparent">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-12">
            <span className="text-xs font-mono uppercase tracking-wider text-accent font-semibold">
              QUICK ANSWERS
            </span>
            <h2 className="text-3xl sm:text-4xl font-black font-orbitron text-white">
              Frequently Asked Questions
            </h2>
            <div className="w-16 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded-full" />
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="glass-card rounded-2xl border border-primary/20 overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full p-4 sm:p-6 text-left flex items-center justify-between space-x-3 sm:space-x-4 focus:outline-none min-h-[48px]"
                  >
                    <span className="font-orbitron font-bold text-white text-xs sm:text-base">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 sm:w-5 sm:h-5 text-accent flex-shrink-0 transition-transform duration-300 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="px-4 pb-4 sm:px-6 sm:pb-6 text-xs sm:text-sm text-gray-300 leading-relaxed border-t border-white/5 pt-3 sm:pt-4">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </motion.div>
  );
}
