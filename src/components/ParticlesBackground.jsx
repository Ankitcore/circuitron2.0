import React, { useCallback, useMemo } from "react";
import Particles from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

export default function ParticlesBackground() {
  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  const options = useMemo(
    () => ({
      background: { color: { value: "transparent" } },
      fullScreen: { enable: true, zIndex: 1 },
      fpsLimit: 60,
      interactivity: {
        events: {
          onHover: { enable: !isMobile, mode: "connect" },
          onClick: { enable: !isMobile, mode: "repulse" },
          resize: true,
        },
        modes: {
          connect: { distance: 140, links: { opacity: 0.2 }, radius: 100 },
          repulse: { distance: 160, duration: 0.4, speed: 1 },
        },
      },
      particles: {
        color: { value: ["#00fffc", "#0091ff", "#4e75ff", "#8f00ff"] },
        links: {
          color: "#0091ff",
          distance: isMobile ? 120 : 150,
          enable: true,
          opacity: 0.18,
          width: 1,
          triangles: { enable: false },
        },
        collisions: {
          enable: false,
        },
        move: {
          enable: true,
          speed: isMobile ? 0.8 : 1.2,
          direction: "none",
          random: true,
          straight: false,
          outMode: "out",
        },
        number: {
          density: { enable: true, area: isMobile ? 1000 : 800 },
          value: isMobile ? 25 : 45,
        },
        opacity: { value: { min: 0.2, max: 0.6 } },
        shape: { type: "circle" },
        size: { value: { min: 1, max: 3 } },
      },
    }),
    [isMobile]
  );

  return (
    <div className="fixed top-0 left-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
      <Particles id="tsparticles" init={particlesInit} options={options} />
    </div>
  );
}
