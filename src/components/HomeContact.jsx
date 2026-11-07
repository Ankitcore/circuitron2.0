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
                    <a href="tel:+917979807498" className="text-accent hover:text-white font-mono text-xs font-bold transition-colors">
                      +91 79798 07498
                    </a>
                    <a href="tel:+919631535834" className="text-accent hover:text-white font-mono text-xs font-bold transition-colors">
                      +91 96315 35834
                    </a>
                  </div>
                  <p className="text-gray-400 text-xs mt-0.5">Available 09:00 AM &ndash; 07:00 PM</p>
                </div>
              </div>

              {/* WhatsApp Quick Chat */}
              <div className="glass-card p-5 rounded-xl border border-emerald-500/30 flex items-start space-x-4 bg-emerald-500/5">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 flex-shrink-0">
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.969.529 1.838.814 2.791.814 3.18 0 5.766-2.587 5.766-5.766.001-3.18-2.585-5.766-5.767-5.766zm3.374 8.172c-.145.407-.744.75-1.031.796-.287.045-.662.064-2.138-.544-1.884-.776-3.1-2.673-3.194-.799-.094-.125-.75-.998-.75-1.905 0-.907.469-1.353.636-1.54.168-.188.375-.235.5-.235.126 0 .25.002.359.007.115.006.269-.044.421.323.157.38.536 1.309.584 1.405.048.096.08.209.016.335-.064.126-.096.205-.19.314-.095.11-.2.245-.286.33-.095.093-.194.195-.083.385.111.19.493.813 1.058 1.316.726.647 1.338.847 1.528.941.19.094.302.079.414-.047.113-.127.483-.561.611-.754.128-.192.257-.16.433-.095.176.064 1.116.526 1.309.622.193.096.321.144.368.225.047.081.047.47-.098.877z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-bold font-orbitron text-sm">Instant WhatsApp Helpline</h4>
                  <a
                    href="https://wa.me/917979807498?text=Hello%20Circuitron%20RVSCET,%20I%20have%20an%20inquiry%20regarding%20TechXpo%202.O"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-400 hover:text-emerald-300 font-mono text-xs font-bold transition-colors inline-flex items-center space-x-1 mt-0.5"
                  >
                    <span>+91 79798 07498 &bull; Chat with Organizers</span>
                  </a>
                  <p className="text-gray-400 text-xs mt-0.5">Quick responses on WhatsApp</p>
                </div>
              </div>

              <div className="glass-card p-5 rounded-xl border border-primary/20 flex items-start space-x-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 flex-shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-white font-bold font-orbitron text-sm">Venue Location</h4>
                  <p className="text-gray-300 text-sm">
                    RVS College of Engineering &amp; Technology
                  </p>
                  <p className="text-gray-400 text-xs mt-0.5">
                    Edalbera, PO- Bhilai Pahari, Jamshedpur - 831001
                  </p>
                </div>
              </div>
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
