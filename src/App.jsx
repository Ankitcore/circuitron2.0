import React, { useEffect, Suspense, lazy } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ParticlesBackground from "./components/ParticlesBackground";
import ScrollToTop from "./components/ScrollToTop";
import ScrollProgressBar from "./components/ScrollProgressBar";
import RobotMascotBackground from "./components/RobotMascotBackground";
import InteractiveCyberGrid from "./components/InteractiveCyberGrid";
import PageLoader from "./components/PageLoader";

const Home = lazy(() => import("./pages/Home"));
const About = lazy(() => import("./pages/About"));
const Events = lazy(() => import("./pages/Events"));
const Team = lazy(() => import("./pages/Team"));
const Gallery = lazy(() => import("./pages/Gallery"));
const Schedule = lazy(() => import("./pages/Schedule"));
const Contact = lazy(() => import("./pages/Contact"));

function ScrollToTopOnRoute() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}

export default function App() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#050816] text-white relative selection:bg-accent selection:text-darkNavy">
      <ScrollProgressBar />
      <ScrollToTopOnRoute />
      <InteractiveCyberGrid />
      <ParticlesBackground />
      <RobotMascotBackground />
      <div
        className="fixed inset-0 circuit-bg opacity-30 pointer-events-none"
        style={{ zIndex: 0 }}
      />
      <div
        className="fixed inset-0 circuit-bg-glow pointer-events-none"
        style={{ zIndex: 0 }}
      />
      <Navbar />
      <main className="relative z-10">
        <Suspense fallback={<PageLoader />}>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/events" element={<Events />} />
              <Route path="/team" element={<Team />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/schedule" element={<Schedule />} />
              <Route path="/contact" element={<Contact />} />
              {/* Fallback route */}
              <Route path="*" element={<Home />} />
            </Routes>
          </AnimatePresence>
        </Suspense>
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
}
