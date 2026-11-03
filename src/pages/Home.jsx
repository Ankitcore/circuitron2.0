import React from "react";
import { motion } from "framer-motion";
import Hero from "../components/Hero";
import Stats from "../components/Stats";
import FeaturedEvents from "../components/FeaturedEvents";
import HomeGallery from "../components/HomeGallery";
import HomeTeam from "../components/HomeTeam";
import HomeContact from "../components/HomeContact";

export default function Home() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Hero />
      <Stats />
      <FeaturedEvents />
      <HomeGallery />
      <HomeTeam />
      <HomeContact />
    </motion.div>
  );
}
