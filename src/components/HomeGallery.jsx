import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Image as ImageIcon, ArrowRight, Sparkles, ZoomIn } from "lucide-react";

const previewImages = [
  {
    id: 1,
    src: "/assets/gallery/IMG-20251024-WA0001.jpg",
    title: "Circuitron Flagship Arena",
    category: "Robo Exhibition",
  },
  {
    id: 2,
    src: "/assets/gallery/IMG-20251024-WA0002.jpg",
    title: "Innovators & Mentors",
    category: "Symposium",
  },
  {
    id: 3,
    src: "/assets/gallery/IMG-20251024-WA0003.jpg",
    title: "Embedded Hardware Stalls",
    category: "Showcase",
  },
  {
    id: 4,
    src: "/assets/gallery/IMG-20251024-WA0004.jpg",
    title: "Student Project Demos",
    category: "Prototyping",
  },
];

export default function HomeGallery() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center space-y-4 mb-16"
        >
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
            <Sparkles className="w-3.5 h-3.5" />
            <span>GLIMPSES OF GLORY</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-black font-orbitron gradient-text">
            Event Highlights &amp; Media
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded-full" />
          <p className="text-gray-300 max-w-2xl mx-auto text-base sm:text-lg">
            Experience the electrifying atmosphere, fierce robotics clashes, and game-changing innovations from our previous chapters.
          </p>
        </motion.div>

        {/* Media Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {previewImages.map((img, index) => (
            <motion.div
              key={img.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -6 }}
              className="group relative rounded-2xl overflow-hidden glass-panel border border-primary/20 aspect-video sm:aspect-[4/3] shadow-lg"
            >
              <img
                src={img.src}
                alt={img.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
              />

              {/* Gradient Scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-darkNavy via-darkNavy/40 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-300 flex flex-col justify-end p-5">
                <span className="text-accent text-[11px] font-semibold tracking-wider uppercase mb-1">
                  {img.category}
                </span>
                <h4 className="text-white font-bold text-base leading-snug group-hover:text-primary transition-colors">
                  {img.title}
                </h4>
              </div>

              {/* Hover Zoom Icon Badge */}
              <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-darkNavy/80 backdrop-blur-md border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white">
                <ZoomIn className="w-4 h-4 text-accent" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* View Full Gallery Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link to="/gallery" className="inline-block">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="btn-secondary">
              <ImageIcon className="w-4 h-4" />
              <span>Explore Complete Photo Gallery</span>
              <ArrowRight className="w-4 h-4" />
            </motion.div>
          </Link>
        </motion.div>

      </div>
    </section>
  );
}
