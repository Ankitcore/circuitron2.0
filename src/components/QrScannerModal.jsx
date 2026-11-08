import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  Upload,
  X,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  QrCode,
  Sparkles,
  Zap,
  Maximize2,
  FileText,
} from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";

/**
 * Smart parsing of scanned QR code content.
 * Extracts TechXpo member ID whether raw (TX2-XX-XXXX) or inside a URL.
 */
export function parseScannedQrCode(decodedText = "") {
  if (!decodedText) return null;
  const text = String(decodedText).trim();

  // 1. Direct TechXpo ID pattern (TX2-FC-8492, TX2-EX-7264, TX2-CT-5819, TX2-PT-1234, TX2-VL-5678)
  const idMatch = text.match(/TX2-[A-Z]{2}-[0-9A-Z]+/i);
  if (idMatch) {
    return idMatch[0].toUpperCase();
  }

  // 2. Check URL structure (e.g. https://circuitron2-0.vercel.app/verify/TX2-EX-9531)
  try {
    const url = new URL(text);
    const pathParts = url.pathname.split("/").filter(Boolean);
    const verifyIdx = pathParts.findIndex((p) => p.toLowerCase() === "verify");
    if (verifyIdx !== -1 && pathParts[verifyIdx + 1]) {
      return pathParts[verifyIdx + 1].toUpperCase();
    }
    const queryId = url.searchParams.get("id");
    if (queryId) return queryId.trim().toUpperCase();
  } catch (err) {
    // Not a valid URL, continue
  }

  // 3. Fallback to clean trimmed uppercase string
  return text.toUpperCase();
}

/**
 * Play futuristic audio beep upon successful scan
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

export default function QrScannerModal({ isOpen, onClose, onScanSuccess }) {
  const [activeMode, setActiveMode] = useState("camera"); // "camera" | "upload"
  const [cameras, setCameras] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scannerError, setScannerError] = useState("");
  const [lastScannedResult, setLastScannedResult] = useState(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);

  const html5QrCodeRef = useRef(null);
  const readerElementId = "techxpo-qr-reader";
  const fileInputRef = useRef(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Discover available cameras when modal opens
  useEffect(() => {
    if (!isOpen) return;

    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length > 0) {
          setCameras(devices);
          // Prefer back camera if available
          const backCamera = devices.find(
            (c) =>
              c.label.toLowerCase().includes("back") ||
              c.label.toLowerCase().includes("rear") ||
              c.label.toLowerCase().includes("environment")
          );
          setSelectedCameraId(backCamera ? backCamera.id : devices[0].id);
        } else {
          setCameras([]);
        }
      })
      .catch((err) => {
        console.warn("Could not list cameras:", err);
      });
  }, [isOpen]);

  // Handle Starting / Stopping camera stream
  useEffect(() => {
    if (!isOpen || activeMode !== "camera") {
      stopCamera();
      return;
    }

    let isMounted = true;
    const startTimeout = setTimeout(() => {
      if (isMounted) {
        startCamera(selectedCameraId);
      }
    }, 250);

    return () => {
      isMounted = false;
      clearTimeout(startTimeout);
      stopCamera();
    };
  }, [isOpen, activeMode, selectedCameraId]);

  const startCamera = async (cameraId) => {
    setScannerError("");
    const element = document.getElementById(readerElementId);
    if (!element) return;

    try {
      // Ensure any existing instance is stopped
      await stopCamera();

      const qrCodeScanner = new Html5Qrcode(readerElementId);
      html5QrCodeRef.current = qrCodeScanner;

      const cameraConfig = cameraId
        ? { deviceId: { exact: cameraId } }
        : { facingMode: "environment" };

      await qrCodeScanner.start(
        cameraConfig,
        {
          fps: 12,
          qrbox: { width: 260, height: 260 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          handleSuccessfulDecode(decodedText);
        },
        () => {
          // Frame failure (expected during search), no-op
        }
      );

      setIsScanning(true);
    } catch (err) {
      console.error("Camera start error:", err);
      setIsScanning(false);
      const msg = String(err).toLowerCase();
      if (msg.includes("permission") || msg.includes("denied") || msg.includes("notallowed")) {
        setScannerError(
          "Camera access was denied. Please allow camera permissions in your browser or switch to 'Upload QR Image'."
        );
      } else if (msg.includes("notfound") || msg.includes("no camera")) {
        setScannerError(
          "No camera detected on this device. You can upload an image of the ID card QR code instead."
        );
      } else {
        setScannerError(
          "Unable to start camera stream. Please ensure no other app is using your webcam, or use the image upload option."
        );
      }
    }
  };

  const stopCamera = async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
        html5QrCodeRef.current.clear();
      } catch (err) {
        console.warn("Error stopping QR camera:", err);
      } finally {
        html5QrCodeRef.current = null;
        setIsScanning(false);
      }
    }
  };

  const handleSuccessfulDecode = (decodedText) => {
    const parsedId = parseScannedQrCode(decodedText);
    if (!parsedId) return;

    playScanBeep();
    setLastScannedResult(parsedId);

    // Stop camera and trigger callback with slight delay for visual feedback
    stopCamera();

    setTimeout(() => {
      onScanSuccess(parsedId);
      onClose();
    }, 700);
  };

  // Handle Uploading a QR Image file
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScannerError("");
    setIsProcessingFile(true);

    try {
      // Create temporary scanner instance for file scanning
      const fileScanner = new Html5Qrcode("techxpo-file-reader-dummy");
      const decodedText = await fileScanner.scanFile(file, false);
      fileScanner.clear();
      setIsProcessingFile(false);

      if (decodedText) {
        handleSuccessfulDecode(decodedText);
      } else {
        setScannerError("No readable QR code found in this image. Please upload a clear photo of the ID card.");
      }
    } catch (err) {
      console.error("File QR decode error:", err);
      setIsProcessingFile(false);
      setScannerError("Could not detect a valid QR code in this image. Please upload a high-contrast photo or use camera.");
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-darkNavy/85 backdrop-blur-md transition-opacity"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 350, damping: 28 }}
          className="relative w-full max-w-lg glass-card rounded-3xl border-2 border-primary/40 p-6 sm:p-8 bg-darkNavy/95 shadow-[0_0_60px_rgba(0,229,255,0.25)] z-10 space-y-6"
        >
          {/* Header */}
          <div className="flex items-start justify-between pb-4 border-b border-primary/20">
            <div className="flex items-center space-x-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-primary to-accent p-0.5 shadow-neon">
                <div className="w-full h-full bg-darkNavy rounded-[14px] flex items-center justify-center">
                  <QrCode className="w-6 h-6 text-accent animate-pulse" />
                </div>
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-accent font-bold block">
                  TECHXPO 2.O SECRETARIAT
                </span>
                <h3 className="text-xl font-black font-orbitron text-white">
                  Live QR Authenticator
                </h3>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              title="Close Scanner"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mode Switch Tabs (Camera vs Upload) */}
          <div className="flex bg-darkNavy/80 p-1.5 rounded-2xl border border-primary/20 gap-1.5">
            <button
              type="button"
              onClick={() => setActiveMode("camera")}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-orbitron font-bold flex items-center justify-center space-x-2 transition-all ${
                activeMode === "camera"
                  ? "bg-accent text-darkNavy shadow-neon"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>Camera Stream</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMode("upload")}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-orbitron font-bold flex items-center justify-center space-x-2 transition-all ${
                activeMode === "upload"
                  ? "bg-accent text-darkNavy shadow-neon"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>Upload QR Image</span>
            </button>
          </div>

          {/* Camera Selector (if multiple cameras available) */}
          {activeMode === "camera" && cameras.length > 1 && (
            <div className="flex items-center justify-between text-xs font-mono text-gray-300">
              <span className="text-gray-400">Select Camera:</span>
              <select
                value={selectedCameraId}
                onChange={(e) => setSelectedCameraId(e.target.value)}
                className="bg-darkNavy border border-primary/30 rounded-xl px-3 py-1.5 text-accent text-xs font-mono focus:outline-none focus:border-accent max-w-[240px]"
              >
                {cameras.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label || `Camera ${c.id.slice(0, 8)}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Viewport Area */}
          <div className="relative rounded-2xl overflow-hidden bg-black/80 border border-primary/30 aspect-square max-w-[340px] mx-auto flex items-center justify-center shadow-inner">
            {activeMode === "camera" ? (
              <>
                {/* HTML5 QR Code Mount Node */}
                <div id={readerElementId} className="w-full h-full overflow-hidden" />

                {/* Cybernetic Reticle HUD Overlay */}
                {isScanning && !lastScannedResult && (
                  <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-between p-6">
                    {/* Corner Accent Brackets */}
                    <div className="w-full flex justify-between">
                      <div className="w-8 h-8 border-t-2 border-l-2 border-accent rounded-tl-lg" />
                      <div className="w-8 h-8 border-t-2 border-r-2 border-accent rounded-tr-lg" />
                    </div>

                    {/* Animated Cyber Laser Scanning Beam */}
                    <motion.div
                      animate={{ y: [-80, 80, -80] }}
                      transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                      className="w-48 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#00e5ff]"
                    />

                    {/* Corner Accent Brackets */}
                    <div className="w-full flex justify-between">
                      <div className="w-8 h-8 border-b-2 border-l-2 border-accent rounded-bl-lg" />
                      <div className="w-8 h-8 border-b-2 border-r-2 border-accent rounded-br-lg" />
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* Upload Mode Viewport */
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-full p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-white/[0.02] transition-colors border-2 border-dashed border-primary/30 rounded-2xl"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center text-accent mb-4 group-hover:scale-110 transition-transform">
                  <Upload className="w-8 h-8 animate-bounce" />
                </div>

                <h4 className="text-white font-bold font-orbitron text-sm mb-1">
                  Click or Drag &amp; Drop
                </h4>
                <p className="text-gray-400 text-xs font-mono max-w-[200px]">
                  Upload an official TechXpo ID card photo or QR snapshot
                </p>

                {isProcessingFile && (
                  <div className="mt-4 flex items-center space-x-2 text-accent text-xs font-mono font-bold animate-pulse">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Decoding QR image...</span>
                  </div>
                )}
              </div>
            )}

            {/* Success Overlay when decoded */}
            {lastScannedResult && (
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
                    CREDENTIAL IDENTIFIED
                  </span>
                  <div className="text-2xl font-black font-orbitron text-white mt-1">
                    {lastScannedResult}
                  </div>
                </div>
                <p className="text-gray-300 text-xs font-mono">
                  Redirecting to official verification dossier...
                </p>
              </motion.div>
            )}
          </div>

          {/* Dummy hidden element for file scanning */}
          <div id="techxpo-file-reader-dummy" className="hidden" />

          {/* Error Notice */}
          {scannerError && (
            <div className="flex items-start space-x-2.5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs leading-relaxed">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400 mt-0.5" />
              <div className="flex-1">
                <span>{scannerError}</span>
                {activeMode === "camera" && (
                  <button
                    type="button"
                    onClick={() => setActiveMode("upload")}
                    className="block text-accent underline mt-1 font-semibold hover:text-white"
                  >
                    Switch to upload image instead &rarr;
                  </button>
                )}
              </div>
            </div>
          )}

          {/* User Instructions / Footer */}
          <div className="pt-2 text-center space-y-2 border-t border-white/5">
            <p className="text-xs text-gray-400 font-mono flex items-center justify-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              <span>Position the royal blue verification QR code inside the frame</span>
            </p>
            <div className="flex justify-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-6 rounded-xl border border-white/10 text-gray-300 text-xs font-orbitron font-bold hover:bg-white/5 hover:text-white transition-all"
              >
                Cancel / Return
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
