import React, { useCallback, useMemo, useEffect, useState } from "react";
import Particles from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { isLowEndDevice, isMobileDevice, shouldReduceMotion } from "../utils/performance";

export default function ParticlesBackground() {
  const [isLowSpec] = useState(() => isLowEndDevice());
  const [isMobile] = useState(() => isMobileDevice());
  const [reduceMotion] = useState(() => shouldReduceMotion());
  const [isScrolling, setIsScrolling] = useState(false);

  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  // Throttle particle rendering during active page scroll to keep scrolling at 60 FPS
  useEffect(() => {
    let scrollTimeout = null;
    const handleScroll = () => {
      if (!isScrolling) setIsScrolling(true);
      if (scrollTimeout) clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        setIsScrolling(false);
      }, 150);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeout) clearTimeout(scrollTimeout);
    };
  }, [isScrolling]);

  const options = useMemo(() => {
    // If user prefers reduced motion or ultra low spec, minimize particle overhead
    if (reduceMotion) {
      return {
        background: { color: { value: "transparent" } },
        fullScreen: { enable: true, zIndex: 1 },
        fpsLimit: 30,
        interactivity: { detectsOn: "window", events: { resize: true } },
        particles: {
          color: { value: ["#00fffc", "#0091ff"] },
          links: { enable: false },
          move: { enable: true, speed: 0.3, direction: "none", outMode: "out" },
          number: { density: { enable: true, area: 1500 }, value: 10 },
          opacity: { value: { min: 0.15, max: 0.4 } },
          shape: { type: "circle" },
          size: { value: { min: 1, max: 2.5 } },
        },
      };
    }

    const lowEnd = isLowSpec || isMobile;

    return {
      background: { color: { value: "transparent" } },
      fullScreen: { enable: true, zIndex: 1 },
      fpsLimit: lowEnd ? 30 : 45,
      interactivity: {
        detectsOn: "window",
        events: {
          // Disable mouse hover tracking on low-end/touch devices to prevent JS main thread contention
          onHover: {
            enable: !lowEnd,
            mode: "bubble",
          },
          onClick: { enable: !lowEnd, mode: "push" },
          resize: true,
        },
        modes: {
          bubble: {
            distance: 120,
            size: 4,
            duration: 0.8,
            opacity: 0.7,
          },
          push: { quantity: 1 },
        },
      },
      particles: {
        color: { value: ["#00fffc", "#0091ff", "#4e75ff", "#8f00ff"] },
        // Disable expensive Euclidean distance line links on low-end laptops and mobile
        links: {
          color: "#0091ff",
          distance: 125,
          enable: !lowEnd,
          opacity: 0.18,
          width: 1,
          triangles: { enable: false },
        },
        collisions: {
          enable: false,
        },
        move: {
          enable: !isScrolling, // Pause particle move updates during active scroll to ensure 60 FPS scrolling
          speed: lowEnd ? 0.5 : 0.85,
          direction: "none",
          random: true,
          straight: false,
          outMode: "out",
        },
        number: {
          density: { enable: true, area: lowEnd ? 1200 : 900 },
          value: lowEnd ? 14 : 28,
        },
        opacity: { value: { min: 0.2, max: 0.55 } },
        shape: { type: "circle" },
        size: { value: { min: 1, max: 3 } },
      },
    };
  }, [isLowSpec, isMobile, reduceMotion, isScrolling]);

  return (
    <div
      className="fixed top-0 left-0 w-full h-full pointer-events-none"
      style={{ zIndex: 1, willChange: "transform", transform: "translateZ(0)" }}
    >
      <Particles id="tsparticles" init={particlesInit} options={options} />
    </div>
  );
}
