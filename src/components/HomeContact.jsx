import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, MessageSquare, CheckCircle2, Sparkles, AlertCircle } from "lucide-react";

export default function HomeContact() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Security: Clean and sanitize inputs against XSS and script injections
  const sanitizeInput = (val, maxLen = 200) => {
    if (typeof val !== "string") return "";
    return val
      .replace(/<[^>]*>?/gm, "")
      .replace(/javascript:/gi, "")
      .slice(0, maxLen);
  };

  const handleChange = (e) => {
    setErrorMsg("");
    const { name, value } = e.target;
    const maxLen = name === "message" ? 1000 : name === "email" ? 100 : 60;
    setFormData((prev) => ({ ...prev, [name]: sanitizeInput(value, maxLen) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!formData.name.trim() || formData.name.trim().length < 2) {
      setErrorMsg("Please enter your name.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    if (!formData.message.trim() || formData.message.trim().length < 10) {
      setErrorMsg("Please enter a message of at least 10 characters.");
      return;
    }

    setErrorMsg("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          message: formData.message.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSubmitted(true);
        setFormData({ name: "", email: "", message: "" });
        setTimeout(() => setSubmitted(false), 5000);
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

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Direct Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="lg:col-span-5 space-y-8"
          >
            <div className="space-y-4">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
                <Sparkles className="w-3.5 h-3.5" />
                <span>COMMUNICATION CHANNEL</span>
              </div>
              <h2 className="text-4xl sm:text-5xl font-black font-orbitron gradient-text">
                Connect With Us
              </h2>
              <div className="w-20 h-1 bg-gradient-to-r from-primary to-accent rounded-full" />
              <p className="text-gray-300 leading-relaxed text-base sm:text-lg">
                Have questions regarding event rulebooks, team registrations, travel guidance, or campus accommodation?
                Drop us a line and our organizing team will assist promptly.
              </p>
            </div>

            <div className="space-y-4">
              <div className="glass-card p-5 rounded-xl border border-primary/20 flex items-start space-x-4">
                <div className="w-12 h-12 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary flex-shrink-0">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-white font-bold font-orbitron text-sm">Official Inquiries</h4>
                  <a
                    href="mailto:circuitronrvscet@gmail.com"
                    className="text-primary hover:text-accent transition-colors text-sm font-semibold block font-mono"
                  >
                    circuitronrvscet@gmail.com
                  </a>
                  <p className="text-gray-400 text-xs mt-0.5">Response within 24 hours</p>
                </div>
              </div>

              <div className="glass-card p-5 rounded-xl border border-primary/20 flex items-start space-x-4">
                <div className="w-12 h-12 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center text-accent flex-shrink-0">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-white font-bold font-orbitron text-sm">Campus Secretariat Helpline</h4>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 mt-0.5">
                    <a href="tel:+919631535834" className="text-accent hover:text-white font-mono text-xs font-bold transition-colors">
                      +91 96315 35834
                    </a>
                    <a href="tel:+918709658260" className="text-accent hover:text-white font-mono text-xs font-bold transition-colors">
                      +91 87096 58260
                    </a>
                  </div>
                  <p className="text-gray-400 text-xs mt-0.5">Available 09:00 AM &ndash; 07:00 PM</p>
                </div>
              </div>

              {/* WhatsApp Quick Chat */}
              <div className="glass-card p-5 rounded-xl border border-emerald-500/30 flex items-start space-x-4 bg-emerald-500/5">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 flex-shrink-0">
                  <svg className="w-6 h-6 fill-current text-emerald-400" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-bold font-orbitron text-sm">Instant WhatsApp Helpline</h4>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-0.5">
                    <a
                      href="https://wa.me/919631535834?text=Hello%20Circuitron%20RVSCET,%20I%20have%20an%20inquiry%20regarding%20TechXpo%202.O"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-400 hover:text-emerald-300 font-mono text-xs font-bold transition-colors inline-flex items-center space-x-1"
                    >
                      <span>+91 96315 35834</span>
                    </a>
                    <span className="text-emerald-500/50">&bull;</span>
                    <a
                      href="https://wa.me/918709658260?text=Hello%20Circuitron%20RVSCET,%20I%20have%20an%20inquiry%20regarding%20TechXpo%202.O"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-400 hover:text-emerald-300 font-mono text-xs font-bold transition-colors inline-flex items-center space-x-1"
                    >
                      <span>+91 87096 58260</span>
                    </a>
                  </div>
                  <p className="text-gray-400 text-xs mt-0.5">Quick responses on WhatsApp &bull; Chat with Organizers</p>
                </div>
              </div>

              <a
                href="https://maps.app.goo.gl/PxfFwyV8UVVcCkex8"
                target="_blank"
                rel="noopener noreferrer"
                className="glass-card p-5 rounded-xl border border-primary/20 hover:border-purple-500/40 flex items-start space-x-4 transition-all duration-300 group block"
                title="Open Venue on Google Maps"
              >
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 flex-shrink-0 group-hover:scale-110 transition-transform">
                  <MapPin className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-white font-bold font-orbitron text-sm group-hover:text-purple-300 transition-colors">
                      Venue Location
                    </h4>
                    <span className="text-[10px] font-mono text-purple-400 flex items-center gap-1 group-hover:underline">
                      Maps &rarr;
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm">
                    RVS College of Engineering &amp; Technology
                  </p>
                  <p className="text-gray-400 text-xs mt-0.5">
                    Edalbera, PO- Bhilai Pahari, Jamshedpur - 831001
                  </p>
                </div>
              </a>
            </div>
          </motion.div>

          {/* Right Column: Sleek Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="lg:col-span-7 glass-panel p-8 sm:p-10 rounded-3xl border border-primary/30 shadow-2xl relative"
          >
            <h3 className="text-2xl font-bold font-orbitron text-white mb-2">
              Send a Direct Message
            </h3>
            <p className="text-gray-400 text-sm mb-6">
              Fill out the query form below and we'll connect with you shortly.
            </p>

            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center space-x-2 text-red-400 text-xs font-mono"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </motion.div>
            )}

            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3"
              >
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h4 className="text-xl font-bold font-orbitron text-white">Message Transmitted!</h4>
                <p className="text-gray-300 text-sm">
                  Thank you for reaching out. A Circuitron coordinator will get back to you shortly.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      maxLength={60}
                      placeholder="e.g. Alex Sharma"
                      className="w-full px-4 py-3 bg-darkNavy/80 border border-primary/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      maxLength={100}
                      placeholder="e.g. alex@college.edu"
                      className="w-full px-4 py-3 bg-darkNavy/80 border border-primary/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Message / Question *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    maxLength={1000}
                    rows={4}
                    placeholder="Tell us what you'd like to know about TechXpo 2.O..."
                    className="w-full px-4 py-3 bg-darkNavy/80 border border-primary/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-sm resize-none"
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full btn-primary py-3.5 text-sm font-bold flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? "Transmitting..." : "Transmit Message"}</span>
                </motion.button>
              </form>
            )}
          </motion.div>

        </div>
      </div>
    </section>
  );
}
