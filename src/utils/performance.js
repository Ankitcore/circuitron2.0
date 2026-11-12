/**
 * Universal Device-Adaptive Performance System for Circuitron / TechXpo 2.O
 *
 * Provides intelligent, 3-tier hardware profiling and adaptive animation controls:
 * - PROFILE A (High Performance): Modern laptops, high-spec desktops, flagship mobile.
 * - PROFILE B (Standard Performance): Average laptops, mid-range smartphones.
 * - PROFILE C (Low Performance): Older laptops (e.g. 1366x768 60Hz with integrated GPUs),
 *   budget mobile devices, battery-saver mode, or prefers-reduced-motion.
 *
 * IMPORTANT: Does not assume screen resolution alone indicates device performance.
 * 1366x768 screens with capable hardware maintain high-fidelity rendering.
 */

let cachedProfile = null;
let profileListeners = new Set();
let frameDropObserverActive = false;

/**
 * Detects whether the current device is a mobile or touch-primary device
 */
export function isMobileDevice() {
  if (typeof window === "undefined") return false;
  return (
    window.innerWidth < 768 ||
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent || "") ||
    (typeof navigator.maxTouchPoints === "number" && navigator.maxTouchPoints > 2)
  );
}

/**
 * Checks if user explicitly requested reduced motion
 */
export function shouldReduceMotion() {
  if (typeof window === "undefined") return false;
  return Boolean(
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Analyzes hardware concurrency, memory, GPU capabilities, battery, and network
 * to determine the active performance profile ('A' | 'B' | 'C').
 */
export function getPerformanceProfile() {
  if (cachedProfile !== null) return cachedProfile;
  if (typeof window === "undefined") return "B";

  // 1. Accessibility override: User prefers reduced motion -> Profile C
  if (shouldReduceMotion()) {
    cachedProfile = "C";
    return cachedProfile;
  }

  // 2. Network data saver override -> Profile C
  if (navigator.connection && (navigator.connection.saveData || navigator.connection.effectiveType === "2g" || navigator.connection.effectiveType === "slow-2g")) {
    cachedProfile = "C";
    return cachedProfile;
  }

  // 3. Hardware metrics
  const cores = typeof navigator.hardwareConcurrency === "number" ? navigator.hardwareConcurrency : 4;
  const memory = typeof navigator.deviceMemory === "number" ? navigator.deviceMemory : 4;
  const isMobile = isMobileDevice();

  // 4. GPU & WebGL Capability Probe
  let isLegacyOrSoftwareGpu = false;
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl", { powerPreference: "default" }) || canvas.getContext("experimental-webgl");
    if (gl) {
      const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
      if (debugInfo) {
        const renderer = (gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || "").toLowerCase();
        // Detect CPU/software emulated renderers and very old integrated graphics known for low fill rate
        if (
          renderer.includes("swiftshader") ||
          renderer.includes("llvmpipe") ||
          renderer.includes("software rasterizer") ||
          renderer.includes("intel hd graphics 2000") ||
          renderer.includes("intel hd graphics 3000") ||
          renderer.includes("mali-400") ||
          renderer.includes("mali-450")
        ) {
          isLegacyOrSoftwareGpu = true;
        }
      }
    }
  } catch {
    // Fail silently, fallback to CPU & RAM
  }

  // 5. Determine Profile
  // PROFILE C: Very low hardware capabilities or legacy integrated GPU
  if (isLegacyOrSoftwareGpu || cores <= 2 || memory <= 2) {
    cachedProfile = "C";
    return cachedProfile;
  }

  // Mobile classification: Budget mobile with <= 4 cores or <= 3GB RAM is Profile C
  if (isMobile && (cores <= 4 || memory <= 3)) {
    cachedProfile = "C";
    return cachedProfile;
  }

  // PROFILE B: Standard average laptops and mid-range devices (e.g. 4 cores, 4GB RAM)
  if (cores <= 4 || memory <= 4) {
    cachedProfile = "B";
    return cachedProfile;
  }

  // PROFILE A: High-performance laptops, desktops, and flagship phones (>= 6 cores and >= 6GB RAM)
  cachedProfile = "A";
  return cachedProfile;
}

/**
 * Returns dynamic configuration parameters based on the current profile
 */
export function getPerformanceConfig() {
  const profile = getPerformanceProfile();

  switch (profile) {
    case "A":
      return {
        profile: "A",
        name: "High Performance",
        particles: true,
        particleLimit: 28,
        particleFps: 45,
        cyberGridAnimated: true,
        mascotAnimated: true,
        backdropFilter: "blur(8px)",
        animationDurationMultiplier: 1.0,
        enable3DTilt: true,
        enableHoverLift: true,
        enableShimmer: true,
        counterAnimated: true,
        viewportMargin: "-40px",
      };

    case "B":
      return {
        profile: "B",
        name: "Standard Performance",
        particles: true,
        particleLimit: 12,
        particleFps: 30,
        cyberGridAnimated: true,
        mascotAnimated: true,
        backdropFilter: "blur(4px)",
        animationDurationMultiplier: 0.7,
        enable3DTilt: false,
        enableHoverLift: true,
        enableShimmer: false,
        counterAnimated: true,
        viewportMargin: "-20px",
      };

    case "C":
    default:
      return {
        profile: "C",
        name: "Low Performance / 60Hz Smoothness Locked",
        particles: false,
        particleLimit: 0,
        particleFps: 0,
        cyberGridAnimated: false,
        mascotAnimated: false,
        backdropFilter: "none",
        animationDurationMultiplier: 0.35,
        enable3DTilt: false,
        enableHoverLift: false,
        enableShimmer: false,
        counterAnimated: false,
        viewportMargin: "100px",
      };
  }
}

export function isHighProfile() {
  return getPerformanceProfile() === "A";
}

export function isStandardProfile() {
  return getPerformanceProfile() === "B";
}

export function isLowProfile() {
  return getPerformanceProfile() === "C";
}

/**
 * Legacy compatibility helper
 */
export function isLowEndDevice() {
  return isLowProfile();
}

/**
 * Allows components to subscribe to dynamic performance adjustments
 */
export function onProfileChange(callback) {
  profileListeners.add(callback);
  return () => profileListeners.delete(callback);
}

/**
 * Manually update or downgrade the active profile if continuous frame drops are detected
 */
export function setPerformanceProfile(newProfile) {
  if (cachedProfile === newProfile) return;
  cachedProfile = newProfile;
  applyProfileClasses(newProfile);
  profileListeners.forEach((cb) => {
    try {
      cb(newProfile, getPerformanceConfig());
    } catch (err) {
      console.warn("Profile listener error:", err);
    }
  });
}

function applyProfileClasses(profile) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;

  root.classList.remove("perf-profile-a", "perf-profile-b", "perf-profile-c", "low-spec-device", "high-spec-device");

  if (profile === "A") {
    root.classList.add("perf-profile-a", "high-spec-device");
  } else if (profile === "B") {
    root.classList.add("perf-profile-b");
  } else {
    root.classList.add("perf-profile-c", "low-spec-device");
  }
}

/**
 * Real-Time Frame Pacing Monitor:
 * If the user's browser drops frames heavily during initial scroll, dynamically
 * step down from Profile A -> B or B -> C to lock in smooth 60 FPS scrolling.
 */
function initFramePacingMonitor() {
  if (typeof window === "undefined" || frameDropObserverActive) return;
  if (getPerformanceProfile() === "C") return; // Already on lowest profile

  frameDropObserverActive = true;
  let consecutiveSlowFrames = 0;
  let lastTime = performance.now();
  let frameCount = 0;
  let rafId = null;

  const checkPacing = (now) => {
    const delta = now - lastTime;
    lastTime = now;
    frameCount++;

    // A normal 60Hz frame is ~16.6ms. If delta exceeds 45ms (~<22 FPS), record a hitch
    if (delta > 45) {
      consecutiveSlowFrames++;
    } else if (consecutiveSlowFrames > 0 && delta < 20) {
      consecutiveSlowFrames = Math.max(0, consecutiveSlowFrames - 0.5);
    }

    // If 8 heavy hitches accumulate within 120 frames, adaptively step down
    if (consecutiveSlowFrames >= 8) {
      const current = getPerformanceProfile();
      if (current === "A") {
        setPerformanceProfile("B");
        consecutiveSlowFrames = 0;
      } else if (current === "B") {
        setPerformanceProfile("C");
        return; // Stop monitoring once in Profile C
      }
    }

    // Keep checking for the first 300 frames (~5 seconds of interaction)
    if (frameCount < 300) {
      rafId = requestAnimationFrame(checkPacing);
    }
  };

  // Start check on first interaction or scroll
  const onFirstInteraction = () => {
    window.removeEventListener("scroll", onFirstInteraction);
    window.removeEventListener("pointerdown", onFirstInteraction);
    lastTime = performance.now();
    rafId = requestAnimationFrame(checkPacing);
  };

  window.addEventListener("scroll", onFirstInteraction, { passive: true, once: true });
  window.addEventListener("pointerdown", onFirstInteraction, { passive: true, once: true });
}

/**
 * Initializes hardware-aware performance class on <html> element
 */
export function initPerformanceOptimizations() {
  if (typeof document === "undefined") return;

  const profile = getPerformanceProfile();
  applyProfileClasses(profile);

  const root = document.documentElement;
  if (isMobileDevice()) {
    root.classList.add("is-mobile");
  }

  if (shouldReduceMotion()) {
    root.classList.add("reduced-motion");
  }

  // Initialize frame pacing observer for self-tuning smoothness
  initFramePacingMonitor();
}
