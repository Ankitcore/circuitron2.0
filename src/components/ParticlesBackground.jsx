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
        detectsOn: "window",
        events: {
          onHover: { enable: true, mode: isMobile ? "bubble" : ["grab", "bubble"] },
          onClick: { enable: true, mode: "push" },
          resize: true,
        },
        modes: {
          grab: {
            distance: 160,
            links: { opacity: 0.45, color: "#00ffff" },
          },
          bubble: {
            distance: 150,
            size: 4.5,
            duration: 0.8,
            opacity: 0.85,
          },
          push: { quantity: 2 },
        },
      },
      particles: {
        color: { value: ["#00fffc", "#0091ff", "#4e75ff", "#8f00ff"] },
        links: {
          color: "#0091ff",
          distance: isMobile ? 120 : 145,
          enable: true,
          opacity: 0.2,
          width: 1,
          triangles: { enable: false },
        },
        collisions: {
          enable: false,
        },
        move: {
          enable: true,
          speed: isMobile ? 0.7 : 1.1,
          direction: "none",
          random: true,
          straight: false,
          outMode: "out",
        },
        number: {
          density: { enable: true, area: isMobile ? 1000 : 850 },
          value: isMobile ? 24 : 45,
        },
        opacity: { value: { min: 0.2, max: 0.65 } },
        shape: { type: "circle" },
        size: { value: { min: 1, max: 3.5 } },
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
