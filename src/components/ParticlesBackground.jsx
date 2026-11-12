import React, { useCallback, useMemo } from "react";
import Particles from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { getPerformanceProfile, shouldReduceMotion } from "../utils/performance";

/**
 * ParticlesBackground
 * Subtle cyber ambient particle field.
 *
 * Performance Optimizations:
 * - Profile C / Reduced Motion: Completely disabled (returns null) for 0 canvas & 0 JS overhead.
 * - Profile B: Ultra-lightweight (10 particles, 30 FPS, zero interactive tracking).
 * - Profile A: Optimized density (22 particles, 45 FPS, lightweight hover).
 * - Removed dynamic scroll state re-rendering loop to eliminate scroll hitching entirely.
 */
export default function ParticlesBackground() {
  const profile = getPerformanceProfile();
  const reduceMotion = shouldReduceMotion();

  // On Profile C or reduced motion, never render canvas
  if (profile === "C" || reduceMotion) {
    return null;
  }

  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  const isStd = profile === "B";

  const options = useMemo(() => {
    return {
      background: { color: { value: "transparent" } },
      fullScreen: { enable: true, zIndex: 1 },
      fpsLimit: isStd ? 30 : 45,
      interactivity: {
        detectsOn: "window",
        events: {
          onHover: {
            enable: !isStd,
            mode: "bubble",
          },
          onClick: { enable: false },
          resize: true,
        },
        modes: {
          bubble: {
            distance: 100,
            size: 3.5,
            duration: 0.6,
            opacity: 0.6,
          },
        },
      },
      particles: {
        color: { value: ["#00fffc", "#0091ff", "#8f00ff"] },
        links: {
          color: "#0091ff",
          distance: 110,
          enable: !isStd,
          opacity: 0.15,
          width: 1,
          triangles: { enable: false },
        },
        collisions: {
          enable: false,
        },
        move: {
          enable: true,
          speed: isStd ? 0.35 : 0.65,
          direction: "none",
          random: true,
          straight: false,
          outMode: "out",
        },
        number: {
          density: { enable: true, area: isStd ? 1400 : 1000 },
          value: isStd ? 10 : 22,
        },
        opacity: { value: { min: 0.15, max: 0.45 } },
        shape: { type: "circle" },
        size: { value: { min: 1, max: 2.5 } },
      },
    };
  }, [isStd]);

  return (
    <div
      className="fixed top-0 left-0 w-full h-full pointer-events-none select-none"
      style={{ zIndex: 1, transform: "translateZ(0)" }}
      aria-hidden="true"
    >
      <Particles id="tsparticles" init={particlesInit} options={options} />
    </div>
  );
}
