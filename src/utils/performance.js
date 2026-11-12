/**
 * Performance & Hardware-Tier Detection Utility
 * Dynamically detects low-end laptops (e.g. 1366x768, 60Hz, integrated Intel HD GPUs)
 * and budget mobile devices to guarantee smooth 60 FPS scrolling and animations.
 */

let cachedIsLowEnd = null;
let cachedIsMobile = null;

export function isMobileDevice() {
  if (cachedIsMobile !== null) return cachedIsMobile;
  if (typeof window === "undefined") return false;
  
  cachedIsMobile =
    window.innerWidth < 768 ||
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent || "") ||
    (navigator.maxTouchPoints && navigator.maxTouchPoints > 2);

  return cachedIsMobile;
}

export function isLowEndDevice() {
  if (cachedIsLowEnd !== null) return cachedIsLowEnd;
  if (typeof window === "undefined") return false;

  const isSmallLaptop = window.innerWidth <= 1366 && window.innerHeight <= 800;
  const isBudgetMobile = isMobileDevice();
  const lowCores = typeof navigator.hardwareConcurrency === "number" && navigator.hardwareConcurrency <= 4;
  const lowMemory = typeof navigator.deviceMemory === "number" && navigator.deviceMemory <= 4;
  const prefersReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const saveData = Boolean(navigator.connection && navigator.connection.saveData);

  // If any of these low-tier markers are present, mark as low-end to apply smooth optimizations
  cachedIsLowEnd = isSmallLaptop || isBudgetMobile || lowCores || lowMemory || prefersReduced || saveData;
  return cachedIsLowEnd;
}

export function shouldReduceMotion() {
  if (typeof window === "undefined") return false;
  return (
    (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) ||
    isLowEndDevice()
  );
}

/**
 * Initializes hardware-aware performance class on <html> element
 */
export function initPerformanceOptimizations() {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  if (isLowEndDevice()) {
    root.classList.add("low-spec-device");
  } else {
    root.classList.add("high-spec-device");
  }

  if (isMobileDevice()) {
    root.classList.add("is-mobile");
  }

  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    root.classList.add("reduced-motion");
  }
}
