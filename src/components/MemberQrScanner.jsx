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
  QrCode,
  X,
  FileImage,
} from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";

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

  // 1. Check if it's a full URL (e.g. https://circuitron2-0.vercel.app/verify/TX2-EX-7264?n=...&img=...)
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
 * Play futuristic audio beep upon successful scan
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
  const [cameras, setCameras] = useState([]);
  const [cameraIndex, setCameraIndex] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [scannerError, setScannerError] = useState("");
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [successResult, setSuccessResult] = useState(null);

  const html5QrCodeRef = useRef(null);
  const readerIdRef = useRef(`member-qr-reader-${Math.random().toString(36).substring(2, 9)}`);
  const fileInputRef = useRef(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      stopCamera();
    };
  }, []);

  // Fetch available cameras on mount
  useEffect(() => {
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length > 0 && isMountedRef.current) {
          setCameras(devices);
        }
      })
      .catch(() => {
        // Cameras will be requested when user clicks Start
      });
  }, []);

  // Auto-start camera if requested
  useEffect(() => {
    if (autoStart && activeTab === "camera" && !isScanning && !isStarting) {
      startCamera();
    }
  }, [autoStart]);

  // Clean up and stop camera
  const stopCamera = async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
        html5QrCodeRef.current.clear();
      } catch (err) {
        console.warn("Camera stop warning:", err);
      } finally {
        html5QrCodeRef.current = null;
        if (isMountedRef.current) {
          setIsScanning(false);
          setIsStarting(false);
        }
      }
    }
  };

  // Start live camera stream
  const startCamera = async (targetCameraId = null) => {
    if (isStarting || isScanning) return;
    setIsStarting(true);
    setScannerError("");
    setSuccessResult(null);

    const containerId = readerIdRef.current;
    const element = document.getElementById(containerId);
    if (!element) {
      setIsStarting(false);
      return;
    }

    try {
      await stopCamera();
      element.innerHTML = "";

      const qrScanner = new Html5Qrcode(containerId);
      html5QrCodeRef.current = qrScanner;

      // Determine camera config: preferred device ID or mobile rear camera
      let cameraConfig = { facingMode: "environment" };
      if (targetCameraId) {
        cameraConfig = { deviceId: { exact: targetCameraId } };
      } else if (cameras.length > 0 && cameras[cameraIndex]) {
        cameraConfig = { deviceId: { exact: cameras[cameraIndex].id } };
      }

      await qrScanner.start(
        cameraConfig,
        {
          fps: 15,
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            const minDim = Math.min(viewfinderWidth, viewfinderHeight);
            const boxSize = Math.max(200, Math.floor(minDim * 0.72));
            return { width: boxSize, height: boxSize };
          },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          handleScanDecoded(decodedText);
        },
        () => {
          // Frame scan pass - ignore
        }
      );

      if (isMountedRef.current) {
        setIsScanning(true);
        setIsStarting(false);
        // Refresh camera list if not loaded yet
        if (cameras.length === 0) {
          Html5Qrcode.getCameras().then((devs) => {
            if (devs && devs.length > 0 && isMountedRef.current) setCameras(devs);
          });
        }
      }
    } catch (err) {
      console.error("Camera start error:", err);
      if (isMountedRef.current) {
        setIsStarting(false);
        setIsScanning(false);
        const errMsg = String(err?.message || err || "").toLowerCase();
        if (errMsg.includes("permission") || errMsg.includes("notallowederror")) {
          setScannerError("Camera access permission was denied. Please allow camera permissions in your browser or switch to Badge Photo Upload.");
        } else if (errMsg.includes("notfounderror") || errMsg.includes("devicesnotfound")) {
          setScannerError("No video camera found on this device. Please use Badge Photo Upload to verify member credentials.");
        } else {
          setScannerError("Unable to initialize camera stream. Please try switching cameras or use Badge Photo Upload.");
        }
      }
    }
  };

  // Flip between front and rear cameras
  const handleFlipCamera = async () => {
    if (cameras.length <= 1) {
      // Toggle facingMode between user and environment
      const nextMode = cameraIndex === 0 ? 1 : 0;
      setCameraIndex(nextMode);
      await stopCamera();
      startCamera();
      return;
    }
    const nextIndex = (cameraIndex + 1) % cameras.length;
    setCameraIndex(nextIndex);
    const nextCamera = cameras[nextIndex];
    await stopCamera();
    startCamera(nextCamera.id);
  };

  // Handle successful QR decode from either camera or photo upload
  const handleScanDecoded = (decodedText) => {
    const parsed = parseScannedQrCode(decodedText);
    if (!parsed || !parsed.id) {
      setScannerError("Scanned QR code does not contain a valid TechXpo 2.O credential format.");
      return;
    }

    playScanBeep();
    setSuccessResult(parsed.id);

    // Stop scanning immediately to freeze camera
    stopCamera();

    // Trigger parent callback after brief visual confirmation
    setTimeout(() => {
      if (onScanSuccess) {
        onScanSuccess(parsed);
      }
    }, 450);
  };

  // Handle badge photo upload / snapshot
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingFile(true);
    setScannerError("");
    setSuccessResult(null);

    try {
      await stopCamera();
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
      setScannerError("Could not detect a valid TechXpo 2.O QR code in the uploaded image. Please ensure the QR code is clearly visible and well-lit.");
    } finally {
      if (isMountedRef.current) {
        setIsProcessingFile(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="glass-card rounded-3xl border-2 border-primary/30 p-5 sm:p-7 bg-darkNavy/95 shadow-[0_0_50px_rgba(0,229,255,0.15)] relative overflow-hidden">
      
      {/* Reticle Ambience */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

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
            onClick={onClose}
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
              setScannerError("");
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
              setScannerError("");
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
            <div className="relative w-full aspect-square max-w-[340px] sm:max-w-[380px] mx-auto rounded-3xl overflow-hidden border-2 border-primary/40 bg-black/90 shadow-[inset_0_0_40px_rgba(0,0,0,0.8)] flex items-center justify-center">
              
              {/* HTML5 QR Code Mount Node */}
              <div
                id={readerIdRef.current}
                className="w-full h-full object-cover [&_video]:w-full [&_video]:h-full [&_video]:object-cover"
              />

              {/* Inactive Standby View (When Camera Not Running) */}
              {!isScanning && !isStarting && !successResult && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-4 bg-gradient-to-b from-darkNavy/80 via-black/80 to-darkNavy/90 z-10 backdrop-blur-sm">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center text-cyan-400 shadow-neon">
                    <QrCode className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold font-orbitron text-sm">
                      Camera Scanner Standby
                    </h4>
                    <p className="text-gray-400 text-xs font-mono max-w-[220px] mx-auto mt-1 leading-relaxed">
                      Point at any TechXpo 2.O ID badge or participant card
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => startCamera()}
                    className="btn-primary py-3 px-6 text-xs font-orbitron font-bold flex items-center space-x-2 shadow-neon hover:scale-105 transition-all"
                  >
                    <Play className="w-4 h-4 text-darkNavy fill-darkNavy" />
                    <span>Start Camera</span>
                  </button>
                </div>
              )}

              {/* Initializing / Loading Spinner */}
              {isStarting && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-3 bg-black/90 z-10">
                  <RefreshCw className="w-10 h-10 text-accent animate-spin" />
                  <p className="text-white font-mono text-xs font-bold tracking-wider animate-pulse">
                    Accessing Camera Stream...
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
                  <span>Flip Camera</span>
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

        {/* Error Feedback Notice */}
        {scannerError && (
          <div className="mt-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-start space-x-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400 mt-0.5" />
            <div className="flex-1 space-y-1">
              <span className="block">{scannerError}</span>
              {activeTab === "camera" && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("upload");
                    setScannerError("");
                  }}
                  className="text-accent underline font-semibold hover:text-white"
                >
                  Try Badge Photo Upload instead &rarr;
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
