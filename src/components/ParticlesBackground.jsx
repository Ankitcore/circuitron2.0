import React, { useCallback } from "react";
import Particles from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

export default function ParticlesBackground() {
  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          background: { color: { value: "transparent" } },
          fullScreen: { enable: true, zIndex: 1 },
          fpsLimit: 120,
          interactivity: {
            events: {
              onHover: { enable: true, mode: ["trail", "connect"] },
              onClick: { enable: true, mode: "repulse" },
              resize: true,
            },
            modes: {
              trail: {
                delay: 0.005,
                quantity: 5,
                particles: {
                  size: { value: { min: 1, max: 3 } },
                  move: { speed: 2 },
                },
              },
              connect: { distance: 180, links: { opacity: 0.2 }, radius: 120 },
              repulse: { distance: 200, duration: 0.4, speed: 1 },
            },
          },
          particles: {
            color: { value: ["#00fffc", "#0091ff", "#4e75ff", "#8f00ff"] },
            links: {
              color: { value: "#0091ff" },
              distance: 150,
              enable: true,
              opacity: 0.2,
              width: 1,
              triangles: { enable: true, opacity: 0.05 },
            },
            collisions: {
              enable: true,
              bounce: { horizontal: true, vertical: true },
            },
            move: {
              enable: true,
              speed: 1,
              direction: "none",
              random: true,
              straight: false,
              outMode: "out",
              attract: { enable: true, rotateX: 1200, rotateY: 1200 },
              trail: { enable: true, length: 3, fillColor: "#000" },
            },
            number: { density: { enable: true, area: 800 }, value: 50 },
            opacity: { value: { min: 0.2, max: 0.7 } },
            shape: { type: "circle" },
            size: { value: { min: 1, max: 4 } },
          },
        }}
      />
    </div>
  );
}
