import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, MapPin, Send, MessageSquare, CheckCircle2, Sparkles } from "lucide-react";

export default function HomeContact() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: "", email: "", message: "" });
    }, 4000);
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
                    href="mailto:circuitron@rvscet.ac.in"
                    className="text-primary hover:text-accent transition-colors text-sm font-semibold"
                  >
                    circuitron@rvscet.ac.in
                  </a>
                  <p className="text-gray-400 text-xs mt-0.5">Response within 24 hours</p>
                </div>
              </div>

              <div className="glass-card p-5 rounded-xl border border-primary/20 flex items-start space-x-4">
                <div className="w-12 h-12 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center text-accent flex-shrink-0">
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
                    rows={4}
                    placeholder="Tell us what you'd like to know about TechXpo 2026..."
                    className="w-full px-4 py-3 bg-darkNavy/80 border border-primary/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-sm resize-none"
                  />
                </div>

                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full btn-primary py-3.5 text-sm font-bold"
                >
                  <Send className="w-4 h-4" />
                  <span>Transmit Message</span>
                </motion.button>
              </form>
            )}
          </motion.div>

        </div>
      </div>
    </section>
  );
}
