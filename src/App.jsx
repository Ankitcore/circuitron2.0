import React, { useEffect, Suspense, lazy } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import FloatingWhatsApp from "./components/FloatingWhatsApp";
import ScrollProgressBar from "./components/ScrollProgressBar";
import RobotMascotBackground from "./components/RobotMascotBackground";
import PageLoader from "./components/PageLoader";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react";
import { shouldReduceMotion, isLowEndDevice } from "./utils/performance";

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
const AdminPortal = lazy(() => import("./pages/AdminPortal"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Dynamic SEO page title, metadata, canonical URL, and Open Graph router hook
function RouteMetadataUpdater() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });

    const baseUrl = "https://circuitron.in";
    const canonicalUrl = `${baseUrl}${pathname === "/" ? "" : pathname}`;

    const seoConfig = {
      "/": {
        title: "TechXpo 2.O | Circuitron RVSCET Jamshedpur - Technical Symposium & Robotics Fest",
        description: "TechXpo 2.O - Eastern India's Flagship Technical Symposium by Circuitron at RVSCET Jamshedpur. ₹1,00,000 Grand Prize Pool with 100% Free Registration. Compete in Robo War, Robo Race, Line Follower, and Project Exhibition.",
        keywords: "TechXpo 2.0, Circuitron, RVSCET Jamshedpur, robotics competition, Robo War, Robo Race, Line Follower Robot, Project Exhibition, tech fest Jharkhand, engineering symposium India",
      },
      "/events": {
        title: "Events & Competitions | TechXpo 2.O - Circuitron RVSCET",
        description: "Explore high-stakes robotics competitions and hardware exhibits: Robo War, Robo Race, Line Follower Robot, Circuit Craze, and Code Hunt with ₹1,00,000 in grand cash prizes.",
        keywords: "Robo War Jamshedpur, Robo Race competition, Line Follower challenge, Project Exhibition RVSCET, Circuit Craze, Code Hunt, robotics tournament prizes",
      },
      "/about": {
        title: "About Us & Vision | Circuitron - IoT & Embedded Systems Club RVSCET",
        description: "Discover Circuitron, the official IoT & Embedded Systems Club of RVSCET Jamshedpur. Empowering future engineers through robotics, hardware innovation, and practical workshops.",
        keywords: "About Circuitron, RVSCET robotics club, IoT club Jamshedpur, embedded systems club Jharkhand, engineering innovation RVSCET",
      },
      "/team": {
        title: "Official Roster & Committee | TechXpo 2.O - Circuitron RVSCET",
        description: "Meet the visionary faculty coordinators, executive leadership team, and operational heads steering TechXpo 2.O at RVSCET Jamshedpur.",
        keywords: "TechXpo team, Circuitron coordinators, Dr Sushanta Mahanty, Dr Vikash Kumar, student committee RVSCET, executive leaders",
      },
      "/schedule": {
        title: "Event Schedule & Timeline | TechXpo 2.O - RVSCET Jamshedpur",
        description: "Comprehensive day-wise timeline, reporting times, arena testing slots, knockout rounds, and grand felicitation ceremonies for TechXpo 2.O.",
        keywords: "TechXpo schedule, robotics event timing, RoboWar schedule, RVSCET event timeline, technical symposium rounds",
      },
      "/gallery": {
        title: "Moments & Gallery Archive | TechXpo 2.O - Circuitron RVSCET",
        description: "Explore photos, arena battle highlights, winning robot prototypes, and grand championship celebrations from TechXpo.",
        keywords: "TechXpo photos, robotics battle images, RVSCET tech fest gallery, Circuitron event moments, championship highlights",
      },
      "/contact": {
        title: "Contact & Venue Support | TechXpo 2.O - RVSCET Jamshedpur",
        description: "Get in touch with the TechXpo 2.O Secretariat for registration inquiries, travel directions, accommodation assistance, and technical guidance at RVSCET Jamshedpur.",
        keywords: "TechXpo contact, RVSCET Jamshedpur address, how to reach RVSCET, Circuitron email, event support desk",
      },
      "/verify": {
        title: "Official Credential Verification | TechXpo 2.O - Circuitron",
        description: "Public authentication portal to verify official digital ID cards and credentials issued to TechXpo 2.O delegates, committee members, and executives.",
        keywords: "Verify TechXpo badge, credential verification, ID card QR check, Circuitron certificate verification",
      },
      "/admin": {
        title: "Secretariat Admin Portal | TechXpo 2.O",
        description: "Authorized clearance required to manage delegates, volunteers, executive rosters, and issue official ID cards.",
        keywords: "TechXpo admin",
        noindex: true,
      },
    };

    let current = seoConfig[pathname];
    if (!current) {
      if (pathname.startsWith("/verify/")) {
        const memberId = pathname.replace("/verify/", "").toUpperCase();
        current = {
          title: `Verify Credential ${memberId} | TechXpo 2.O`,
          description: `Official verification dossier for credential ${memberId} at TechXpo 2.O, Circuitron RVSCET Jamshedpur.`,
          keywords: `TechXpo ID ${memberId}, credential verification, RVSCET badge`,
        };
      } else {
        current = {
          title: "TechXpo 2.O | Circuitron RVSCET Jamshedpur",
          description: "TechXpo 2.O - The Flagship Technical Symposium by Circuitron at RVSCET Jamshedpur. ₹1,00,000 Grand Prize Pool with 100% Free Registration.",
          keywords: "TechXpo 2.0, Circuitron, RVSCET, Robotics, Technical Symposium",
        };
      }
    }

    // 1. Document Title
    document.title = current.title;

    // Helper to safely set meta attributes
    const setMeta = (selector, attr, value) => {
      const tag = document.querySelector(selector);
      if (tag && value) {
        tag.setAttribute(attr, value);
      }
    };

    setMeta('meta[name="title"]', "content", current.title);
    setMeta('meta[name="description"]', "content", current.description);
    if (current.keywords) {
      setMeta('meta[name="keywords"]', "content", current.keywords);
    }

    // 2. Canonical URL
    setMeta('link[rel="canonical"]', "href", canonicalUrl);

    // 3. Open Graph
    setMeta('meta[property="og:title"]', "content", current.title);
    setMeta('meta[property="og:description"]', "content", current.description);
    setMeta('meta[property="og:url"]', "content", canonicalUrl);

    // 4. Twitter
    setMeta('meta[name="twitter:title"]', "content", current.title);
    setMeta('meta[name="twitter:description"]', "content", current.description);
    setMeta('meta[name="twitter:url"]', "content", canonicalUrl);

    // 5. Robots indexing control (noindex for /admin)
    const robotsTag = document.querySelector('meta[name="robots"]');
    if (robotsTag) {
      robotsTag.setAttribute(
        "content",
        current.noindex
          ? "noindex, nofollow"
          : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
      );
    }

    // 6. Google Analytics 4 SPA Route Tracking
    if (typeof window !== "undefined" && typeof window.gtag === "function") {
      window.gtag("event", "page_view", {
        page_path: pathname,
        page_title: current.title,
        page_location: window.location.href,
      });
    }
  }, [pathname]);

  return null;
}

export default function App() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");
  const [allowParticles] = React.useState(() => {
    if (typeof window === "undefined") return false;
    return !shouldReduceMotion() && !isLowEndDevice();
  });

  return (
    <div className="min-h-screen bg-[#050816] text-white relative selection:bg-accent selection:text-darkNavy overflow-x-hidden w-full max-w-full">
      <ScrollProgressBar />
      <RouteMetadataUpdater />
      <Suspense fallback={null}>
        <InteractiveCyberGrid />
      </Suspense>
      {allowParticles && (
        <Suspense fallback={null}>
          <ParticlesBackground />
        </Suspense>
      )}
      <RobotMascotBackground />
      <div
        className="fixed inset-0 circuit-bg opacity-30 pointer-events-none"
        style={{ zIndex: 0, willChange: "transform", transform: "translateZ(0)" }}
      />
      <div
        className="fixed inset-0 circuit-bg-glow pointer-events-none"
        style={{ zIndex: 0, willChange: "transform", transform: "translateZ(0)" }}
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
              <Route path="/admin" element={<AdminPortal />} />
              {/* Custom 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AnimatePresence>
        </Suspense>
      </main>
      {!isAdmin && <Footer />}
      {!isAdmin && <ScrollToTop />}
      {!isAdmin && <FloatingWhatsApp />}
      <SpeedInsights />
      <Analytics />
    </div>
  );
}
