import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  Upload,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Play,
  Square,
  SwitchCamera,
  QrCode,
  X,
  FileImage,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { Html5QrcodeShim } from "html5-qrcode/esm/code-decoder.js";

/**
 * Robust parsing of scanned QR code content.
 * Extracts TechXpo member ID while strictly preserving rich URL query parameters
 * (name, role, department, tier, photo CDN URL) for instantaneous cross-device authentication.
 */
export function parseScannedQrCode(decodedText = "") {
  if (!decodedText) return null;
  const text = String(decodedText).trim();

  let id = "";
  let search = "";

  // 1. Check if it's a full URL (e.g. https://circuitron.in/verify/TX2-EX-7264?n=...&img=...)
  try {
    const url = new URL(text);
    const pathParts = url.pathname.split("/").filter(Boolean);
    const verifyIdx = pathParts.findIndex((p) => p.toLowerCase() === "verify");

    if (verifyIdx !== -1 && pathParts[verifyIdx + 1]) {
      id = pathParts[verifyIdx + 1].trim().toUpperCase();
    } else if (url.searchParams.get("id")) {
      id = url.searchParams.get("id").trim().toUpperCase();
    } else {
      const match = text.match(/TX2-[A-Z]{2}-[0-9A-Z]+/i);
      if (match) id = match[0].toUpperCase();
    }

    search = url.search || "";
  } catch (err) {
    // Not a standard URL
  }

  // 2. Check for query parameters in non-URL strings like "TX2-EX-7264?n=..."
  if (!id) {
    const qIdx = text.indexOf("?");
    if (qIdx !== -1) {
      const beforeQ = text.slice(0, qIdx);
      const afterQ = text.slice(qIdx);
      const match = beforeQ.match(/TX2-[A-Z]{2}-[0-9A-Z]+/i);
      if (match) {
        id = match[0].toUpperCase();
        search = afterQ;
      }
    }
  }

  // 3. Direct TechXpo ID pattern match
  if (!id) {
    const idMatch = text.match(/TX2-[A-Z]{2}-[0-9A-Z]+/i);
    if (idMatch) {
      id = idMatch[0].toUpperCase();
    }
  }

  // 4. Fallback to clean trimmed uppercase alphanumeric string
  if (!id) {
    id = text.replace(/[^A-Za-z0-9_-]/g, "").toUpperCase();
  }

  if (!id) return null;

  return {
    id,
    path: `/verify/${id}${search}`,
    search,
    fullUrl: text,
  };
}

/**
 * Play futuristic audio confirmation beep upon successful scan
 */
export function playScanBeep() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1400, ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.16);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.17);
  } catch (e) {
    // Silently ignore if audio context is blocked
  }
}

export default function MemberQrScanner({ onScanSuccess, autoStart = false, isModal = false, onClose }) {
  const [activeTab, setActiveTab] = useState("camera"); // "camera" | "upload"
  const [isScanning, setIsScanning] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [cameraFacing, setCameraFacing] = useState("environment"); // "environment" | "user"
  const [scannerError, setScannerError] = useState(null); // { message, details, code }
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [successResult, setSuccessResult] = useState(null);
  const [hasStartedOnce, setHasStartedOnce] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const activeStreamRef = useRef(null);
  const isStartingRef = useRef(false);
  const isScanningLoopRef = useRef(false);
  const scanLoopTimerRef = useRef(null);
  const zxingDecoderRef = useRef(null);
  const barcodeDetectorRef = useRef(null);
  const isMountedRef = useRef(true);
  const fileInputRef = useRef(null);

  // Initialize ZXing decoder & native BarcodeDetector
  useEffect(() => {
    isMountedRef.current = true;

    // Check for native BarcodeDetector API (supported in Google Chrome & Edge)
    if (typeof window !== "undefined" && "BarcodeDetector" in window) {
      try {
        barcodeDetectorRef.current = new window.BarcodeDetector({ formats: ["qr_code"] });
      } catch (e) {
        barcodeDetectorRef.current = null;
      }
    }

    // Always keep ZXing decoder ready as fallback
    try {
      zxingDecoderRef.current = new Html5QrcodeShim(
        [Html5QrcodeSupportedFormats.QR_CODE],
        true,
        false,
        { log: () => {}, logError: () => {} }
      );
    } catch (e) {
      console.warn("ZXing decoder initialization warning:", e);
    }

    return () => {
      isMountedRef.current = false;
      stopCamera();
    };
  }, []);

  // Cleanly stop existing camera stream and loop
  const stopCamera = () => {
    isScanningLoopRef.current = false;
    if (scanLoopTimerRef.current) {
      clearTimeout(scanLoopTimerRef.current);
      scanLoopTimerRef.current = null;
    }

    if (activeStreamRef.current) {
      try {
        activeStreamRef.current.getTracks().forEach((track) => {
          track.stop();
        });
      } catch (err) {
        console.warn("Track stop warning:", err);
      }
      activeStreamRef.current = null;
    }

    if (videoRef.current) {
      try {
        videoRef.current.srcObject = null;
      } catch (e) {}
    }

    if (isMountedRef.current) {
      setIsScanning(false);
      setIsStarting(false);
    }
  };

  /**
   * Main Camera Activation Engine
   * Conforms strictly to Phase 2: navigator.mediaDevices.getUserMedia()
   */
  const startCamera = async (targetFacingMode = null) => {
    if (isStartingRef.current) return;
    isStartingRef.current = true;
    setIsStarting(true);
    setScannerError(null);
    setSuccessResult(null);

    // 1. Environment & Security Pre-flight Checks
    if (typeof window !== "undefined" && !window.isSecureContext) {
      isStartingRef.current = false;
      setIsStarting(false);
      setScannerError({
        code: "SecurityError",
        message: "Camera access requires a secure connection (HTTPS).",
        details: "Browsers strictly block camera hardware on insecure origins. Please load via HTTPS or localhost.",
      });
      return;
    }

    if (typeof navigator === "undefined" || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      isStartingRef.current = false;
      setIsStarting(false);
      setScannerError({
        code: "TypeError",
        message: "Camera API is not supported by your current browser.",
        details: "Please update Google Chrome to a modern version, or switch to the 'Upload Photo' tab.",
      });
      return;
    }

    // 2. Stop any existing media tracks first
    stopCamera();

    const facingToUse = targetFacingMode || cameraFacing;

    // Flexible camera constraints as requested in Phase 2
    const constraints = {
      audio: false,
      video: {
        facingMode: { ideal: facingToUse },
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
    };

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (!isMountedRef.current) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }

      activeStreamRef.current = stream;

      // 3. Attach stream to the video element via React ref
      const videoEl = videoRef.current;
      if (!videoEl) {
        throw new Error("Video display element is not mounted in the DOM.");
      }

      videoEl.srcObject = stream;
      videoEl.setAttribute("playsinline", "true");
      videoEl.setAttribute("autoplay", "true");
      videoEl.muted = true;

      // 4. Wait for video metadata before playback & scanning
      await new Promise((resolve) => {
        if (videoEl.readyState >= 1) {
          resolve();
        } else {
          videoEl.onloadedmetadata = () => resolve();
        }
      });

      // 5. Explicitly await video.play()
      await videoEl.play();

      if (isMountedRef.current) {
        setIsScanning(true);
        setIsStarting(false);
        setHasStartedOnce(true);
        setCameraFacing(facingToUse);
        isStartingRef.current = false;

        // 6. Start QR detection loop once metadata & video are running
        startQrDetectionLoop();
      }
    } catch (err) {
      console.error("Camera initialisation error:", err);
      isStartingRef.current = false;

      if (!isMountedRef.current) return;

      setIsStarting(false);
      setIsScanning(false);

      // Phase 3 — Granular Error Classification
      const errName = err.name || "";
      const errMsg = (err.message || "").toLowerCase();

      let title = "Unable to start camera stream.";
      let details = err.message || "Please check camera permissions in browser settings or switch to 'Upload Photo'.";

      if (errName === "NotAllowedError" || errName === "PermissionDeniedError") {
        if (errMsg.includes("policy") || errMsg.includes("permissions-policy")) {
          title = "Camera access is restricted by document security policy.";
          details = "Please ensure the page is accessed over HTTPS and not embedded inside a restricted frame.";
        } else {
          title = "Camera permission was blocked or denied.";
          details = "Click the camera icon or padlock icon in your browser's address bar, set Camera to 'Allow', then click 'Retry Camera'.";
        }
      } else if (errName === "NotFoundError" || errName === "DevicesNotFoundError") {
        title = "No camera hardware detected on this device.";
        details = "Please connect an external webcam or switch to 'Upload Photo' to scan an ID card image.";
      } else if (errName === "NotReadableError" || errName === "TrackStartError") {
        title = "Camera is currently busy or in use by another app.";
        details = "Please close other browser tabs, Zoom, Google Meet, or camera apps using the webcam, then tap 'Retry Camera'.";
      } else if (errName === "OverconstrainedError") {
        title = "Camera constraints could not be satisfied.";
        details = "Attempting fallback with basic video settings...";
        // Immediate fallback with basic video constraint
        navigator.mediaDevices
          .getUserMedia({ audio: false, video: true })
          .then((fallbackStream) => {
            activeStreamRef.current = fallbackStream;
            if (videoRef.current) {
              videoRef.current.srcObject = fallbackStream;
              videoRef.current.play().then(() => {
                setIsScanning(true);
                startQrDetectionLoop();
              });
            }
          })
          .catch(() => {});
        return;
      } else if (errName === "SecurityError") {
        title = "Camera access is restricted by browser security policies.";
        details = "Camera access requires HTTPS. Please access the website securely.";
      } else if (errName === "AbortError") {
        title = "Camera operation was interrupted.";
        details = "Please tap 'Retry Camera' to restart the video connection.";
      } else if (errName === "TypeError") {
        title = "Camera configuration error.";
        details = "Your browser does not support standard mediaDevices or invalid constraints were supplied.";
      }

      setScannerError({
        code: errName || "UnknownError",
        message: title,
        details,
      });
    }
  };

  /**
   * QR Scanning Loop over Live Video
   * Uses hardware-accelerated BarcodeDetector where available, with ZXing canvas fallback.
   */
  const startQrDetectionLoop = () => {
    isScanningLoopRef.current = true;

    const scanFrame = async () => {
      if (!isScanningLoopRef.current || !isMountedRef.current) return;

      const video = videoRef.current;
      if (!video || video.readyState < 2 || video.paused || video.ended) {
        scanLoopTimerRef.current = setTimeout(scanFrame, 150);
        return;
      }

      let detectedText = null;

      // Method 1: Hardware-accelerated native BarcodeDetector (Chrome/Edge/Android)
      if (barcodeDetectorRef.current) {
        try {
          const barcodes = await barcodeDetectorRef.current.detect(video);
          if (barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
            detectedText = barcodes[0].rawValue;
          }
        } catch (e) {
          // Native detector frame pass
        }
      }

      // Method 2: High-accuracy ZXing canvas decoder fallback (Firefox/Safari)
      if (!detectedText && zxingDecoderRef.current && canvasRef.current) {
        try {
          const canvas = canvasRef.current;
          const w = video.videoWidth || 640;
          const h = video.videoHeight || 480;

          if (canvas.width !== w || canvas.height !== h) {
            canvas.width = w;
            canvas.height = h;
          }

          const ctx = canvas.getContext("2d", { willReadFrequently: true });
          if (ctx) {
            ctx.drawImage(video, 0, 0, w, h);
            const zxResult = await zxingDecoderRef.current.decodeAsync(canvas);
            if (zxResult && (zxResult.text || zxResult.decodedText)) {
              detectedText = zxResult.text || zxResult.decodedText;
            }
          }
        } catch (e) {
          // ZXing frame pass (normal for frames without QR)
        }
      }

      if (detectedText) {
        handleScanDecoded(detectedText);
        return;
      }

      // Schedule next frame scan (every ~120ms for smooth 8-10 scans/second without CPU pegging)
      if (isScanningLoopRef.current && isMountedRef.current) {
        scanLoopTimerRef.current = setTimeout(scanFrame, 120);
      }
    };

    scanLoopTimerRef.current = setTimeout(scanFrame, 150);
  };

  // Flip between front camera and rear camera
  const handleFlipCamera = async () => {
    const nextFacing = cameraFacing === "environment" ? "user" : "environment";
    setCameraFacing(nextFacing);
    await startCamera(nextFacing);
  };

  // Auto-start camera if autoStart is true (e.g. inside Modal or Portal)
  useEffect(() => {
    if (autoStart && activeTab === "camera" && !isScanning && !isStarting && !hasStartedOnce) {
      const timer = setTimeout(() => {
        startCamera();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [autoStart, activeTab, isScanning, isStarting, hasStartedOnce]);

  // Handle successful QR decode from either camera or photo upload
  const handleScanDecoded = (decodedText) => {
    const parsed = parseScannedQrCode(decodedText);
    if (!parsed || !parsed.id) {
      setScannerError({
        code: "InvalidPayload",
        message: "Scanned QR code is not a valid TechXpo 2.O credential.",
        details: "Please scan the official TechXpo 2.O badge QR code with royal blue framing.",
      });
      return;
    }

    playScanBeep();
    setSuccessResult(parsed.id);

    // Stop scanning immediately to freeze camera and prevent duplicate submissions
    stopCamera();

    // Trigger parent callback after brief visual confirmation
    setTimeout(() => {
      if (onScanSuccess) {
        onScanSuccess(parsed);
      }
    }, 400);
  };

  // Handle badge photo upload / snapshot
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingFile(true);
    setScannerError(null);
    setSuccessResult(null);

    try {
      stopCamera();

      const dummyId = `techxpo-file-reader-${Math.random().toString(36).substring(2, 7)}`;
      let dummyEl = document.getElementById(dummyId);
      if (!dummyEl) {
        dummyEl = document.createElement("div");
        dummyEl.id = dummyId;
        dummyEl.style.display = "none";
        document.body.appendChild(dummyEl);
      }

      const fileScanner = new Html5Qrcode(dummyId);
      const decodedText = await fileScanner.scanFile(file, true);
      fileScanner.clear();
      dummyEl.remove();

      handleScanDecoded(decodedText);
    } catch (err) {
      console.error("File QR decode error:", err);
      setScannerError({
        code: "FileDecodeFailed",
        message: "Could not detect a valid QR code in the uploaded image.",
        details: "Please ensure the badge QR code is clearly visible, in focus, and well-lit.",
      });
    } finally {
      if (isMountedRef.current) {
        setIsProcessingFile(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="glass-card rounded-3xl border-2 border-primary/30 p-5 sm:p-7 bg-darkNavy/95 shadow-[0_0_50px_rgba(0,229,255,0.15)] relative overflow-hidden">
      
      {/* Background Ambience Reticle Glow */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      {/* Hidden offscreen canvas for fallback frame analysis */}
      <canvas ref={canvasRef} style={{ display: "none" }} />

      {/* Header Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-primary/20 gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-accent shadow-sm flex-shrink-0">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-accent font-bold">
                OPTICAL VERIFICATION
              </span>
              <span className="flex h-2 w-2 relative">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isScanning ? "bg-emerald-400" : "bg-cyan-400"}`} />
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isScanning ? "bg-emerald-500" : "bg-cyan-500"}`} />
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-black font-orbitron text-white">
              Scan Member Badge QR
            </h3>
          </div>
        </div>

        {isModal && onClose && (
          <button
            type="button"
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            title="Close scanner"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Mode Switcher Tabs */}
      <div className="pt-4 pb-2">
        <div className="flex p-1 rounded-2xl bg-black/40 border border-primary/20 max-w-sm mx-auto">
          <button
            type="button"
            onClick={() => {
              setActiveTab("camera");
              setScannerError(null);
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-orbitron font-bold transition-all flex items-center justify-center space-x-2 ${
              activeTab === "camera"
                ? "bg-gradient-to-r from-cyan-500 to-primary text-darkNavy shadow-neon font-extrabold"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Live Camera</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("upload");
              stopCamera();
              setScannerError(null);
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-orbitron font-bold transition-all flex items-center justify-center space-x-2 ${
              activeTab === "upload"
                ? "bg-gradient-to-r from-cyan-500 to-primary text-darkNavy shadow-neon font-extrabold"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Photo</span>
          </button>
        </div>
      </div>

      {/* Viewfinder & Scanner Body */}
      <div className="pt-3">
        {activeTab === "camera" ? (
          <div className="space-y-4">
            
            {/* Camera Viewport Container */}
            <div
              style={{ minHeight: "280px" }}
              className="relative w-full aspect-square max-w-[340px] sm:max-w-[380px] mx-auto rounded-3xl overflow-hidden border-2 border-primary/40 bg-black/90 shadow-[inset_0_0_40px_rgba(0,0,0,0.8)] flex items-center justify-center"
            >
              
              {/* Native HTML5 Video Element with React Ref */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover transition-opacity duration-300 ${
                  isScanning ? "opacity-100" : "opacity-0"
                }`}
              />

              {/* Inactive Standby View (When Camera Not Running) */}
              {!isScanning && !isStarting && !successResult && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-4 bg-gradient-to-b from-darkNavy/85 via-black/85 to-darkNavy/90 z-10 backdrop-blur-sm">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center text-cyan-400 shadow-neon">
                    <QrCode className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold font-orbitron text-sm">
                      Camera Scanner Ready
                    </h4>
                    <p className="text-gray-400 text-xs font-mono max-w-[240px] mx-auto mt-1 leading-relaxed">
                      Tap below to open your camera and scan any TechXpo 2.O ID badge
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => startCamera()}
                    className="btn-primary py-3 px-7 text-xs font-orbitron font-bold flex items-center space-x-2 shadow-neon hover:scale-105 transition-all"
                  >
                    <Play className="w-4 h-4 text-darkNavy fill-darkNavy" />
                    <span>Open Camera Scanner</span>
                  </button>
                </div>
              )}

              {/* Initializing / Loading Spinner */}
              {isStarting && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-3 bg-black/90 z-10">
                  <RefreshCw className="w-10 h-10 text-accent animate-spin" />
                  <p className="text-white font-mono text-xs font-bold tracking-wider animate-pulse">
                    Connecting to Camera Stream...
                  </p>
                </div>
              )}

              {/* Active Scanner Cyber HUD Reticle */}
              {isScanning && !successResult && (
                <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center p-8">
                  {/* Glowing Laser Scan Bar */}
                  <div className="absolute left-6 right-6 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#00e5ff] animate-[pulse_1.5s_cubic-bezier(0.4,0,0.6,1)_infinite]" />

                  {/* Cyber Corner Reticles */}
                  <div className="w-full h-full relative max-w-[240px] max-h-[240px]">
                    <div className="absolute top-0 left-0 w-7 h-7 border-t-2 border-l-2 border-cyan-400" />
                    <div className="absolute top-0 right-0 w-7 h-7 border-t-2 border-r-2 border-cyan-400" />
                    <div className="absolute bottom-0 left-0 w-7 h-7 border-b-2 border-l-2 border-cyan-400" />
                    <div className="absolute bottom-0 right-0 w-7 h-7 border-b-2 border-r-2 border-cyan-400" />
                  </div>
                </div>
              )}

              {/* Decode Success Overlay */}
              {successResult && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute inset-0 bg-darkNavy/95 flex flex-col items-center justify-center p-6 text-center space-y-3 z-20"
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.5)]">
                    <CheckCircle2 className="w-10 h-10 animate-pulse" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold block">
                      MEMBER CREDENTIAL IDENTIFIED
                    </span>
                    <div className="text-2xl font-black font-orbitron text-white mt-1">
                      {successResult}
                    </div>
                  </div>
                  <p className="text-gray-300 text-xs font-mono animate-pulse">
                    Loading cryptographic clearance dossier...
                  </p>
                </motion.div>
              )}
            </div>

            {/* Camera Control Action Buttons */}
            {isScanning && (
              <div className="flex items-center justify-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleFlipCamera}
                  className="py-2 px-4 rounded-xl bg-white/10 hover:bg-white/15 border border-primary/30 text-cyan-300 text-xs font-mono font-semibold flex items-center space-x-2 transition-all"
                  title="Switch Front/Rear Camera"
                >
                  <SwitchCamera className="w-4 h-4 text-accent" />
                  <span>Flip Camera ({cameraFacing === "environment" ? "Back" : "Front"})</span>
                </button>
                <button
                  type="button"
                  onClick={stopCamera}
                  className="py-2 px-4 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-mono font-semibold flex items-center space-x-2 transition-all"
                >
                  <Square className="w-3.5 h-3.5 fill-rose-300" />
                  <span>Pause Camera</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          /* ================= TAB 2: BADGE PHOTO UPLOAD ================= */
          <div className="space-y-4">
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{ minHeight: "280px" }}
              className="relative w-full aspect-square max-w-[340px] sm:max-w-[380px] mx-auto rounded-3xl border-2 border-dashed border-primary/40 hover:border-accent bg-black/60 hover:bg-black/80 transition-all cursor-pointer flex flex-col items-center justify-center p-6 text-center group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center text-accent mb-4 group-hover:scale-110 transition-transform shadow-neon">
                <FileImage className="w-8 h-8 animate-bounce" />
              </div>

              <h4 className="text-white font-bold font-orbitron text-sm mb-1">
                Choose Badge Photo or Snapshot
              </h4>
              <p className="text-gray-400 text-xs font-mono max-w-[220px]">
                Select an image containing the TechXpo 2.O badge QR code to verify
              </p>

              {isProcessingFile && (
                <div className="mt-4 flex items-center space-x-2 text-accent text-xs font-mono font-bold animate-pulse">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Decoding QR matrix...</span>
                </div>
              )}

              {/* Decode Success Overlay */}
              {successResult && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute inset-0 bg-darkNavy/95 flex flex-col items-center justify-center p-6 text-center space-y-3 z-20 rounded-3xl"
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.5)]">
                    <CheckCircle2 className="w-10 h-10 animate-pulse" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold block">
                      MEMBER CREDENTIAL IDENTIFIED
                    </span>
                    <div className="text-2xl font-black font-orbitron text-white mt-1">
                      {successResult}
                    </div>
                  </div>
                  <p className="text-gray-300 text-xs font-mono">
                    Loading clearance dossier...
                  </p>
                </motion.div>
              )}
            </div>
          </div>
        )}

        {/* Phase 3 Error Feedback & Troubleshooting Box */}
        {scannerError && (
          <div className="mt-4 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono space-y-2">
            <div className="flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400 mt-0.5" />
              <div className="space-y-1 flex-1">
                <span className="block font-bold text-white text-sm">
                  {scannerError.message}
                </span>
                <p className="text-rose-200/90 leading-relaxed text-[11px]">
                  {scannerError.details}
                </p>
                {scannerError.code && (
                  <span className="inline-block text-[10px] font-mono text-rose-400/70 uppercase">
                    Error Code: {scannerError.code}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-rose-500/20">
              <button
                type="button"
                onClick={() => startCamera()}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 text-white font-orbitron text-[11px] font-bold shadow-md hover:scale-105 transition-all flex items-center space-x-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Camera</span>
              </button>
              {activeTab === "camera" && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("upload");
                    setScannerError(null);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-accent text-[11px] font-semibold transition-all"
                >
                  Use Badge Photo Upload &rarr;
                </button>
              )}
            </div>
          </div>
        )}

        {/* Informational Guidance */}
        <div className="pt-3 border-t border-primary/10 mt-4 text-[11px] font-mono text-gray-400 flex items-center justify-center space-x-2 text-center">
          <Sparkles className="w-3.5 h-3.5 text-accent flex-shrink-0" />
          <span>Point camera at any printed ID card or digital badge QR code</span>
        </div>
      </div>
    </div>
  );
}
