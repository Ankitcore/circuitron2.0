import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { galleryItems } from "../data/gallery";
import { Sparkles, ZoomIn, X, ChevronLeft, ChevronRight } from "lucide-react";

export default function Gallery() {
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", "Ceremony", "Exhibition", "Robotics", "Workshop"];

  const filteredImages =
    activeCategory === "All"
      ? galleryItems
      : galleryItems.filter((img) => img.category === activeCategory);

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
    setSelectedIdx(null);
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedIdx === null) return;
      if (e.key === "Escape") setSelectedIdx(null);
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIdx, filteredImages]);

  const handlePrev = () => {
    setSelectedIdx((prev) => (prev > 0 ? prev - 1 : filteredImages.length - 1));
  };

  const handleNext = () => {
    setSelectedIdx((prev) => (prev < filteredImages.length - 1 ? prev + 1 : 0));
  };

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
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] rounded-full pointer-events-none opacity-30"
          style={{
            background: "radial-gradient(ellipse at center, rgba(0, 191, 255, 0.18) 0%, transparent 70%)",
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
            <Sparkles className="w-3.5 h-3.5" />
            <span>MEDIA ARCHIVE</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-black font-orbitron gradient-text">
            Photo Gallery
          </h1>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="w-24 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded-full origin-center"
          />
          <p className="text-gray-300 max-w-2xl mx-auto text-base sm:text-lg">
            A visual retrospective of workshops, project demonstrations, and arena battles hosted by Circuitron at RVSCET.
          </p>
        </div>
      </section>

      {/* Filter Tabs */}
      <section className="py-4 sm:py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center overflow-x-auto no-scrollbar gap-2 sm:gap-3 sm:justify-center py-2 px-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`px-4 sm:px-5 py-2 rounded-full text-xs font-semibold transition-all duration-200 border whitespace-nowrap flex-shrink-0 ${
                  activeCategory === cat
                    ? "bg-gradient-to-r from-primary to-accent text-darkNavy font-bold border-transparent shadow-neon"
                    : "glass-card text-gray-300 hover:text-white border-primary/20 hover:border-primary/40"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Bento Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredImages.map((img, index) => (
              <div
                key={img.id}
                onClick={() => setSelectedIdx(index)}
                className="glass-card rounded-2xl overflow-hidden aspect-[4/3] group relative cursor-pointer border border-primary/20 shadow-xl"
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />

                {/* Scrim Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-darkNavy via-darkNavy/40 to-transparent opacity-60 group-hover:opacity-95 transition-opacity duration-300 flex flex-col justify-end p-6">
                  <span className="text-accent text-[11px] font-mono tracking-wider uppercase mb-1">
                    {img.category}
                  </span>
                  <h4 className="text-white font-bold text-lg font-orbitron group-hover:text-primary transition-colors">
                    {img.title}
                  </h4>
                </div>

                <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-darkNavy/80 backdrop-blur-md border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white">
                  <ZoomIn className="w-4 h-4 text-accent" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox Modal with Carousel Controls */}
      <AnimatePresence>
        {selectedIdx !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-darkNavy/95 backdrop-blur-2xl z-50 flex items-center justify-center p-3 sm:p-8"
            onClick={() => setSelectedIdx(null)}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedIdx(null)}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 sm:p-3 rounded-full bg-darkNavy/80 border border-primary/30 hover:bg-white/20 text-white transition-colors z-30 min-w-[38px] min-h-[38px] flex items-center justify-center"
              aria-label="Close"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* Left Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="absolute left-2 sm:left-8 top-1/2 -translate-y-1/2 p-2 sm:p-3 rounded-full bg-darkNavy/80 border border-primary/30 hover:bg-white/20 text-white transition-colors z-30 min-w-[38px] min-h-[38px] flex items-center justify-center shadow-lg"
              aria-label="Previous"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* Right Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute right-2 sm:right-8 top-1/2 -translate-y-1/2 p-2 sm:p-3 rounded-full bg-darkNavy/80 border border-primary/30 hover:bg-white/20 text-white transition-colors z-30 min-w-[38px] min-h-[38px] flex items-center justify-center shadow-lg"
              aria-label="Next"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* Active Image Container */}
            <div
              className="relative max-w-5xl w-full flex flex-col items-center px-8 sm:px-12"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={filteredImages[selectedIdx].src}
                alt={filteredImages[selectedIdx].alt}
                className="max-w-full max-h-[70vh] sm:max-h-[80vh] object-contain rounded-2xl border border-primary/40 shadow-2xl"
              />
              <div className="mt-3 sm:mt-4 text-center">
                <h3 className="text-base sm:text-lg font-bold font-orbitron text-white">
                  {filteredImages[selectedIdx].title}
                </h3>
                <p className="text-xs text-accent font-mono mt-0.5 sm:mt-1">
                  Item {selectedIdx + 1} of {filteredImages.length}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
