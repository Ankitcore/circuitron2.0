import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  Upload,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Zap,
  Play,
  Square,
  SwitchCamera,
  Flashlight,
  Maximize2,
  ScanLine,
} from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import { parseScannedQrCode } from "./QrScannerModal";

/**
 * Play futuristic audio confirmation beep upon successful QR decode
 */
function playScanBeep() {
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

export default function EmbeddedQrScanner({ onScanSuccess }) {
  const [activeMode, setActiveMode] = useState("camera"); // "camera" | "upload"
  const [cameras, setCameras] = useState([]);
  const [selectedCameraIndex, setSelectedCameraIndex] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const [scannerError, setScannerError] = useState("");
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [detectedId, setDetectedId] = useState(null);
  const [hasStartedOnce, setHasStartedOnce] = useState(false);
  const [torchAvailable, setTorchAvailable] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const html5QrCodeRef = useRef(null);
  const readerElementId = "embedded-techxpo-qr-reader";
  const fileInputRef = useRef(null);
  const isTransitioningRef = useRef(false);

  // Auto-attempt start on mount if permission was already granted previously
  useEffect(() => {
    let isMounted = true;

    const checkAndAutoStart = async () => {
      if (typeof navigator !== "undefined" && navigator.permissions?.query) {
        try {
          const status = await navigator.permissions.query({ name: "camera" });
          if (isMounted && status.state === "granted" && activeMode === "camera") {
            startCamera();
          }
        } catch (e) {
          // Safari / unsupported browsers will wait for user click
        }
      }
    };

    if (activeMode === "camera") {
      checkAndAutoStart();
    }

    return () => {
      isMounted = false;
      stopCamera();
    };
  }, [activeMode]);

  // Cleanly stop existing camera instance
  const stopCamera = async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
        html5QrCodeRef.current.clear();
      } catch (err) {
        console.warn("Stop camera safe ignore:", err);
      } finally {
        html5QrCodeRef.current = null;
        setIsScanning(false);
        setTorchOn(false);
        setTorchAvailable(false);
      }
    }
  };

  /**
   * Main camera activation function
   * Supports mobile rear cameras, desktop/laptop webcams, and specific selected devices.
   */
  const startCamera = async (deviceOrConstraint = null) => {
    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;
    setIsRequestingPermission(true);
    setScannerError("");

    const element = document.getElementById(readerElementId);
    if (!element) {
      setIsRequestingPermission(false);
      isTransitioningRef.current = false;
      return;
    }

    try {
      // 1. Ensure any running instance is stopped and container is empty
      await stopCamera();
      element.innerHTML = "";

      // 2. Initialize Html5Qrcode instance
      const qrScanner = new Html5Qrcode(readerElementId);
      html5QrCodeRef.current = qrScanner;

      const scanConfig = {
        fps: 20,
        qrbox: (viewfinderWidth, viewfinderHeight) => {
          const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
          const edgeSize = Math.floor(minEdge * 0.76);
          return { width: edgeSize, height: edgeSize };
        },
        aspectRatio: 1.0,
      };

      // 3. Start scanning with robust multi-stage device resolution
      if (deviceOrConstraint) {
        await qrScanner.start(
          deviceOrConstraint,
          scanConfig,
          (decodedText) => handleDecode(decodedText),
          () => {}
        );
      } else {
        // Try rear/environment camera first (ideal for mobile phones scanning badges)
        try {
          await qrScanner.start(
            { facingMode: "environment" },
            scanConfig,
            (decodedText) => handleDecode(decodedText),
            () => {}
          );
        } catch (envErr) {
          console.warn("Environment camera not available, falling back to user webcam:", envErr);
          await qrScanner.start(
            { facingMode: "user" },
            scanConfig,
            (decodedText) => handleDecode(decodedText),
            () => {}
          );
        }
      }

      setIsScanning(true);
      setHasStartedOnce(true);

      // Check torch capability
      try {
        const capabilities = qrScanner.getRunningTrackCapabilities();
        if (capabilities && capabilities.torch) {
          setTorchAvailable(true);
        }
      } catch (e) {}

      // Discover cameras in background to populate switcher
      try {
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length > 0) {
          setCameras(devices);
        }
      } catch (enumErr) {
        console.warn("Could not list video devices:", enumErr);
      }
    } catch (err) {
      console.error("Camera activation error:", err);
      setIsScanning(false);
      const str = String(err).toLowerCase();
      if (str.includes("notallowed") || str.includes("permission") || str.includes("denied")) {
        setScannerError(
          "Camera permission was blocked. Please tap the lock/camera icon in your browser address bar to allow camera access, then tap 'Retry Camera'."
        );
      } else if (str.includes("notfound") || str.includes("devicesnotfound")) {
        setScannerError("No camera detected on this device. You can upload a photo of the QR badge instead.");
      } else if (str.includes("notreadable") || str.includes("trackstart") || str.includes("busy") || str.includes("source")) {
        setScannerError("Camera is currently occupied by another browser tab or app. Please close other camera apps and tap 'Retry Camera'.");
      } else {
        setScannerError("Unable to initialize camera video stream. Please allow camera permissions or upload an image of the QR code.");
      }
    } finally {
      setIsRequestingPermission(false);
      isTransitioningRef.current = false;
    }
  };

  /**
   * Main camera activation triggered by user click
   */
  const handleStartCameraClick = () => {
    const targetDev = cameras.length > 0 ? cameras[selectedCameraIndex]?.id : null;
    startCamera(targetDev);
  };

  /**
   * Quick camera flip button (toggles front/back or next camera device)
   */
  const handleFlipCamera = () => {
    if (cameras.length <= 1) return;
    const nextIdx = (selectedCameraIndex + 1) % cameras.length;
    setSelectedCameraIndex(nextIdx);
    startCamera(cameras[nextIdx].id);
  };

  /**
   * Toggle Torch / Flashlight for scanning in dark arenas
   */
  const handleToggleTorch = async () => {
    if (!html5QrCodeRef.current || !torchAvailable) return;
    try {
      const next = !torchOn;
      await html5QrCodeRef.current.applyVideoConstraints({
        advanced: [{ torch: next }],
      });
      setTorchOn(next);
    } catch (err) {
      console.warn("Torch toggle error:", err);
    }
  };

  /**
   * Handle successful QR code decode
   */
  const handleDecode = (text) => {
    const scanResult = parseScannedQrCode(text);
    if (!scanResult) return;

    playScanBeep();
    setDetectedId(scanResult.id);
    stopCamera();

    setTimeout(() => {
      onScanSuccess(scanResult);
    }, 600);
  };

  /**
   * Handle QR image upload file
   */
  const handleFileUpload = async (file) => {
    if (!file) return;

    setScannerError("");
    setIsProcessingFile(true);

    try {
      const fileScanner = new Html5Qrcode("embedded-file-reader-dummy");
      const decodedText = await fileScanner.scanFile(file, false);
      fileScanner.clear();
      setIsProcessingFile(false);

      if (decodedText) {
        handleDecode(decodedText);
      } else {
        setScannerError("No readable QR code found in this photo. Please upload a clear, well-lit snapshot.");
      }
    } catch (err) {
      setIsProcessingFile(false);
      setScannerError("Could not recognize a valid QR code in this image. Please ensure the QR code is clearly visible.");
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="glass-card rounded-3xl border-2 border-primary/30 p-5 sm:p-8 space-y-6 relative overflow-hidden bg-darkNavy/90 shadow-[0_0_50px_rgba(0,229,255,0.15)]">
      {/* Scoped CSS to ensure HTML5Qrcode video fills the viewfinder cleanly with zero distortion */}
      <style>{`
        #${readerElementId} {
          width: 100% !important;
          height: 100% !important;
          position: relative !important;
          border: none !important;
          overflow: hidden !important;
          border-radius: 1.25rem !important;
        }
        #${readerElementId} video {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
          border-radius: 1.25rem !important;
        }
        #${readerElementId} img {
          display: none !important;
        }
        #${readerElementId}__scan_region {
          background: transparent !important;
        }
        #${readerElementId}__dashboard {
          display: none !important;
        }
      `}</style>

      {/* Header Station Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-primary/20">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 via-primary to-accent p-0.5 shadow-neon flex-shrink-0">
            <div className="w-full h-full bg-darkNavy rounded-[14px] flex items-center justify-center">
              <ScanLine className={`w-5 h-5 ${isScanning ? "text-cyan-300 animate-pulse" : "text-gray-400"}`} />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-accent font-bold">
                SECRETARIAT OPTICAL VERIFIER
              </span>
              <span className={`w-2 h-2 rounded-full ${isScanning ? "bg-emerald-400 animate-ping" : "bg-gray-500"}`} />
            </div>
            <h3 className="text-lg sm:text-xl font-black font-orbitron text-white">
              Instant Badge Scanner
            </h3>
          </div>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex bg-black/40 p-1 rounded-2xl border border-primary/30 self-start sm:self-auto shadow-inner">
          <button
            type="button"
            onClick={() => setActiveMode("camera")}
            className={`py-2 px-4 rounded-xl text-xs font-orbitron font-bold flex items-center space-x-1.5 transition-all ${
              activeMode === "camera"
                ? "bg-gradient-to-r from-cyan-500 to-primary text-darkNavy shadow-neon font-black"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Live Camera</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveMode("upload");
              stopCamera();
            }}
            className={`py-2 px-4 rounded-xl text-xs font-orbitron font-bold flex items-center space-x-1.5 transition-all ${
              activeMode === "upload"
                ? "bg-gradient-to-r from-cyan-500 to-primary text-darkNavy shadow-neon font-black"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Photo</span>
          </button>
        </div>
      </div>

      {/* Main Viewport Container */}
      <div className="relative rounded-3xl overflow-hidden bg-black/85 border-2 border-primary/30 aspect-square max-w-[360px] mx-auto flex items-center justify-center shadow-[0_0_40px_rgba(0,0,0,0.8)]">
        {activeMode === "camera" ? (
          <>
            {/* HTML5 QR Code Mount Node */}
            <div id={readerElementId} className="w-full h-full overflow-hidden" />

            {/* Inactive State / Permission Activation Prompt */}
            {!isScanning && !detectedId && (
              <div className="absolute inset-0 bg-darkNavy/95 flex flex-col items-center justify-center p-6 text-center space-y-4 z-10">
                <div className="relative w-20 h-20 rounded-3xl bg-accent/10 border-2 border-accent/40 flex items-center justify-center text-accent shadow-[0_0_30px_rgba(0,229,255,0.3)]">
                  <Camera className="w-10 h-10 animate-pulse" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-darkNavy animate-ping" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-white font-bold font-orbitron text-base">
                    Camera Authenticator Ready
                  </h4>
                  <p className="text-gray-400 text-xs font-mono max-w-[240px] mx-auto">
                    Activate camera to scan official TechXpo 2.O delegate badges in real time
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleStartCameraClick}
                  disabled={isRequestingPermission}
                  className="btn-primary py-3.5 px-7 text-xs font-orbitron font-bold flex items-center space-x-2.5 shadow-neon hover:scale-105 active:scale-95 transition-all"
                >
                  {isRequestingPermission ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-darkNavy" />
                      <span>Requesting Camera...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 text-darkNavy" />
                      <span>Start Camera Scanner</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Active Cyber Reticle HUD */}
            {isScanning && !detectedId && (
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-between p-6 z-10">
                {/* Top Corner Brackets */}
                <div className="w-full flex justify-between">
                  <div className="w-8 h-8 border-t-4 border-l-4 border-cyan-400 rounded-tl-xl shadow-[0_0_15px_#00e5ff]" />
                  <div className="w-8 h-8 border-t-4 border-r-4 border-cyan-400 rounded-tr-xl shadow-[0_0_15px_#00e5ff]" />
                </div>

                {/* Center Crosshairs & Laser Sweep */}
                <div className="relative w-48 h-48 flex items-center justify-center">
                  {/* Outer Targeting Ring */}
                  <div className="absolute inset-0 border border-cyan-500/30 rounded-2xl animate-pulse" />
                  {/* Central Reticle */}
                  <div className="w-4 h-4 border-t-2 border-l-2 border-r-2 border-b-2 border-cyan-400/60 rounded" />

                  {/* Animated Laser Sweep Beam */}
                  <motion.div
                    animate={{ y: [-75, 75, -75] }}
                    transition={{ duration: 2.0, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute w-56 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_20px_#00e5ff]"
                  />
                </div>

                {/* Bottom Corner Brackets */}
                <div className="w-full flex justify-between">
                  <div className="w-8 h-8 border-b-4 border-l-4 border-cyan-400 rounded-bl-xl shadow-[0_0_15px_#00e5ff]" />
                  <div className="w-8 h-8 border-b-4 border-r-4 border-cyan-400 rounded-br-xl shadow-[0_0_15px_#00e5ff]" />
                </div>

                {/* HUD Live Status Pill */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-darkNavy/90 border border-cyan-500/40 text-[10px] font-mono text-cyan-300 font-bold tracking-widest flex items-center space-x-1.5 shadow-lg">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  <span>ALIGN QR WITH RETICLE</span>
                </div>
              </div>
            )}
          </>
        ) : (
          /* Upload Viewport with Drag & Drop */
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragOver(false);
              const file = e.dataTransfer.files?.[0];
              if (file) handleFileUpload(file);
            }}
            className={`w-full h-full p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all border-2 border-dashed rounded-3xl ${
              isDragOver
                ? "bg-accent/10 border-accent scale-95"
                : "border-primary/40 hover:bg-white/[0.03] hover:border-accent/60"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file);
              }}
              className="hidden"
            />
            <div className="w-20 h-20 rounded-3xl bg-primary/15 border-2 border-primary/40 flex items-center justify-center text-accent mb-4 shadow-neon group-hover:scale-110 transition-transform">
              <Upload className="w-9 h-9 animate-bounce text-accent" />
            </div>
            <h4 className="text-white font-bold font-orbitron text-base mb-1">
              Drop or Select QR Image
            </h4>
            <p className="text-gray-400 text-xs font-mono max-w-[220px]">
              Tap to browse photos or snap an image of the delegate ID card
            </p>

            {isProcessingFile && (
              <div className="mt-4 flex items-center space-x-2 text-accent text-xs font-mono font-bold animate-pulse px-3 py-1.5 rounded-full bg-primary/20 border border-accent/40">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Decoding Cryptographic Signature...</span>
              </div>
            )}
          </div>
        )}

        {/* Scan Success Confirmation Overlay */}
        <AnimatePresence>
          {detectedId && (
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              className="absolute inset-0 bg-darkNavy/95 flex flex-col items-center justify-center p-6 text-center space-y-3.5 z-20"
            >
              <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 shadow-[0_0_40px_rgba(16,185,129,0.6)]">
                <CheckCircle2 className="w-12 h-12 animate-pulse" />
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 font-bold block">
                  QR CODE AUTHENTICATED
                </span>
                <div className="text-2xl sm:text-3xl font-black font-orbitron text-white">
                  {detectedId}
                </div>
              </div>
              <p className="text-gray-300 text-xs font-mono">
                Loading official dossier...
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Camera Live Controls Toolbar (when scanning is active) */}
      {activeMode === "camera" && isScanning && (
        <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
          {cameras.length > 1 && (
            <button
              type="button"
              onClick={handleFlipCamera}
              className="py-2 px-3.5 rounded-xl bg-darkNavy border border-primary/30 text-gray-300 hover:text-white text-xs font-mono font-bold flex items-center space-x-2 transition-all hover:bg-white/5 active:scale-95"
              title="Flip to next camera device"
            >
              <SwitchCamera className="w-4 h-4 text-accent" />
              <span>Flip Camera ({selectedCameraIndex + 1}/{cameras.length})</span>
            </button>
          )}

          {torchAvailable && (
            <button
              type="button"
              onClick={handleToggleTorch}
              className={`py-2 px-3.5 rounded-xl border text-xs font-mono font-bold flex items-center space-x-2 transition-all active:scale-95 ${
                torchOn
                  ? "bg-amber-500/20 border-amber-500 text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.4)]"
                  : "bg-darkNavy border-primary/30 text-gray-300 hover:text-white"
              }`}
              title="Toggle flashlight"
            >
              <Flashlight className={`w-4 h-4 ${torchOn ? "text-amber-400" : "text-gray-400"}`} />
              <span>{torchOn ? "Flashlight On" : "Flashlight Off"}</span>
            </button>
          )}

          <button
            type="button"
            onClick={stopCamera}
            className="py-2 px-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 hover:bg-red-500/20 text-xs font-mono font-bold flex items-center space-x-2 transition-all active:scale-95"
            title="Stop live camera scanner"
          >
            <Square className="w-3.5 h-3.5" />
            <span>Stop Camera</span>
          </button>
        </div>
      )}

      {/* Hidden dummy node for file scanning */}
      <div id="embedded-file-reader-dummy" className="hidden" />

      {/* Error Notice & Instructions */}
      {scannerError && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs leading-relaxed max-w-lg mx-auto shadow-lg"
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400 mt-0.5" />
          <div className="flex-1 space-y-2">
            <p className="font-semibold text-white">{scannerError}</p>
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={handleStartCameraClick}
                className="px-3.5 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-white font-mono text-[11px] font-bold transition-all flex items-center space-x-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Camera Permission</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveMode("upload");
                  setScannerError("");
                }}
                className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-accent font-mono text-[11px] font-bold transition-all"
              >
                Upload Photo Instead &rarr;
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Footer Instructions */}
      <div className="text-center pt-1">
        <p className="text-xs text-gray-400 font-mono flex items-center justify-center space-x-1.5">
          <Sparkles className="w-3.5 h-3.5 text-accent" />
          <span>Point device camera or upload image of the official blue TechXpo QR code</span>
        </p>
      </div>
    </div>
  );
}
