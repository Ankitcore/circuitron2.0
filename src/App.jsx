import React, { useEffect, Suspense, lazy } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import ScrollProgressBar from "./components/ScrollProgressBar";
import RobotMascotBackground from "./components/RobotMascotBackground";
import PageLoader from "./components/PageLoader";

// Direct Home page import for instantaneous 0ms landing load
import Home from "./pages/Home";

// Lazy load non-critical heavy background animations to eliminate initial paint latency
const ParticlesBackground = lazy(() => import("./components/ParticlesBackground"));
const InteractiveCyberGrid = lazy(() => import("./components/InteractiveCyberGrid"));

// Lazy load secondary routes for on-demand code splitting
const About = lazy(() => import("./pages/About"));
const Events = lazy(() => import("./pages/Events"));
const Team = lazy(() => import("./pages/Team"));
const Gallery = lazy(() => import("./pages/Gallery"));
const Schedule = lazy(() => import("./pages/Schedule"));
const Contact = lazy(() => import("./pages/Contact"));
const Verify = lazy(() => import("./pages/Verify"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Dynamic SEO page title and meta description router hook
function RouteMetadataUpdater() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });

    const titles = {
      "/": "TechXpo 2.O | Circuitron RVSCET Jamshedpur",
      "/about": "About Us & Vision | Circuitron RVSCET",
      "/events": "Competitions & Arenas | TechXpo 2.O",
      "/team": "Official Roster & Committee | TechXpo 2.O",
      "/gallery": "Photo Archive & Moments | TechXpo 2.O",
      "/schedule": "Timeline Schedule & Rounds | TechXpo 2.O",
      "/contact": "Support & Help Desk | TechXpo 2.O",
      "/verify": "Credential Verification | TechXpo 2.O",
    };

    const descriptions = {
      "/": "TechXpo 2.O - The Flagship Technical Symposium by Circuitron, IoT & Embedded System Club at RVSCET Jamshedpur. ₹1,00,000 Grand Prize Pool with 100% Free Registration.",
      "/about": "Discover Circuitron, the official IoT & Embedded Systems Club of RVSCET Jamshedpur. Fostering innovation, robotics, and hardware engineering.",
      "/events": "Explore the three competition arenas: Eklavya, Lakshya, and Arjuna. Win up to ₹1,00,000 in cash prizes and trophies.",
      "/team": "Meet the visionary faculty coordinators, executive leaders, and student operational heads powering TechXpo 2.O.",
      "/gallery": "Browse highlights, robot arena battles, project showcases, and championship moments from previous editions.",
      "/schedule": "Check the official event timeline, check-in schedules, arena testing windows, and closing ceremonies.",
      "/contact": "Contact the TechXpo 2.O secretariat for queries, partnerships, accommodation assistance, and technical guidance.",
      "/verify": "Official digital credential verification portal for TechXpo 2.O delegates, committee members, and executives.",
    };

    if (pathname.startsWith("/verify/")) {
      document.title = "Verify Credential | TechXpo 2.O";
    } else {
      document.title = titles[pathname] || "TechXpo 2.O | Circuitron RVSCET";
    }

    const descMeta = document.querySelector('meta[name="description"]');
    if (descMeta) {
      descMeta.setAttribute(
        "content",
        descriptions[pathname] ||
          "TechXpo 2.O - The Flagship Technical Symposium by Circuitron at RVSCET Jamshedpur."
      );
    }

    // Google Analytics 4 SPA Route Tracking
    if (typeof window !== "undefined" && typeof window.gtag === "function") {
      window.gtag("event", "page_view", {
        page_path: pathname,
        page_title: document.title,
        page_location: window.location.href,
      });
    }
  }, [pathname]);

  return null;
}

export default function App() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#050816] text-white relative selection:bg-accent selection:text-darkNavy">
      <ScrollProgressBar />
      <RouteMetadataUpdater />
      <Suspense fallback={null}>
        <InteractiveCyberGrid />
      </Suspense>
      <Suspense fallback={null}>
        <ParticlesBackground />
      </Suspense>
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
              <Route path="/verify" element={<Verify />} />
              <Route path="/verify/:id" element={<Verify />} />
              {/* Custom 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AnimatePresence>
        </Suspense>
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
}
